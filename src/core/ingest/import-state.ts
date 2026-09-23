import { createHash } from "node:crypto";

import type { NormalizedFeedOffer } from "./normalize-feed.ts";

export type ConditionalFeedState = {
  lastEtag?: string | null;
  lastModified?: string | null;
  lastFullRunAt?: string | null;
  lastFeedHash?: string | null;
  lastOfferCount?: number | null;
};

export type ConditionalFeedHeaders = {
  "If-Modified-Since"?: string;
  "If-None-Match"?: string;
};

export type ConditionalFeedResult =
  | { kind: "not-modified"; businessWrite: false }
  | { kind: "read-body"; businessWrite: false };

export type ExistingImportedProperty = {
  externalId: string;
  id: string | number;
  feedSource?: string | number | null;
  importHash?: string | null;
  origin: "feed" | "manual";
  title?: string | null;
};

export type OfferImportPlan =
  | {
      businessWrite: false;
      data: { lastImportRun: string; lastSeenAt: string };
      kind: "touch-seen";
      propertyId: string | number;
    }
  | {
      businessWrite: true;
      data: Omit<NormalizedFeedOffer, "title"> & {
        externalId: string;
        feedSource: string;
        firstSeenAt?: string;
        importHash: string;
        lastImportRun: string;
        lastSeenAt: string;
        market: "newbuild" | "secondary";
        origin: "feed";
      };
      kind: "create" | "update";
      propertyId?: string | number;
    }
  | {
      businessWrite: false;
      kind: "skip-foreign-owner";
      reason: "manual-origin" | "different-feed";
    };

function stableStringify(value: unknown): string {
  if (value == null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`;

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}

export function buildConditionalFeedHeaders(state: ConditionalFeedState): ConditionalFeedHeaders {
  return {
    ...(state.lastEtag ? { "If-None-Match": state.lastEtag } : {}),
    ...(state.lastModified ? { "If-Modified-Since": state.lastModified } : {}),
  };
}

export function classifyConditionalFeedResponse(status: number): ConditionalFeedResult {
  return status === 304 ? { businessWrite: false, kind: "not-modified" } : { businessWrite: false, kind: "read-body" };
}

export function isBaselineImport(state: ConditionalFeedState): boolean {
  return !state.lastFullRunAt && !state.lastFeedHash && state.lastOfferCount == null;
}

export function isFirstFullRun(args: {
  lastFullRunAt?: string | Date | null;
  mode?: "full" | "incremental" | null;
}): boolean {
  if (args.mode !== "full") return false;
  return args.lastFullRunAt == null || args.lastFullRunAt === "";
}

export function createImportHash(offer: NormalizedFeedOffer): string {
  return createHash("sha256").update(stableStringify(offer)).digest("hex");
}

export function planOfferImport(args: {
  existing?: ExistingImportedProperty | null;
  feedMarket: "newbuild" | "secondary";
  feedSourceId: string;
  importRunId: string;
  nowIso: string;
  offer: NormalizedFeedOffer;
}): OfferImportPlan {
  const importHash = createImportHash(args.offer);
  const existing = args.existing;
  const { title: _title, ...normalizedData } = args.offer;

  if (!existing) {
    return {
      businessWrite: true,
      data: {
        ...normalizedData,
        externalId: args.offer.externalId,
        feedSource: args.feedSourceId,
        firstSeenAt: args.nowIso,
        importHash,
        lastImportRun: args.importRunId,
        lastSeenAt: args.nowIso,
        market: args.feedMarket,
        origin: "feed",
      },
      kind: "create",
    };
  }

  if (existing.origin === "manual") {
    return { businessWrite: false, kind: "skip-foreign-owner", reason: "manual-origin" };
  }

  if (existing.feedSource != null && String(existing.feedSource) !== args.feedSourceId) {
    return { businessWrite: false, kind: "skip-foreign-owner", reason: "different-feed" };
  }

  if (existing.importHash === importHash) {
    return {
      businessWrite: false,
      data: {
        lastImportRun: args.importRunId,
        lastSeenAt: args.nowIso,
      },
      kind: "touch-seen",
      propertyId: existing.id,
    };
  }

  return {
    businessWrite: true,
    data: {
      ...normalizedData,
      externalId: args.offer.externalId,
      feedSource: args.feedSourceId,
      importHash,
      lastImportRun: args.importRunId,
      lastSeenAt: args.nowIso,
      market: args.feedMarket,
      origin: "feed",
    },
    kind: "update",
    propertyId: existing.id,
  };
}

export function planSeenTouchBatch(args: {
  importRunId: string;
  nowIso: string;
  propertyIds: Array<string | number>;
}): Array<Extract<OfferImportPlan, { kind: "touch-seen" }>> {
  return args.propertyIds.map((propertyId) => ({
    businessWrite: false,
    data: {
      lastImportRun: args.importRunId,
      lastSeenAt: args.nowIso,
    },
    kind: "touch-seen",
    propertyId,
  }));
}
