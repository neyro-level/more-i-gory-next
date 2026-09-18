type ImportFeedRunInput = {
  feedSourceId: string;
  importRunId: string;
};

type PayloadLike = {
  update: (args: {
    collection: "import-runs" | "feed-sources";
    data: Record<string, unknown>;
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
