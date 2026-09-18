type ImportFeedRunInput = {
  feedSourceId: string;
  importRunId: string;
};

type PayloadLike = {
  update: (args: {
    collection: "import-runs";
    data: Record<string, unknown>;
    overrideAccess: true;
    where: Record<string, unknown>;
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
