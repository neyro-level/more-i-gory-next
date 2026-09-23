import "server-only";

import { isIP } from "node:net";

import { z } from "zod";

import type { CreateLeadInput } from "@/core/data-access/system/create-lead";
import type { StructuredLogger } from "@/core/observability";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type PublicLeadIntakeConfig = Readonly<{
  activeChannelIds?: readonly string[];
  consentVersion: string;
  createLead: (input: CreateLeadInput) => Promise<{ id: number | string }>;
  enabled: boolean;
  logger: Pick<StructuredLogger, "info" | "warn" | "error">;
  minimumFillTimeMs?: number;
  now?: () => number;
  rateLimit?: {
    maxBuckets?: number;
    maxRequests: number;
    windowMs: number;
  };
  store?: Map<string, RateLimitBucket>;
}>;

const defaultRateLimit = {
  maxBuckets: 10_000,
  maxRequests: 5,
  windowMs: 60_000,
} as const;

const defaultMinimumFillTimeMs = 3_000;
const defaultStore = new Map<string, RateLimitBucket>();

const consentSchema = z
  .object({
    accepted: z.literal(true),
    acceptedAt: z.iso.datetime(),
    version: z.string().trim().min(1).max(80),
  })
  .strict();

const leadPayloadSchema = z
  .object({
    consent: consentSchema,
    email: z.email().max(160).optional(),
    formId: z.string().trim().min(1).max(80).optional(),
    formStartedAt: z.iso.datetime(),
    honeypot: z.string().max(0).optional(),
    message: z.string().trim().min(20).max(2_000),
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(6).max(80),
    sourcePath: z.string().trim().min(1).max(200),
    utm: z.record(z.string().max(80), z.string().max(300)).optional(),
  })
  .strict();

function jsonResponse(body: unknown, init: ResponseInit): Response {
  return Response.json(body, {
    ...init,
    headers: {
      "cache-control": "no-store",
      ...init.headers,
    },
  });
}

function requesterKey(request: Request): string | null {
  // The public runtime is loopback-only. Nginx overwrites this project-owned
  // header with $remote_addr; public Forwarded/X-Forwarded-For/X-Real-IP values
  // are deliberately ignored here.
  const trustedClientIp = request.headers.get("x-moreigory-client-ip")?.trim();
  return trustedClientIp && isIP(trustedClientIp) !== 0 ? trustedClientIp : null;
}

function removeExpiredBuckets(store: Map<string, RateLimitBucket>, now: number): void {
  for (const [key, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(key);
  }
}

function evictSoonestResetBucket(store: Map<string, RateLimitBucket>): void {
  let candidateKey: string | undefined;
  let candidateResetAt = Number.POSITIVE_INFINITY;

  for (const [key, bucket] of store) {
    if (bucket.resetAt < candidateResetAt) {
      candidateKey = key;
      candidateResetAt = bucket.resetAt;
    }
  }

  if (candidateKey !== undefined) store.delete(candidateKey);
}

function checkRateLimit(key: string, config: PublicLeadIntakeConfig): boolean {
  const limit = config.rateLimit ?? defaultRateLimit;
  const now = config.now?.() ?? Date.now();
  const store = config.store ?? defaultStore;
  const maxBuckets = Math.max(1, limit.maxBuckets ?? defaultRateLimit.maxBuckets);

  removeExpiredBuckets(store, now);
  const existing = store.get(key);

  if (!existing) {
    if (store.size >= maxBuckets) evictSoonestResetBucket(store);
    store.set(key, { count: 1, resetAt: now + limit.windowMs });
    return true;
  }

  if (existing.count >= limit.maxRequests) return false;

  existing.count += 1;
  return true;
}

function isSafeSourcePath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("..") && !path.includes("?") && !path.includes("#");
}

function hasMinimumFillTime(formStartedAt: string, config: PublicLeadIntakeConfig): boolean {
  const startedAt = Date.parse(formStartedAt);
  if (!Number.isFinite(startedAt)) return false;
  const now = config.now?.() ?? Date.now();
  return now - startedAt >= (config.minimumFillTimeMs ?? defaultMinimumFillTimeMs);
}

export async function handlePublicLeadRequest(
  request: Request,
  config: PublicLeadIntakeConfig,
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, { status: 405, headers: { allow: "POST" } });
  }

  if (!config.enabled) {
    config.logger.warn("public lead rejected", { reason: "disabled" });
    return jsonResponse({ error: "not_configured" }, { status: 503 });
  }

  const clientIp = requesterKey(request);
  if (clientIp === null) {
    config.logger.warn("public lead rejected", { reason: "trusted_client_ip_missing" });
    return jsonResponse({ error: "not_configured" }, { status: 503 });
  }

  if (!checkRateLimit(clientIp, config)) {
    config.logger.warn("public lead rejected", { reason: "rate_limited" });
    return jsonResponse({ error: "rate_limited" }, { status: 429 });
  }

  let parsed: z.infer<typeof leadPayloadSchema>;
  try {
    parsed = leadPayloadSchema.parse(await request.json());
  } catch {
    config.logger.warn("public lead rejected", { reason: "invalid_payload" });
    return jsonResponse({ error: "invalid_payload" }, { status: 400 });
  }

  if (
    parsed.consent.version !== config.consentVersion ||
    parsed.honeypot !== undefined ||
    !hasMinimumFillTime(parsed.formStartedAt, config) ||
    !isSafeSourcePath(parsed.sourcePath)
  ) {
    config.logger.warn("public lead rejected", { reason: "anti_spam" });
    return jsonResponse({ error: "invalid_payload" }, { status: 400 });
  }

  try {
    await config.createLead({
      activeChannelIds: config.activeChannelIds ?? [],
      consent: {
        accepted: true,
        acceptedAt: new Date(config.now?.() ?? Date.now()).toISOString(),
        version: config.consentVersion,
      },
      email: parsed.email,
      formId: parsed.formId,
      message: parsed.message,
      metadata: {
        requester: "present",
      },
      name: parsed.name,
      phone: parsed.phone,
      sourcePath: parsed.sourcePath,
      utm: parsed.utm,
    });
  } catch {
    config.logger.error("public lead failed", { reason: "create_failed" });
    return jsonResponse({ error: "server_error" }, { status: 500 });
  }

  config.logger.info("public lead accepted", { route: "public_lead_intake" });
  return jsonResponse({ ok: true }, { status: 201 });
}
