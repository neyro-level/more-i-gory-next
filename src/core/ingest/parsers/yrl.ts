import { Buffer } from "node:buffer";

import { SaxesParser, type SaxesTagPlain } from "saxes";

import { chunkXmlInput, resolveFeedParserLimits } from "./limits.ts";
import type { FeedParseIssue, FeedParserInput, FeedParserResult, ParsedFeedOffer } from "./types.ts";

type MutableOffer = {
  attrs: Record<string, string>;
  fields: Record<string, string>;
  currentField: string | null;
};

const offerFieldNames = new Set(["name", "title", "price", "address", "url"]);
const forbiddenXmlDeclarationPattern = /<!\s*(?:DOCTYPE|ENTITY)\b/i;

function createCriticalResult(code: string, message: string, details?: Record<string, unknown>): FeedParserResult {
  return {
    issues: [{ code, details, message, severity: "critical" }],
    offeredCount: 0,
    offers: [],
    parser: "yrl",
    skippedCount: 0,
    suspicious: true,
  };
}

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

export function parseYrlFeed(input: FeedParserInput): FeedParserResult {
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

  try {
    for (const chunk of chunkXmlInput(input.xml, limits.chunkSize)) {
      if (forbiddenXmlDeclarationPattern.test(chunk)) {
        return createCriticalResult("xml-declarations-forbidden", "XML DTD/ENTITY declarations are forbidden for feed imports.");
      }

      bytes += Buffer.byteLength(chunk, "utf8");
      if (bytes > limits.maxBytes) {
        return createCriticalResult("xml-max-size-exceeded", "XML feed size limit was exceeded.", {
          bytes,
          maxBytes: limits.maxBytes,
        });
      }

      if (nowMs() - startedAt > limits.timeoutMs) {
        return createCriticalResult("xml-parse-timeout", "XML parse timeout was exceeded.", { timeoutMs: limits.timeoutMs });
      }

      parser.write(chunk);
      if (critical) break;
    }
    parser.close();
  } catch (error) {
    return createCriticalResult("xml-parser-exception", "XML parser failed while reading the feed.", {
      parserMessage: error instanceof Error ? error.message : String(error),
    });
  }

  if (critical) {
    return {
      issues: [critical, ...issues],
      offeredCount,
      offers: [],
      parser: "yrl",
      skippedCount: offeredCount,
      suspicious: true,
    };
  }

  return {
    issues,
    offeredCount,
    offers,
    parser: "yrl",
    skippedCount,
    suspicious: false,
  };
}
