import {
  defaultDispatcherIntervalMinutes,
  defaultStaleRunningThresholdMinutes,
  type ImportRunMaintenanceRecord,
  planImportRunJanitor,
} from "../../ingest/import-maintenance.ts";

type PayloadLike = {
  find?: (args: {
    collection: "import-runs";
    depth: 0;
    limit: number;
    overrideAccess: true;
    pagination: false;
    select: {
      createdAt: true;
      heartbeatAt: true;
      id: true;
      startedAt: true;
      status: true;
    };
    where: Record<string, unknown>;
  }) => Promise<{ docs?: ImportRunMaintenanceRecord[] }>;
  update: (args: {
    collection: "import-runs";
    data: {
      finishedAt: string;
      status: "interrupted";
      summary: string;
    };
    overrideAccess: true;
    where: Record<string, unknown>;
  }) => Promise<unknown>;
};

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

  const actions = planImportRunJanitor({
    dispatcherIntervalMinutes: defaultDispatcherIntervalMinutes,
    nowIso,
    runs: result?.docs ?? [],
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
  }

  return {
    interrupted: actions.length,
    massDeactivationForbidden: true,
    orphanQueued: actions.filter((action) => action.reason === "orphan-queued").length,
    staleRunning: actions.filter((action) => action.reason === "stale-running").length,
  };
}
