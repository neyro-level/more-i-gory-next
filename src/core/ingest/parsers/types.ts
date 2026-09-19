export type FeedParserSlug = "yrl";

export type FeedIssueSeverity = "info" | "warning" | "error" | "critical";

export type FeedParseIssue = {
  severity: FeedIssueSeverity;
  code: string;
  message: string;
  externalId?: string;
  path?: string;
  details?: Record<string, unknown>;
};

export type ParsedFeedOffer = {
  externalId: string;
  title?: string;
  price?: string;
  address?: string;
  source: Record<string, string>;
};

export type FeedParserLimits = {
  maxBytes: number;
  maxDepth: number;
  maxOffers: number;
  maxTextLength: number;
  timeoutMs: number;
  chunkSize: number;
};

export type FeedParserInput = {
  parser: string | null | undefined;
  xml: string | Iterable<string>;
  limits?: Partial<FeedParserLimits>;
  nowMs?: () => number;
};

export type FeedParserStreamInput = {
  parser: string | null | undefined;
  body: AsyncIterable<Uint8Array>;
  limits?: Partial<FeedParserLimits>;
  nowMs?: () => number;
};

export type FeedParserResult = {
  parser: FeedParserSlug | "unknown";
  offers: ParsedFeedOffer[];
  issues: FeedParseIssue[];
  offeredCount: number;
  skippedCount: number;
  suspicious: boolean;
};

export type FeedParserStreamResult = FeedParserResult & {
  feedHash: string;
};
