import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";

import { SaxesParser, type SaxesTagPlain } from "saxes";

import { chunkXmlInput, resolveFeedParserLimits } from "./limits.ts";
import type {
  FeedParseIssue,
  FeedParserInput,
  FeedParserResult,
  FeedParserStreamInput,
  FeedParserStreamResult,
  ParsedFeedOffer,
} from "./types.ts";

type MutableOffer = {
  attrs: Record<string, string>;
  fields: Record<string, string>;
  currentField: string | null;
};

const offerFieldNames = new Set([
  "name",
  "title",
  "price",
  "address",
  "url",
  "type",
  "category",
  "property-type",
  "deal-type",
]);
const forbiddenXmlDeclarationPattern = /<!\s*(?:DOCTYPE|ENTITY)\b/i;

function appendText(currentOffer: MutableOffer | null, text: string, maxTextLength: number): void {
  if (!currentOffer?.currentField) return;
  const previous = currentOffer.fields[currentOffer.currentField] ?? "";
  currentOffer.fields[currentOffer.currentField] = (previous + text).slice(0, maxTextLength + 1);
}

function normalizeAttributes(attributes: SaxesTagPlain["attributes"]): Record<string, string> {
  return Object.fromEntries(Object.entries(attributes).map(([key, value]) => [key, String(value)]));
}

function finalizeOffer(offer: MutableOffer): { issue?: FeedParseIssue; parsed?: ParsedFeedOffer } {
  const externalId = offer.attrs.id?.trim() || offer.attrs["internal-id"]?.trim();
  const title = offer.fields.name?.trim() || offer.fields.title?.trim();

  if (!externalId) {
    return {
      issue: {
        code: "offer-missing-external-id",
        message: "Offer has no stable external identifier and was skipped.",
        path: "offer.@id",
        severity: "warning",
      },
    };
  }

  if (!title) {
    return {
      issue: {
        code: "offer-missing-title",
        externalId,
        message: "Offer has no title/name and was skipped.",
        path: "offer.name",
        severity: "warning",
      },
    };
  }

  return {
    parsed: {
      address: offer.fields.address?.trim(),
      externalId,
      price: offer.fields.price?.trim(),
      source: { ...offer.attrs, ...offer.fields },
      title,
    },
  };
}

function createYrlParserSession(input: Pick<FeedParserInput, "limits" | "nowMs">) {
  const limits = resolveFeedParserLimits(input.limits);
  const nowMs = input.nowMs ?? Date.now;
  const startedAt = nowMs();
  const parser = new SaxesParser({ xmlns: false });
  const offers: ParsedFeedOffer[] = [];
  const issues: FeedParseIssue[] = [];
  let currentOffer: MutableOffer | null = null;
  let bytes = 0;
  let depth = 0;
  let offeredCount = 0;
  let skippedCount = 0;
  let critical: FeedParseIssue | null = null;
  let declarationTail = "";

  const markCritical = (code: string, message: string, details?: Record<string, unknown>) => {
    critical ??= { code, details, message, severity: "critical" };
  };

  parser.on("doctype", () => {
    markCritical("xml-doctype-forbidden", "XML DTD/DOCTYPE declarations are forbidden for feed imports.");
  });

  parser.on("error", (error) => {
    markCritical("xml-malformed", "XML parser reported malformed input.", { parserMessage: error.message });
  });

  parser.on("opentag", (tag) => {
    depth += 1;
    if (depth > limits.maxDepth) {
      markCritical("xml-max-depth-exceeded", "XML structural depth limit was exceeded.", { depth, maxDepth: limits.maxDepth });
      return;
    }

    if (tag.name === "offer") {
      offeredCount += 1;
      if (offeredCount > limits.maxOffers) {
        markCritical("xml-max-offers-exceeded", "XML offer count limit was exceeded.", {
          maxOffers: limits.maxOffers,
          offeredCount,
        });
        return;
      }
      currentOffer = { attrs: normalizeAttributes(tag.attributes), currentField: null, fields: {} };
      return;
    }

    if (currentOffer && offerFieldNames.has(tag.name)) {
      currentOffer.currentField = tag.name;
      currentOffer.fields[tag.name] = "";
    }
  });

  parser.on("text", (text) => {
    appendText(currentOffer, text, limits.maxTextLength);
    if (currentOffer?.currentField && (currentOffer.fields[currentOffer.currentField]?.length ?? 0) > limits.maxTextLength) {
      markCritical("xml-text-limit-exceeded", "XML text node limit was exceeded.", {
        field: currentOffer.currentField,
        maxTextLength: limits.maxTextLength,
      });
    }
  });

  parser.on("cdata", (text) => {
    appendText(currentOffer, text, limits.maxTextLength);
  });

  parser.on("closetag", (tag) => {
    if (currentOffer && tag.name === currentOffer.currentField) {
      currentOffer.currentField = null;
    }

    if (tag.name === "offer" && currentOffer) {
      const finalized = finalizeOffer(currentOffer);
      if (finalized.issue) {
        issues.push(finalized.issue);
        skippedCount += 1;
      }
      if (finalized.parsed) {
        offers.push(finalized.parsed);
      }
      currentOffer = null;
    }

    depth -= 1;
  });

  const write = (chunk: string, rawByteLength = Buffer.byteLength(chunk, "utf8")) => {
    try {
      const declarationWindow = declarationTail + chunk;
      declarationTail = declarationWindow.slice(-32);
      if (forbiddenXmlDeclarationPattern.test(declarationWindow)) {
        markCritical("xml-declarations-forbidden", "XML DTD/ENTITY declarations are forbidden for feed imports.");
      }

      bytes += rawByteLength;
      if (bytes > limits.maxBytes) {
        markCritical("xml-max-size-exceeded", "XML feed size limit was exceeded.", {
          bytes,
          maxBytes: limits.maxBytes,
        });
      }

      if (nowMs() - startedAt > limits.timeoutMs) {
        markCritical("xml-parse-timeout", "XML parse timeout was exceeded.", { timeoutMs: limits.timeoutMs });
      }

      if (!critical && chunk.length > 0) parser.write(chunk);
    } catch (error) {
      markCritical("xml-parser-exception", "XML parser failed while reading the feed.", {
        parserMessage: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const finish = (): FeedParserResult => {
    if (!critical) {
      try {
        parser.close();
      } catch (error) {
        markCritical("xml-parser-exception", "XML parser failed while reading the feed.", {
          parserMessage: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return critical ? {
      issues: [critical, ...issues],
      offeredCount,
      offers: [],
      parser: "yrl",
      skippedCount: offeredCount,
      suspicious: true,
    } : {
      issues,
      offeredCount,
      offers,
      parser: "yrl",
      skippedCount,
      suspicious: false,
    };
  };

  return { finish, write };
}

export function parseYrlFeed(input: FeedParserInput): FeedParserResult {
  const session = createYrlParserSession(input);
  for (const chunk of chunkXmlInput(input.xml, resolveFeedParserLimits(input.limits).chunkSize)) {
    session.write(chunk);
  }
  return session.finish();
}

export async function parseYrlFeedStream(input: FeedParserStreamInput): Promise<FeedParserStreamResult> {
  const session = createYrlParserSession(input);
  const decoder = new TextDecoder("utf-8", { fatal: false });
  const hash = createHash("sha256");

  for await (const chunk of input.body) {
    hash.update(chunk);
    session.write(decoder.decode(chunk, { stream: true }), chunk.byteLength);
  }
  session.write(decoder.decode(), 0);

  return { ...session.finish(), feedHash: hash.digest("hex") };
}
