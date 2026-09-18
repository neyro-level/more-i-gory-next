import "server-only";

import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

import type {
  CacheInvalidationTarget,
  CacheInvalidator,
} from "./invalidator.ts";
import type { StructuredLogger } from "../observability/index.ts";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export type RevalidateEndpointConfig = Readonly<{
  invalidator: CacheInvalidator;
  logger: Pick<StructuredLogger, "info" | "warn" | "error">;
  now?: () => number;
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  secret?: string;
  store?: Map<string, RateLimitBucket>;
}>;

const defaultRateLimit = {
  maxRequests: 30,
  windowMs: 60_000,
} as const;

const pathTargetSchema = z
  .object({
    kind: z.literal("path"),
    path: z.string().trim().min(1).max(200),
    type: z.enum(["layout", "page"]).optional(),
  })
  .strict();

const tagTargetSchema = z
  .object({
    kind: z.literal("tag"),
    tag: z.string().trim().min(1).max(80),
  })
  .strict();

const requestSchema = z
  .object({
    targets: z.array(z.union([pathTargetSchema, tagTargetSchema])).min(1).max(50),
  })
  .strict();

const internalRateLimitStore = new Map<string, RateLimitBucket>();
const tagAllowlist = /^(catalog|catalog-slice(?::[a-z0-9-]+)+|complex(?::[a-z0-9-]+)+|navigation|redirects|site-settings|page(?::[a-z0-9-]+)+|property(?::[a-z0-9-]+)+|region(?::[a-z0-9-]+)+)$/;
const publicPathAllowlist = /^\/$|^\/(?:analitika|consent|investicionnaya-nedvizhimost|kontakty|metodika|novostroyki|o-kompanii|obekty|podbor|privacy)(?:\/[a-z0-9-]+)*\/?$/;

function jsonResponse(body: unknown, init: ResponseInit): Response {
  return Response.json(body, {
    ...init,
    headers: {
      "cache-control": "no-store",
      ...init.headers,
    },
  });
}

function getRequesterKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip")?.trim() || "unknown";
}

function isSameSecret(candidate: string, secret: string): boolean {
  const candidateBuffer = Buffer.from(candidate);
  const secretBuffer = Buffer.from(secret);
  return candidateBuffer.length === secretBuffer.length && timingSafeEqual(candidateBuffer, secretBuffer);
}

function getBearerToken(request: Request): string | undefined {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return undefined;
  return authorization.slice("Bearer ".length).trim();
}

function hasValidSecret(request: Request, secret: string): boolean {
  const candidates = [
    getBearerToken(request),
    request.headers.get("x-revalidate-secret")?.trim(),
  ].filter((value): value is string => Boolean(value));

  return candidates.some((candidate) => isSameSecret(candidate, secret));
}

function checkRateLimit(
  request: Request,
  config: RevalidateEndpointConfig,
): boolean {
  const limit = config.rateLimit ?? defaultRateLimit;
  const now = config.now?.() ?? Date.now();
  const store = config.store ?? internalRateLimitStore;
  const key = getRequesterKey(request);
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + limit.windowMs });
    return true;
  }

  if (existing.count >= limit.maxRequests) return false;

  existing.count += 1;
  return true;
}

function isAllowedTarget(target: CacheInvalidationTarget): boolean {
  if (target.kind === "tag") return tagAllowlist.test(target.tag);
  if (!target.path.startsWith("/") || target.path.startsWith("//")) return false;
  if (target.path.includes("..") || target.path.includes("?") || target.path.includes("#")) return false;
  return publicPathAllowlist.test(target.path);
}

function parseTargets(body: unknown): readonly CacheInvalidationTarget[] {
  const parsed = requestSchema.parse(body);
  if (!parsed.targets.every(isAllowedTarget)) {
    throw new Error("Target is outside the internal revalidation allowlist.");
  }
  return parsed.targets;
}

export async function handleInternalRevalidateRequest(
  request: Request,
  config: RevalidateEndpointConfig,
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, { status: 405, headers: { allow: "POST" } });
  }

  if (!config.secret) {
    config.logger.error("internal revalidate rejected", { reason: "missing_secret" });
    return jsonResponse({ error: "not_configured" }, { status: 503 });
  }

  if (!checkRateLimit(request, config)) {
    config.logger.warn("internal revalidate rejected", { reason: "rate_limited" });
    return jsonResponse({ error: "rate_limited" }, { status: 429 });
  }

  if (!hasValidSecret(request, config.secret)) {
    config.logger.warn("internal revalidate rejected", { reason: "invalid_secret" });
    return jsonResponse({ error: "unauthorized" }, { status: 401 });
  }

  let targets: readonly CacheInvalidationTarget[];
  try {
    targets = parseTargets(await request.json());
  } catch {
    config.logger.warn("internal revalidate rejected", { reason: "invalid_payload" });
    return jsonResponse({ error: "invalid_payload" }, { status: 400 });
  }

  try {
    await config.invalidator.invalidate(targets);
  } catch {
    config.logger.error("internal revalidate failed", { reason: "invalidation_failed", targetCount: targets.length });
    return jsonResponse({ error: "invalidation_failed" }, { status: 500 });
  }

  config.logger.info("internal revalidate completed", { targetCount: targets.length });
  return jsonResponse({ revalidated: true, targetCount: targets.length }, { status: 200 });
}
