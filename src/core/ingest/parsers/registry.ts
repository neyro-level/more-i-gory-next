import { createHash } from "node:crypto";

import { parseYrlFeed, parseYrlFeedStream } from "./yrl.ts";
import type {
  FeedParserInput,
  FeedParserResult,
  FeedParserSlug,
  FeedParserStreamInput,
  FeedParserStreamResult,
} from "./types.ts";

const parserAliases = new Map<string, FeedParserSlug>([
  ["yrl", "yrl"],
  ["xml-yrl", "yrl"],
  ["yandex-realty", "yrl"],
]);

export function resolveFeedParserSlug(parser: string | null | undefined): FeedParserSlug | null {
  if (!parser) return null;
  return parserAliases.get(parser.trim().toLowerCase()) ?? null;
}

export function parseFeedByRegistry(input: FeedParserInput): FeedParserResult {
  const parser = resolveFeedParserSlug(input.parser);

  if (parser === "yrl") {
    return parseYrlFeed(input);
  }

  return {
    issues: [
      {
        code: "unknown-parser",
        message: "Feed source parser is not registered.",
        path: "feedSource.parser",
        severity: "critical",
      },
    ],
    offeredCount: 0,
    offers: [],
    parser: "unknown",
    skippedCount: 0,
    suspicious: true,
  };
}

export async function parseFeedStreamByRegistry(input: FeedParserStreamInput): Promise<FeedParserStreamResult> {
  const parser = resolveFeedParserSlug(input.parser);
  if (parser === "yrl") return parseYrlFeedStream(input);

  const hash = createHash("sha256");
  for await (const chunk of input.body) hash.update(chunk);

  return {
    ...(parseFeedByRegistry({ parser: input.parser, xml: "" })),
    feedHash: hash.digest("hex"),
  };
}
