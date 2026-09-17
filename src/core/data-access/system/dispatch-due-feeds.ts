type FeedSourceRecord = {
  id: number | string;
  refreshIntervalMinutes?: number | null;
  nextDueAt?: null | string;
};

type ImportRunRecord = {
  id: number | string;
};

type QueuedJob = {
  id?: number | string;
};

type PayloadLike = {
  create: (args: {
    collection: "import-runs";
    data: Record<string, unknown>;
    overrideAccess: true;
  }) => Promise<ImportRunRecord>;
  find: (args: {
    collection: "feed-sources";
    limit: number;
    overrideAccess: true;
    pagination: false;
    where: Record<string, unknown>;
  }) => Promise<{ docs: FeedSourceRecord[] }>;
  jobs: {
    queue: (args: {
      input: { feedSourceId: string; importRunId: string };
      overrideAccess: true;
      queue: "imports";
      task: "importFeed";
    }) => Promise<QueuedJob>;
  };
  update: (args: {
    collection: "feed-sources" | "import-runs";
    data: Record<string, unknown>;
    id?: number | string;
    overrideAccess: true;
    where?: Record<string, unknown>;
  }) => Promise<{ docs?: FeedSourceRecord[] } | unknown>;
};

export type DispatchDueFeedsResult = {
  claimed: number;
  queued: number;
};

const DEFAULT_REFRESH_INTERVAL_MINUTES = 60;
const DISPATCH_LIMIT = 50;

export function calculateNextDueAt(
  now: Date,
  previousNextDueAt: null | string | undefined,
  intervalMinutes = DEFAULT_REFRESH_INTERVAL_MINUTES,
): Date {
  const intervalMs = Math.max(1, intervalMinutes) * 60_000;
  const nextFromNow = new Date(now.getTime() + intervalMs);
  const previous = previousNextDueAt ? new Date(previousNextDueAt) : null;
  const nextFromPrevious = previous && Number.isFinite(previous.getTime()) ? new Date(previous.getTime() + intervalMs) : null;

  if (nextFromPrevious && nextFromPrevious > nextFromNow) return nextFromPrevious;
  return nextFromNow;
}

export async function dispatchDueFeeds(payload: PayloadLike, now = new Date()): Promise<DispatchDueFeedsResult> {
  const nowIso = now.toISOString();
  const dueFeeds = await payload.find({
    collection: "feed-sources",
    limit: DISPATCH_LIMIT,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { enabled: { equals: true } },
        {
          or: [
            { nextDueAt: { less_than_equal: nowIso } },
            { nextDueAt: { exists: false } },
          ],
        },
      ],
    },
  });

  let claimed = 0;
  let queued = 0;

  for (const feedSource of dueFeeds.docs) {
    const nextDueAt = calculateNextDueAt(now, feedSource.nextDueAt, feedSource.refreshIntervalMinutes ?? undefined);
    const claim = await payload.update({
      collection: "feed-sources",
      data: {
        lastAttemptAt: nowIso,
        nextDueAt: nextDueAt.toISOString(),
      },
      overrideAccess: true,
      where: {
        and: [
          { id: { equals: feedSource.id } },
          { enabled: { equals: true } },
          {
            or: [
              { nextDueAt: { less_than_equal: nowIso } },
              { nextDueAt: { exists: false } },
            ],
          },
        ],
      },
    });
    const claimResult = claim as { docs?: FeedSourceRecord[] };
    const claimedFeed = Array.isArray(claimResult.docs) && claimResult.docs.length > 0;
    if (!claimedFeed) continue;

    claimed += 1;

    const importRun = await payload.create({
      collection: "import-runs",
      data: {
        feedSource: feedSource.id,
        status: "queued",
      },
      overrideAccess: true,
    });
    const job = await payload.jobs.queue({
      input: {
        feedSourceId: String(feedSource.id),
        importRunId: String(importRun.id),
      },
      overrideAccess: true,
      queue: "imports",
      task: "importFeed",
    });

    await payload.update({
      collection: "import-runs",
      data: { jobId: job.id == null ? undefined : String(job.id) },
      id: importRun.id,
      overrideAccess: true,
    });
    queued += 1;
  }

  return { claimed, queued };
}
