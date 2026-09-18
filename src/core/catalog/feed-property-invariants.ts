export type FeedPropertyMarket = "newbuild" | "secondary";

export type FeedPropertyIdentity = {
  externalId?: unknown;
  feedSource?: unknown;
  importHash?: unknown;
  market?: unknown;
  origin?: unknown;
};

function hasIdentityValue(value: unknown): boolean {
  if (value == null || value === "") return false;
  if (typeof value === "object" && "id" in value) {
    return hasIdentityValue((value as { id?: unknown }).id);
  }
  return true;
}

function hasNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function mergeFeedPropertyIdentity(
  original: FeedPropertyIdentity | null | undefined,
  patch: FeedPropertyIdentity,
): FeedPropertyIdentity {
  return {
    externalId: patch.externalId !== undefined ? patch.externalId : original?.externalId,
    feedSource: patch.feedSource !== undefined ? patch.feedSource : original?.feedSource,
    importHash: patch.importHash !== undefined ? patch.importHash : original?.importHash,
    market: patch.market !== undefined ? patch.market : original?.market,
    origin: patch.origin !== undefined ? patch.origin : original?.origin,
  };
}

export function feedOriginIdentityError(record: FeedPropertyIdentity): string | null {
  if (record.origin !== "feed") return null;
  if (!hasIdentityValue(record.feedSource)) {
    return "Feed properties require feedSource.";
  }
  if (!hasNonEmptyString(record.externalId)) {
    return "Feed properties require externalId.";
  }
  if (!hasNonEmptyString(record.importHash)) {
    return "Feed properties require importHash after a successful import.";
  }
  if (record.market !== "secondary" && record.market !== "newbuild") {
    return "Feed properties require market.";
  }
  return null;
}

export function feedMarketMismatchError(
  propertyMarket: unknown,
  feedSourceMarket: unknown,
): string | null {
  if (propertyMarket !== "secondary" && propertyMarket !== "newbuild") {
    return "Feed properties require market.";
  }
  if (feedSourceMarket !== "secondary" && feedSourceMarket !== "newbuild") {
    return "Feed properties require a resolvable feed source market.";
  }
  if (propertyMarket !== feedSourceMarket) {
    return "Property market must match the feed source market.";
  }
  return null;
}

export function resolveFeedSourceId(value: unknown): number | string | null {
  if (value == null || value === "") return null;
  if (typeof value === "object" && value !== null && "id" in value) {
    return resolveFeedSourceId((value as { id?: unknown }).id);
  }
  if (typeof value === "string" || typeof value === "number") return value;
  return null;
}

export function embeddedFeedSourceMarket(value: unknown): FeedPropertyMarket | null {
  if (value && typeof value === "object" && "market" in value) {
    const market = (value as { market?: unknown }).market;
    if (market === "secondary" || market === "newbuild") return market;
  }
  return null;
}
