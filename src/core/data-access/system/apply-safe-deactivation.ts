import { collectBoundedPages } from "../../lib/bounded-pagination.ts";
import type { DeactivationApproval } from "../../ingest/safe-deactivation.ts";

type PayloadLike = {
  find: (args: {
    collection: "properties";
    depth: 0;
    limit: number;
    overrideAccess: true;
    page: number;
    select: { externalId: true; id: true };
    where: Record<string, unknown>;
  }) => Promise<{ docs?: Array<{ externalId?: string | null; id: number | string }>; hasNextPage?: boolean }>;
  findByID: (args: {
    collection: "feed-sources" | "import-runs";
    depth: 0;
    id: number | string;
    overrideAccess: true;
    select?: Record<string, true>;
  }) => Promise<Record<string, unknown>>;
  update: (args: {
    collection: "properties" | "feed-sources";
    data: Record<string, unknown>;
    id?: number | string;
    overrideAccess: true;
    where?: Record<string, unknown>;
  }) => Promise<unknown>;
};

export type FeedDeactivationPolicy = {
  deactivationApproval: DeactivationApproval | null;
  lastFeedHash: string | null;
  lastFullRunAt: string | null;
  lastOfferCount: number | null;
  market: "newbuild" | "secondary" | null;
  maxDeactivationsPerRun: number;
  safetyThresholdPercent: number;
};

export async function loadFeedDeactivationPolicy(
  payload: PayloadLike,
  feedSourceId: number | string,
): Promise<FeedDeactivationPolicy> {
  const source = await payload.findByID({
    collection: "feed-sources",
    depth: 0,
    id: feedSourceId,
    overrideAccess: true,
    select: {
      deactivationApproval: true,
      lastFeedHash: true,
      lastFullRunAt: true,
      lastOfferCount: true,
      market: true,
      maxDeactivationsPerRun: true,
      safetyThresholdPercent: true,
    },
  });

  const approval = source.deactivationApproval as DeactivationApproval | null | undefined;
  return {
    deactivationApproval: approval ?? null,
    lastFeedHash: typeof source.lastFeedHash === "string" ? source.lastFeedHash : null,
    lastFullRunAt: typeof source.lastFullRunAt === "string" ? source.lastFullRunAt : null,
    lastOfferCount: typeof source.lastOfferCount === "number" ? source.lastOfferCount : null,
    market: source.market === "newbuild" || source.market === "secondary" ? source.market : null,
    maxDeactivationsPerRun:
      typeof source.maxDeactivationsPerRun === "number" ? source.maxDeactivationsPerRun : 0,
    safetyThresholdPercent:
      typeof source.safetyThresholdPercent === "number" ? source.safetyThresholdPercent : 20,
  };
}

export async function loadImportRunMode(
  payload: PayloadLike,
  importRunId: number | string,
): Promise<"full" | "incremental"> {
  const run = await payload.findByID({
    collection: "import-runs",
    depth: 0,
    id: importRunId,
    overrideAccess: true,
    select: { mode: true },
  });
  return run.mode === "full" ? "full" : "incremental";
}

export async function findActiveFeedPropertiesInScope(
  payload: PayloadLike,
  scope: Record<string, unknown>,
): Promise<Array<{ externalId: string; id: number | string }>> {
  const docs = await collectBoundedPages({
    fetchPage: (page, limit) =>
      payload.find({
        collection: "properties",
        depth: 0,
        limit,
        overrideAccess: true,
        page,
        select: { externalId: true, id: true },
        where: scope,
      }),
  });

  return docs
    .filter((doc) => typeof doc.externalId === "string" && doc.externalId.length > 0)
    .map((doc) => ({ externalId: doc.externalId as string, id: doc.id }));
}

export async function archiveMissingFeedProperties(
  payload: PayloadLike,
  args: {
    ids: Array<number | string>;
    patch: Record<string, unknown>;
  },
): Promise<void> {
  if (args.ids.length === 0) return;
  await payload.update({
    collection: "properties",
    data: args.patch,
    overrideAccess: true,
    where: { id: { in: args.ids } },
  });
}

export async function consumeDeactivationApproval(
  payload: PayloadLike,
  feedSourceId: number | string,
  consumedAt: string,
): Promise<void> {
  await payload.update({
    collection: "feed-sources",
    data: {
      deactivationApproval: {
        consumedAt,
      },
    },
    id: feedSourceId,
    overrideAccess: true,
  });
}
