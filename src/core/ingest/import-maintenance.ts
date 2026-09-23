const minuteMs = 60_000;

export const defaultDispatcherIntervalMinutes = 5;
export const defaultStaleRunningThresholdMinutes = 15;

export type ImportRunMaintenanceStatus = "interrupted" | "queued" | "running";

export type ImportRunMaintenanceRecord = {
  createdAt?: string;
  feedSource?: number | string | { id?: number | string } | null;
  heartbeatAt?: string | null;
  id: string | number;
  jobId?: string | null;
  startedAt?: string | null;
  status: ImportRunMaintenanceStatus;
};

export type ImportRunJobState = {
  live: boolean;
  waitUntil?: string | null;
};

export type ImportRunJanitorAction = {
  baselinePreserved: true;
  data: {
    finishedAt: string;
    status: "interrupted";
    summary: string;
  };
  id: string | number;
  massDeactivationForbidden: true;
  reason: "orphan-queued" | "stale-running";
};

export function calculateOrphanQueuedThresholdMs(dispatcherIntervalMinutes: number): number {
  return Math.max(15 * minuteMs, 3 * dispatcherIntervalMinutes * minuteMs);
}

export function calculateAdaptiveStaleRunningThresholdMinutes(
  baselineMinutes: number,
  successfulDurationsMs: readonly number[],
): number {
  const observed = successfulDurationsMs
    .filter((duration) => Number.isFinite(duration) && duration > 0)
    .sort((left, right) => left - right);
  if (observed.length === 0) return baselineMinutes;
  const percentileIndex = Math.min(observed.length - 1, Math.ceil(observed.length * 0.95) - 1);
  const adaptiveMinutes = Math.ceil((observed[percentileIndex] * 2) / minuteMs);
  return Math.min(24 * 60, Math.max(baselineMinutes, adaptiveMinutes));
}

export function createImportRunHeartbeat(nowIso: string): {
  data: { heartbeatAt: string };
  outsideIngestTransaction: true;
} {
  return {
    data: { heartbeatAt: nowIso },
    outsideIngestTransaction: true,
  };
}

function ageMs(nowMs: number, value: string | null | undefined): number {
  if (!value) return Number.POSITIVE_INFINITY;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? nowMs - timestamp : Number.POSITIVE_INFINITY;
}

export function planImportRunJanitor(args: {
  dispatcherIntervalMinutes: number;
  jobsById?: ReadonlyMap<string, ImportRunJobState>;
  nowIso: string;
  successfulDurationsMs?: readonly number[];
  runs: ImportRunMaintenanceRecord[];
  staleRunningThresholdMinutes: number;
}): ImportRunJanitorAction[] {
  const nowMs = new Date(args.nowIso).getTime();
  const orphanQueuedThresholdMs = calculateOrphanQueuedThresholdMs(args.dispatcherIntervalMinutes);
  const staleRunningThresholdMs =
    calculateAdaptiveStaleRunningThresholdMinutes(
      args.staleRunningThresholdMinutes,
      args.successfulDurationsMs ?? [],
    ) * minuteMs;

  const actions: ImportRunJanitorAction[] = [];

  for (const run of args.runs) {
    if (run.status === "running") {
      const heartbeatAge = ageMs(nowMs, run.heartbeatAt ?? run.startedAt);
      if (heartbeatAge > staleRunningThresholdMs) {
        actions.push({
          baselinePreserved: true,
          data: {
            finishedAt: args.nowIso,
            status: "interrupted",
            summary: "Import run was interrupted by jobsJanitor after stale heartbeat.",
          },
          id: run.id,
          massDeactivationForbidden: true,
          reason: "stale-running",
        });
      }
    }

    if (run.status === "queued" && ageMs(nowMs, run.createdAt) >= orphanQueuedThresholdMs) {
      const linkedJob = run.jobId ? args.jobsById?.get(run.jobId) : undefined;
      const futureWaitUntil = linkedJob?.waitUntil
        ? new Date(linkedJob.waitUntil).getTime() > nowMs
        : false;
      if (linkedJob?.live || futureWaitUntil) continue;
      actions.push({
        baselinePreserved: true,
        data: {
          finishedAt: args.nowIso,
          status: "interrupted",
          summary: "Queued import run was interrupted by jobsJanitor after orphan threshold.",
        },
        id: run.id,
        massDeactivationForbidden: true,
        reason: "orphan-queued",
      });
    }
  }

  return actions;
}
