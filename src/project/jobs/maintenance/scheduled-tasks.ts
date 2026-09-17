import type { TaskConfig } from "payload";

import { catalogLifecycle } from "../../../core/data-access/system/catalog-lifecycle.ts";
import { leadRetentionCleanup } from "../../../core/data-access/system/lead-retention.ts";
import { recoverLeadDeliveries } from "../../../core/data-access/system/lead-delivery.ts";

type MaintenanceTaskSlug =
  | "jobsJanitor"
  | "leadRetentionCleanup"
  | "catalogLifecycle"
  | "recoverLeadDeliveries";

type MaintenanceTask = {
  input: Record<string, never>;
  output: {
    status: "registered";
  };
};

type RecoverLeadDeliveriesTask = {
  input: Record<string, never>;
  output: {
    recovered: number;
    requeued: number;
  };
};

type CatalogLifecycleTask = {
  input: Record<string, never>;
  output: {
    expired: number;
    retained: number;
  };
};

type LeadRetentionCleanupTask = {
  input: Record<string, never>;
  output: {
    anonymized: number;
    purged: number;
  };
};

type MaintenanceScheduleDefinition = Readonly<{
  cron: string;
  slug: MaintenanceTaskSlug;
}>;

export const maintenanceQueue = "maintenance" as const;

export const maintenanceSchedules = [
  { slug: "jobsJanitor", cron: "* 0/5 * * * *" },
  { slug: "recoverLeadDeliveries", cron: "30 0/5 * * * *" },
  { slug: "catalogLifecycle", cron: "0 0 * * * *" },
  { slug: "leadRetentionCleanup", cron: "0 30 2 * * *" },
] satisfies MaintenanceScheduleDefinition[];

function createMaintenanceTask(
  schedule: MaintenanceScheduleDefinition,
): TaskConfig<MaintenanceTask> {
  return {
    slug: schedule.slug,
    inputSchema: [],
    outputSchema: [{ name: "status", type: "text", required: true }],
    concurrency: {
      exclusive: true,
      key: () => `maintenance:${schedule.slug}`,
      supersedes: false,
    },
    retries: 0,
    schedule: [{ cron: schedule.cron, queue: maintenanceQueue }],
    handler: async () => ({ output: { status: "registered" } }),
  };
}

export const maintenanceTasks = maintenanceSchedules.map(createMaintenanceTask);
const [
  jobsJanitorTask,
  ,
  ,
  ,
] = maintenanceTasks;

export const recoverLeadDeliveriesTask: TaskConfig<RecoverLeadDeliveriesTask> = {
  slug: "recoverLeadDeliveries",
  inputSchema: [],
  outputSchema: [
    { name: "recovered", type: "number", required: true },
    { name: "requeued", type: "number", required: true },
  ],
  concurrency: {
    exclusive: true,
    key: () => "maintenance:recoverLeadDeliveries",
    supersedes: false,
  },
  retries: 0,
  schedule: [
    {
      cron: maintenanceSchedules.find((schedule) => schedule.slug === "recoverLeadDeliveries")?.cron ?? "30 0/5 * * * *",
      queue: maintenanceQueue,
    },
  ],
  handler: async ({ req }) => {
    const result = await recoverLeadDeliveries(
      req.payload as unknown as Parameters<typeof recoverLeadDeliveries>[0],
    );
    return { output: result };
  },
};

export const catalogLifecycleTask: TaskConfig<CatalogLifecycleTask> = {
  slug: "catalogLifecycle",
  inputSchema: [],
  outputSchema: [
    { name: "expired", type: "number", required: true },
    { name: "retained", type: "number", required: true },
  ],
  concurrency: {
    exclusive: true,
    key: () => "maintenance:catalogLifecycle",
    supersedes: false,
  },
  retries: 0,
  schedule: [
    {
      cron: maintenanceSchedules.find((schedule) => schedule.slug === "catalogLifecycle")?.cron ?? "0 0 * * * *",
      queue: maintenanceQueue,
    },
  ],
  handler: async ({ req }) => {
    const result = await catalogLifecycle(
      req.payload as unknown as Parameters<typeof catalogLifecycle>[0],
    );
    return { output: result };
  },
};

export const leadRetentionCleanupTask: TaskConfig<LeadRetentionCleanupTask> = {
  slug: "leadRetentionCleanup",
  inputSchema: [],
  outputSchema: [
    { name: "anonymized", type: "number", required: true },
    { name: "purged", type: "number", required: true },
  ],
  concurrency: {
    exclusive: true,
    key: () => "maintenance:leadRetentionCleanup",
    supersedes: false,
  },
  retries: 0,
  schedule: [
    {
      cron: maintenanceSchedules.find((schedule) => schedule.slug === "leadRetentionCleanup")?.cron ?? "0 30 2 * * *",
      queue: maintenanceQueue,
    },
  ],
  handler: async ({ req }) => {
    const result = await leadRetentionCleanup(
      req.payload as unknown as Parameters<typeof leadRetentionCleanup>[0],
    );
    return { output: result };
  },
};

export const registeredMaintenanceTasks = [
  jobsJanitorTask,
  recoverLeadDeliveriesTask,
  catalogLifecycleTask,
  leadRetentionCleanupTask,
] satisfies ReadonlyArray<
  | TaskConfig<CatalogLifecycleTask>
  | TaskConfig<LeadRetentionCleanupTask>
  | TaskConfig<MaintenanceTask>
  | TaskConfig<RecoverLeadDeliveriesTask>
>;
