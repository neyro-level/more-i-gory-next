import { loadFeedSourceMarket } from "../data-access/system/load-feed-source-market.ts";
import {
  createFeedOwnedProperty,
  findFeedUpsertCandidates,
  pickExistingPropertyForFeed,
  updateFeedOwnedProperty,
  updateFeedOwnedProperties,
} from "../data-access/system/apply-feed-upsert.ts";
import { applyFeedFieldOwnership, type FieldOwner } from "./field-ownership.ts";
import { planOfferImport, type OfferImportPlan } from "./import-state.ts";
import type { NormalizedFeedOffer } from "./normalize-feed.ts";

export type UpsertFeedSummary = {
  createdCount: number;
  plans: OfferImportPlan[];
  skippedCount: number;
  updatedCount: number;
};

type UpsertPayload = Parameters<typeof findFeedUpsertCandidates>[0] &
  Parameters<typeof loadFeedSourceMarket>[0];

export async function upsertParsedFeedOffers(args: {
  feedSourceId: string;
  importRunId: string;
  nowIso?: string;
  offers: readonly NormalizedFeedOffer[];
  payload: UpsertPayload;
  explicitOwners?: Partial<Record<"title", FieldOwner>>;
}): Promise<UpsertFeedSummary> {
  const nowIso = args.nowIso ?? new Date().toISOString();
  const market = await loadFeedSourceMarket(args.payload, args.feedSourceId);
  if (market !== "newbuild" && market !== "secondary") {
    throw new Error("Feed source market is missing.");
  }

  const titles = new Map(args.offers.map((offer) => [offer.externalId, offer]));
  const summary: UpsertFeedSummary = {
    createdCount: 0,
    plans: [],
    skippedCount: 0,
    updatedCount: 0,
  };
  const candidates = await findFeedUpsertCandidates(args.payload, {
    externalIds: args.offers.map((offer) => offer.externalId),
    feedSourceId: args.feedSourceId,
  });
  const candidatesByExternalId = new Map<string, typeof candidates>();
  for (const candidate of candidates) {
    const current = candidatesByExternalId.get(candidate.externalId) ?? [];
    current.push(candidate);
    candidatesByExternalId.set(candidate.externalId, current);
  }
  const seenPropertyIds: Array<string | number> = [];

  for (const offer of args.offers) {
    const existing = pickExistingPropertyForFeed(
      candidatesByExternalId.get(offer.externalId) ?? [],
      offer.externalId,
      args.feedSourceId,
    );
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
      seenPropertyIds.push(plan.propertyId);
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
      const incomingTitle = normalized?.title ?? offer.title;
      const owned = incomingTitle
        ? applyFeedFieldOwnership({
            current: { title: existing?.title ?? "" },
            explicitOwners: args.explicitOwners,
            incoming: { title: incomingTitle },
            importingFeedSourceId: args.feedSourceId,
            record: existing ?? { origin: "feed", feedSource: args.feedSourceId },
          })
        : { patch: {}, denied: [] };
      await updateFeedOwnedProperty(args.payload, plan.propertyId, {
        ...plan.data,
        ...owned.patch,
      });
      summary.updatedCount += 1;
    }
  }

  await updateFeedOwnedProperties(args.payload, seenPropertyIds, {
    lastImportRun: args.importRunId,
    lastSeenAt: nowIso,
  });

  return summary;
}

export function createUpsertFeedHandler(deps: { payload: UpsertPayload }) {
  return async (context: {
    input: { feedSourceId: string; importRunId: string };
    state: {
      parse?: { offers: unknown[] };
      normalize?: { offers: NormalizedFeedOffer[] };
      upsert?: UpsertFeedSummary;
    };
  }) => {
    if (!context.state.parse || !context.state.normalize) {
      return { continue: false, status: "failed" as const };
    }

    try {
      context.state.upsert = await upsertParsedFeedOffers({
        feedSourceId: context.input.feedSourceId,
        importRunId: context.input.importRunId,
        offers: context.state.normalize.offers,
        payload: deps.payload,
      });
      return { continue: true, status: "running" as const };
    } catch {
      return { continue: false, status: "failed" as const };
    }
  };
}
