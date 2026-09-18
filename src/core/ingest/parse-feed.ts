import { parseFeedByRegistry } from "./parsers/registry.ts";
import type { FeedParserResult } from "./parsers/types.ts";
import type { FeedFetchResult } from "./fetch-feed.ts";

export function decodeFeedXml(body: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: false }).decode(body);
}

export function parseFetchedFeed(args: {
  parser: string | null | undefined;
  fetch: FeedFetchResult;
}): FeedParserResult {
  return parseFeedByRegistry({
    parser: args.parser,
    xml: decodeFeedXml(args.fetch.body),
  });
}

export function createParseFeedHandler(deps: {
  loadParser: (feedSourceId: string) => Promise<string | null>;
}) {
  return async (context: {
    input: { feedSourceId: string };
    state: { fetch?: FeedFetchResult; parse?: FeedParserResult };
  }) => {
    if (!context.state.fetch) {
      return { continue: false, status: "failed" as const };
    }

    const parser = await deps.loadParser(context.input.feedSourceId);
    const parsed = parseFetchedFeed({ parser, fetch: context.state.fetch });
    context.state.parse = parsed;

    if (parsed.suspicious || parsed.issues.some((issue) => issue.severity === "critical")) {
      return { continue: false, status: "failed" as const };
    }

    return { continue: true, status: "running" as const };
  };
}
