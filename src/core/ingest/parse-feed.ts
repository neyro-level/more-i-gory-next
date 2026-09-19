import { parseFeedStreamByRegistry } from "./parsers/registry.ts";
import type { FeedParserResult } from "./parsers/types.ts";
import type { FeedFetchResult } from "./fetch-feed.ts";

export async function parseFetchedFeed(args: {
  parser: string | null | undefined;
  fetch: FeedFetchResult;
}): Promise<FeedParserResult & { feedHash: string }> {
  return parseFeedStreamByRegistry({
    body: args.fetch.body,
    parser: args.parser,
  });
}

export function createParseFeedHandler(deps: {
  finalizeSameHash?: (
    input: { feedSourceId: string; importRunId: string },
    fetch: FeedFetchResult & { feedHash: string },
  ) => Promise<boolean>;
  loadParser: (feedSourceId: string) => Promise<string | null>;
}) {
  return async (context: {
    input: { feedSourceId: string; importRunId: string };
    state: { conditional?: { businessWrite: false; kind: "not-modified" | "read-body" | "same-hash" }; fetch?: FeedFetchResult; parse?: FeedParserResult & { feedHash?: string } };
  }) => {
    if (!context.state.fetch) {
      return { continue: false, status: "failed" as const };
    }

    const parser = await deps.loadParser(context.input.feedSourceId);
    const parsed = await parseFetchedFeed({ parser, fetch: context.state.fetch });
    context.state.parse = parsed;

    if (parsed.suspicious || parsed.issues.some((issue) => issue.severity === "critical")) {
      return { continue: false, status: "suspicious" as const };
    }

    if (
      context.state.fetch.previousFeedHash &&
      parsed.feedHash === context.state.fetch.previousFeedHash &&
      deps.finalizeSameHash
    ) {
      const finalized = await deps.finalizeSameHash(context.input, {
        ...context.state.fetch,
        feedHash: parsed.feedHash,
      });
      context.state.conditional = { businessWrite: false, kind: "same-hash" };
      return finalized
        ? { continue: false, status: "unchanged" as const }
        : { continue: false, status: "failed" as const };
    }

    return { continue: true, status: "running" as const };
  };
}
