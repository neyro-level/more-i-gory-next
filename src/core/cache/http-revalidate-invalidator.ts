import {
  createHttpCacheInvalidator,
  type CacheInvalidator,
} from "./invalidation.ts";
import { createSafeOutboundClient, type SafeOutboundClient } from "../security/outbound-http/index.ts";

type HttpRevalidateEnv = {
  INTERNAL_REVALIDATE_BASE_URL?: string;
  OUTBOUND_ALLOWED_HOSTS?: string;
  REVALIDATE_SECRET?: string;
};

function parseAllowedHosts(raw: string | undefined): readonly string[] {
  if (!raw) return [];
  return [
    ...new Set(
      raw
        .split(",")
        .map((host) => host.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

function createRevalidateOutboundClient(envSlice: HttpRevalidateEnv): SafeOutboundClient {
  const hosts = new Set(parseAllowedHosts(envSlice.OUTBOUND_ALLOWED_HOSTS));
  if (envSlice.INTERNAL_REVALIDATE_BASE_URL) {
    hosts.add(new URL(envSlice.INTERNAL_REVALIDATE_BASE_URL).hostname.toLowerCase());
  }
  return createSafeOutboundClient({ allowedHosts: [...hosts] });
}

async function resolveOutbound(
  outbound: SafeOutboundClient | (() => SafeOutboundClient | Promise<SafeOutboundClient>) | undefined,
  envSlice: HttpRevalidateEnv,
): Promise<SafeOutboundClient> {
  if (!outbound) return createRevalidateOutboundClient(envSlice);
  return typeof outbound === "function" ? await outbound() : outbound;
}

export async function createHttpRevalidateInvalidator(deps?: {
  loadEnv?: () => HttpRevalidateEnv | Promise<HttpRevalidateEnv>;
  outbound?: SafeOutboundClient | (() => SafeOutboundClient | Promise<SafeOutboundClient>);
}): Promise<CacheInvalidator> {
  return createHttpCacheInvalidator(async (targets) => {
    const envSlice = deps?.loadEnv ? await deps.loadEnv() : (await import("../../project/env.ts")).env;
    if (!envSlice.REVALIDATE_SECRET || !envSlice.INTERNAL_REVALIDATE_BASE_URL) {
      throw new Error("HTTP cache invalidation is not configured.");
    }
    const outbound = await resolveOutbound(deps?.outbound, envSlice);
    const response = await outbound.request({
      body: new TextEncoder().encode(JSON.stringify({ targets })),
      headers: {
        authorization: `Bearer ${envSlice.REVALIDATE_SECRET}`,
        "content-type": "application/json",
      },
      maxResponseBytes: 64 * 1024,
      method: "POST",
      timeoutMs: 15_000,
      url: new URL("/api/internal/revalidate", envSlice.INTERNAL_REVALIDATE_BASE_URL),
    });
    if (response.status < 200 || response.status >= 300) {
      throw new Error("internal revalidate failed");
    }
  });
}
