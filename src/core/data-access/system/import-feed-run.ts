import {
  calculatePostRunNextDueAt,
  consecutiveImportFailureCount,
  type PostRunScheduleOutcome,
} from "../../ingest/schedule-next-due.ts";

type ImportFeedRunInput = {
  feedSourceId: string;
  importRunId: string;
};

type PayloadLike = {
  find?: (args: {
    collection: "import-runs";
    depth: 0;
    limit: number;
    overrideAccess: true;
    pagination: false;
    select?: Record<string, true>;
    sort?: string;
    where: Record<string, unknown>;
  }) => Promise<{
    docs?: Array<{
      createdAt?: string;
      feedSource?: number | string | { id?: number | string } | null;
      heartbeatAt?: string | null;
      id?: number | string;
      startedAt?: string | null;
      status?: string;
    }>;
  }>;
  findByID?: (args: {
    collection: "feed-sources";
    depth: 0;
    id: number | string;
    overrideAccess: true;
    select: { refreshIntervalMinutes: true };
  }) => Promise<{ refreshIntervalMinutes?: number | null }>;
  update: (args: {
    collection: "import-runs" | "feed-sources";
    data: Record<string, unknown>;
    disableTransaction?: true;
    id?: number | string;
    overrideAccess: true;
    where?: Record<string, unknown>;
  }) => Promise<{ docs?: Array<{ id: number | string }> } | unknown>;
};

export async function transitionImportRunToRunning(
  payload: PayloadLike,
  input: ImportFeedRunInput,
  now = new Date(),
): Promise<boolean> {
  const transition = await payload.update({
    collection: "import-runs",
    data: {
      startedAt: now.toISOString(),
      status: "running",
    },
    overrideAccess: true,
    where: {
      and: [
        { id: { equals: input.importRunId } },
        { feedSource: { equals: input.feedSourceId } },
        { status: { equals: "queued" } },
      ],
    },
  });
  const result = transition as { docs?: Array<{ id: number | string }> };
  return Array.isArray(result.docs) && result.docs.length > 0;
}

export async function finalizeUnchangedImportRun(
  payload: PayloadLike,
  input: ImportFeedRunInput,
  now = new Date(),
): Promise<boolean> {
  const transition = await payload.update({
    collection: "import-runs",
    data: {
      finishedAt: now.toISOString(),
      offeredCount: 0,
      status: "skipped",
      summary: "Feed unchanged (HTTP 304).",
    },
    overrideAccess: true,
    where: {
      and: [
        { id: { equals: input.importRunId } },
        { feedSource: { equals: input.feedSourceId } },
        { status: { equals: "running" } },
      ],
    },
  });
  const result = transition as { docs?: Array<{ id: number | string }> };
  return Array.isArray(result.docs) && result.docs.length > 0;
}

export async function finalizeImportRun(
  payload: PayloadLike,
  input: ImportFeedRunInput & {
    createdCount: number;
    deactivatedCount: number;
    etag?: string | null;
    feedHash?: string | null;
    issueCount: number;
    lastModified?: string | null;
    offeredCount: number;
    skippedCount: number;
    status: "completed" | "suspicious";
    summary: string;
    updatedCount: number;
  },
  now = new Date(),
): Promise<boolean> {
  const transition = await payload.update({
    collection: "import-runs",
    data: {
      createdCount: input.createdCount,
      deactivatedCount: input.deactivatedCount,
      etag: input.etag ?? undefined,
      feedHash: input.feedHash ?? undefined,
      finishedAt: now.toISOString(),
      issueCount: input.issueCount,
      lastModified: input.lastModified ?? undefined,
      offeredCount: input.offeredCount,
      skippedCount: input.skippedCount,
      status: input.status,
      summary: input.summary,
      updatedCount: input.updatedCount,
    },
    overrideAccess: true,
    where: {
      and: [
        { id: { equals: input.importRunId } },
        { feedSource: { equals: input.feedSourceId } },
        { status: { equals: "running" } },
      ],
    },
  });
  const result = transition as { docs?: Array<{ id: number | string }> };
  return Array.isArray(result.docs) && result.docs.length > 0;
}

export async function markFeedSourceImportFinished(
  payload: PayloadLike,
  input: {
    etag?: string | null;
    feedHash?: string | null;
    feedSourceId: string;
    lastModified?: string | null;
    lastOfferCount: number;
    markFullRun: boolean;
    nowIso: string;
    successful: boolean;
  },
): Promise<void> {
  await payload.update({
    collection: "feed-sources",
    data: {
      ...(input.etag ? { lastEtag: input.etag } : {}),
      ...(input.feedHash ? { lastFeedHash: input.feedHash } : {}),
      ...(input.lastModified ? { lastModified: input.lastModified } : {}),
      lastOfferCount: input.lastOfferCount,
      ...(input.successful ? { lastSuccessfulRunAt: input.nowIso } : {}),
      ...(input.markFullRun && input.successful ? { lastFullRunAt: input.nowIso } : {}),
    },
    id: input.feedSourceId,
    overrideAccess: true,
  });
}

export async function touchImportRunHeartbeat(
  payload: PayloadLike,
  input: ImportFeedRunInput,
  now = new Date(),
): Promise<boolean> {
  const transition = await payload.update({
    collection: "import-runs",
    data: {
      heartbeatAt: now.toISOString(),
    },
    disableTransaction: true,
    overrideAccess: true,
    where: {
      and: [
        { id: { equals: input.importRunId } },
        { feedSource: { equals: input.feedSourceId } },
        { status: { equals: "running" } },
      ],
    },
  });
  const result = transition as { docs?: Array<{ id: number | string }> };
  return Array.isArray(result.docs) && result.docs.length > 0;
}

export async function finalizeFailedImportRun(
  payload: PayloadLike,
  input: ImportFeedRunInput,
  now = new Date(),
): Promise<boolean> {
  const transition = await payload.update({
    collection: "import-runs",
    data: {
      finishedAt: now.toISOString(),
      status: "failed",
      summary: "Import run failed before finalization.",
    },
    overrideAccess: true,
    where: {
      and: [
        { id: { equals: input.importRunId } },
        { feedSource: { equals: input.feedSourceId } },
        { status: { equals: "running" } },
      ],
    },
  });
  const failed = transition as { docs?: Array<{ id: number | string }> };
  return Array.isArray(failed.docs) && failed.docs.length > 0;
}

export async function scheduleFeedSourceAfterRun(
  payload: PayloadLike,
  input: ImportFeedRunInput & { outcome: PostRunScheduleOutcome },
  now = new Date(),
): Promise<string> {
  const source = await payload.findByID?.({
    collection: "feed-sources",
    depth: 0,
    id: input.feedSourceId,
    overrideAccess: true,
    select: { refreshIntervalMinutes: true },
  });
  const intervalMinutes =
    typeof source?.refreshIntervalMinutes === "number" && source.refreshIntervalMinutes > 0
      ? source.refreshIntervalMinutes
      : 60;
  const history = await payload.find?.({
    collection: "import-runs",
    depth: 0,
    limit: 20,
    overrideAccess: true,
    pagination: false,
    select: { status: true },
    sort: "-finishedAt",
    where: { feedSource: { equals: input.feedSourceId } },
  });
  const consecutiveFailures = consecutiveImportFailureCount(
    (history?.docs ?? []).map((doc) => (typeof doc.status === "string" ? doc.status : "")),
  );
  const nextDueAt = calculatePostRunNextDueAt({
    consecutiveFailures,
    intervalMinutes,
    now,
    outcome: input.outcome,
  }).toISOString();
  await payload.update({
    collection: "feed-sources",
    data: { nextDueAt },
    id: input.feedSourceId,
    overrideAccess: true,
  });
  return nextDueAt;
}
