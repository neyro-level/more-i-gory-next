import { scheduleFeedSourceAfterRun } from "./import-feed-run.ts";
import {
  defaultDispatcherIntervalMinutes,
  defaultStaleRunningThresholdMinutes,
  type ImportRunMaintenanceRecord,
  planImportRunJanitor,
} from "../../ingest/import-maintenance.ts";

type PayloadLike = Parameters<typeof scheduleFeedSourceAfterRun>[0];

function feedSourceId(value: ImportRunMaintenanceRecord["feedSource"]): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object" && value.id != null) return String(value.id);
  return null;
}

export type JobsJanitorSummary = {
  interrupted: number;
  massDeactivationForbidden: true;
  orphanQueued: number;
  staleRunning: number;
};

export async function jobsJanitor(
  payload: PayloadLike,
  now = new Date(),
): Promise<JobsJanitorSummary> {
  const nowIso = now.toISOString();
  const result = await payload.find?.({
    collection: "import-runs",
    depth: 0,
    limit: 1000,
    overrideAccess: true,
    pagination: false,
    select: {
      createdAt: true,
      feedSource: true,
      heartbeatAt: true,
      id: true,
      startedAt: true,
      status: true,
    },
    where: {
      status: {
        in: ["queued", "running"],
      },
    },
  });

  const runs: ImportRunMaintenanceRecord[] = [];
  for (const run of result?.docs ?? []) {
    if (run.id == null || (run.status !== "queued" && run.status !== "running")) continue;
    runs.push({
      createdAt: run.createdAt,
      feedSource: run.feedSource,
      heartbeatAt: run.heartbeatAt,
      id: run.id,
      startedAt: run.startedAt,
      status: run.status,
    });
  }
  const byId = new Map(runs.map((run) => [String(run.id), run]));
  const actions = planImportRunJanitor({
    dispatcherIntervalMinutes: defaultDispatcherIntervalMinutes,
    nowIso,
    runs,
    staleRunningThresholdMinutes: defaultStaleRunningThresholdMinutes,
  });

  for (const action of actions) {
    await payload.update({
      collection: "import-runs",
      data: action.data,
      overrideAccess: true,
      where: {
        and: [
          { id: { equals: action.id } },
          { status: { equals: action.reason === "orphan-queued" ? "queued" : "running" } },
        ],
      },
    });
    if (action.reason !== "stale-running") continue;
    const sourceId = feedSourceId(byId.get(String(action.id))?.feedSource);
    if (!sourceId) continue;
    await scheduleFeedSourceAfterRun(
      payload,
      {
        feedSourceId: sourceId,
        importRunId: String(action.id),
        outcome: "interrupted",
      },
      now,
    );
  }

  return {
    interrupted: actions.length,
    massDeactivationForbidden: true,
    orphanQueued: actions.filter((action) => action.reason === "orphan-queued").length,
    staleRunning: actions.filter((action) => action.reason === "stale-running").length,
  };
}
