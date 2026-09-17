const minuteMs = 60_000;

export type ImportRunMaintenanceStatus = "interrupted" | "queued" | "running";

export type ImportRunMaintenanceRecord = {
  createdAt?: string;
  heartbeatAt?: string | null;
  id: string | number;
  startedAt?: string | null;
  status: ImportRunMaintenanceStatus;
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
  nowIso: string;
  runs: ImportRunMaintenanceRecord[];
  staleRunningThresholdMinutes: number;
}): ImportRunJanitorAction[] {
  const nowMs = new Date(args.nowIso).getTime();
  const orphanQueuedThresholdMs = calculateOrphanQueuedThresholdMs(args.dispatcherIntervalMinutes);
  const staleRunningThresholdMs = args.staleRunningThresholdMinutes * minuteMs;

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
