import type { FeedParserLimits } from "./types.ts";

export const DEFAULT_FEED_PARSER_LIMITS: FeedParserLimits = {
  chunkSize: 64 * 1024,
  maxBytes: 50 * 1024 * 1024,
  maxDepth: 32,
  maxOffers: 100_000,
  maxTextLength: 16 * 1024,
  timeoutMs: 30_000,
};

export function resolveFeedParserLimits(overrides: Partial<FeedParserLimits> | undefined): FeedParserLimits {
  return { ...DEFAULT_FEED_PARSER_LIMITS, ...overrides };
}

export function* chunkXmlInput(xml: string | Iterable<string>, chunkSize: number): Iterable<string> {
  if (typeof xml !== "string") {
    yield* xml;
    return;
  }

  for (let index = 0; index < xml.length; index += chunkSize) {
    yield xml.slice(index, index + chunkSize);
  }
}
