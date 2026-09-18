import { resolveFeedPropertyEnums } from "../catalog/property-enums.ts";
import type { FeedParseIssue, FeedParserResult, ParsedFeedOffer } from "./parsers/types.ts";
import type { PropertyCategory, PropertyDealType } from "@more-i-gory/contracts";

export type NormalizedFeedOffer = {
  address?: string;
  category?: PropertyCategory;
  dealType?: PropertyDealType;
  externalId: string;
  price?: string;
  title?: string;
};

export type NormalizeFeedResult = {
  issues: FeedParseIssue[];
  offers: NormalizedFeedOffer[];
};

export function normalizeParsedOffers(parsed: FeedParserResult): NormalizeFeedResult {
  const issues: FeedParseIssue[] = [];
  const offers: NormalizedFeedOffer[] = parsed.offers.map((offer: ParsedFeedOffer) => {
    const enums = resolveFeedPropertyEnums(offer.source);
    for (const rejected of enums.rejected) {
      issues.push({
        code: "normalize-enum-rejected",
        externalId: offer.externalId,
        message: `Rejected raw ${rejected.field} value was not written.`,
        path: `offer.${rejected.field}`,
        severity: "warning",
      });
    }

    const normalized: NormalizedFeedOffer = {
      externalId: offer.externalId,
      ...enums.values,
    };
    if (offer.address) normalized.address = offer.address;
    if (offer.price) normalized.price = offer.price;
    if (offer.title) normalized.title = offer.title;
    return normalized;
  });

  return { issues, offers };
}

export function createNormalizeFeedHandler() {
  return async (context: {
    state: { parse?: FeedParserResult; normalize?: NormalizeFeedResult };
  }) => {
    if (!context.state.parse) {
      return { continue: false, status: "failed" as const };
    }

    context.state.normalize = normalizeParsedOffers(context.state.parse);
    return { continue: true, status: "running" as const };
  };
}
