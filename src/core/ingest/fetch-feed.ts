import { buildConditionalFeedHeaders } from "./import-state.ts";
import { DEFAULT_FEED_PARSER_LIMITS } from "./parsers/limits.ts";
import {
  SafeOutboundRequestError,
  type SafeOutboundClient,
} from "../security/outbound-http/index.ts";

export type FeedFetchResult = {
  body: AsyncIterable<Uint8Array>;
  contentType: string | null;
  etag: string | null;
  lastModified: string | null;
  previousFeedHash: string | null;
  status: number;
};

export class FeedFetchError extends Error {
  readonly safeCode: string;

  constructor(safeCode: string, message: string) {
    super(message);
    this.name = "FeedFetchError";
    this.safeCode = safeCode;
  }
}

export function parseOutboundAllowedHosts(raw: string | undefined): readonly string[] {
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

export async function fetchFeedDocument(args: {
  feedUrl: string;
  lastEtag?: string | null;
  lastModified?: string | null;
  outbound: SafeOutboundClient;
  maxResponseBytes?: number;
  timeoutMs?: number;
}): Promise<FeedFetchResult> {
  let url: URL;
  try {
    url = new URL(args.feedUrl);
  } catch {
    throw new FeedFetchError("feed_url_invalid", "Resolved feed URL is not valid.");
  }

  const headers = buildConditionalFeedHeaders({
    lastEtag: args.lastEtag,
    lastModified: args.lastModified,
  });

  try {
    const response = await args.outbound.requestStream({
      headers,
      maxResponseBytes: args.maxResponseBytes ?? DEFAULT_FEED_PARSER_LIMITS.maxBytes,
      method: "GET",
      timeoutMs: args.timeoutMs ?? DEFAULT_FEED_PARSER_LIMITS.timeoutMs,
      url,
    });
    return {
      body: response.body,
      contentType: response.contentType,
      etag: response.etag,
      lastModified: response.lastModified,
      previousFeedHash: null,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof SafeOutboundRequestError) {
      throw new FeedFetchError(error.safeCode, "Feed fetch was rejected by the outbound client.");
    }
    throw error;
  }
}

export function createFetchFeedHandler(deps: {
  loadConditionalState: (
    feedSourceId: string,
  ) => Promise<{ lastEtag: string | null; lastFeedHash: string | null; lastModified: string | null }>;
  outbound: SafeOutboundClient | (() => SafeOutboundClient | Promise<SafeOutboundClient>);
  maxResponseBytes?: number;
  timeoutMs?: number;
}) {
  return async (context: {
    input: { feedSourceId: string };
    state: { feedUrl?: string; fetch?: FeedFetchResult };
  }) => {
    try {
      if (!context.state.feedUrl) {
        throw new FeedFetchError("feed_url_missing", "Feed URL was not resolved.");
      }
      const outbound = typeof deps.outbound === "function" ? await deps.outbound() : deps.outbound;
      const conditional = await deps.loadConditionalState(context.input.feedSourceId);
      context.state.fetch = await fetchFeedDocument({
        feedUrl: context.state.feedUrl,
        lastEtag: conditional.lastEtag,
        lastModified: conditional.lastModified,
        outbound,
        maxResponseBytes: deps.maxResponseBytes,
        timeoutMs: deps.timeoutMs,
      });
      context.state.fetch.previousFeedHash = conditional.lastFeedHash;
      return { continue: true, status: "running" as const };
    } catch (error) {
      if (error instanceof FeedFetchError) {
        return { continue: false, status: "failed" as const };
      }
      throw error;
    }
  };
}
