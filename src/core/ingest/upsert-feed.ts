import { loadFeedSourceMarket } from "../data-access/system/load-feed-source-market.ts";
import {
  createFeedOwnedProperty,
  findPropertiesByExternalId,
  pickExistingPropertyForFeed,
  updateFeedOwnedProperty,
} from "../data-access/system/apply-feed-upsert.ts";
import { planOfferImport, type OfferImportPlan } from "./import-state.ts";
import type { NormalizedFeedOffer } from "./normalize-feed.ts";
import type { ParsedFeedOffer } from "./parsers/types.ts";

export type UpsertFeedSummary = {
  createdCount: number;
  plans: OfferImportPlan[];
  skippedCount: number;
  updatedCount: number;
};

type UpsertPayload = Parameters<typeof findPropertiesByExternalId>[0] &
  Parameters<typeof loadFeedSourceMarket>[0];

export async function upsertParsedFeedOffers(args: {
  feedSourceId: string;
  importRunId: string;
  nowIso?: string;
  offers: readonly ParsedFeedOffer[];
  normalized?: readonly NormalizedFeedOffer[];
  payload: UpsertPayload;
}): Promise<UpsertFeedSummary> {
  const nowIso = args.nowIso ?? new Date().toISOString();
  const market = await loadFeedSourceMarket(args.payload, args.feedSourceId);
  if (market !== "newbuild" && market !== "secondary") {
    throw new Error("Feed source market is missing.");
  }

  const titles = new Map((args.normalized ?? []).map((offer) => [offer.externalId, offer]));
  const summary: UpsertFeedSummary = {
    createdCount: 0,
    plans: [],
    skippedCount: 0,
    updatedCount: 0,
  };

  for (const offer of args.offers) {
    const existingDocs = await findPropertiesByExternalId(args.payload, offer.externalId);
    const existing = pickExistingPropertyForFeed(existingDocs, args.feedSourceId);
    const plan = planOfferImport({
      existing,
      feedMarket: market,
      feedSourceId: args.feedSourceId,
      importRunId: args.importRunId,
      nowIso,
      offer,
    });
    summary.plans.push(plan);

    if (plan.kind === "skip-foreign-owner") {
      summary.skippedCount += 1;
      continue;
    }

    if (plan.kind === "touch-seen") {
      await updateFeedOwnedProperty(args.payload, plan.propertyId, plan.data);
      summary.skippedCount += 1;
      continue;
    }

    if (plan.kind === "create") {
      const normalized = titles.get(offer.externalId);
      await createFeedOwnedProperty(args.payload, {
        ...plan.data,
        title: normalized?.title ?? offer.title ?? offer.externalId,
      });
      summary.createdCount += 1;
      continue;
    }

    if (plan.kind === "update" && plan.propertyId != null) {
      const normalized = titles.get(offer.externalId);
      await updateFeedOwnedProperty(args.payload, plan.propertyId, {
        ...plan.data,
        ...(normalized?.title ? { title: normalized.title } : {}),
      });
      summary.updatedCount += 1;
    }
  }

  return summary;
}

export function createUpsertFeedHandler(deps: { payload: UpsertPayload }) {
  return async (context: {
    input: { feedSourceId: string; importRunId: string };
    state: {
      parse?: { offers: ParsedFeedOffer[] };
      normalize?: { offers: NormalizedFeedOffer[] };
      upsert?: UpsertFeedSummary;
    };
  }) => {
    if (!context.state.parse) {
      return { continue: false, status: "failed" as const };
    }

    try {
      context.state.upsert = await upsertParsedFeedOffers({
        feedSourceId: context.input.feedSourceId,
        importRunId: context.input.importRunId,
        offers: context.state.parse.offers,
        normalized: context.state.normalize?.offers,
        payload: deps.payload,
      });
      return { continue: true, status: "running" as const };
    } catch {
      return { continue: false, status: "failed" as const };
    }
  };
}
