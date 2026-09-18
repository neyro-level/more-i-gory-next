import type { TaskConfig } from "payload";

import { catalogLifecycle } from "../../../core/data-access/system/catalog-lifecycle.ts";
import { jobsJanitor } from "../../../core/data-access/system/jobs-janitor.ts";
import { leadRetentionCleanup } from "../../../core/data-access/system/lead-retention.ts";
import { recoverLeadDeliveries } from "../../../core/data-access/system/lead-delivery.ts";

type MaintenanceTaskSlug =
  | "jobsJanitor"
  | "leadRetentionCleanup"
  | "catalogLifecycle"
  | "recoverLeadDeliveries";

type JobsJanitorTask = {
  input: Record<string, never>;
  output: {
    interrupted: number;
    massDeactivationForbidden: true;
    orphanQueued: number;
    staleRunning: number;
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
  // Seconds field must be `0`, not `*`: `* 0/5 * * * *` fires every second.
  { slug: "jobsJanitor", cron: "0 0/5 * * * *" },
  { slug: "recoverLeadDeliveries", cron: "30 0/5 * * * *" },
  { slug: "catalogLifecycle", cron: "0 0 * * * *" },
  { slug: "leadRetentionCleanup", cron: "0 30 2 * * *" },
] satisfies MaintenanceScheduleDefinition[];

function cronFor(slug: MaintenanceTaskSlug): string {
  const schedule = maintenanceSchedules.find((entry) => entry.slug === slug);
  if (!schedule) {
    throw new Error(`Unknown maintenance schedule: ${slug}`);
  }
  return schedule.cron;
}

export const jobsJanitorTask: TaskConfig<JobsJanitorTask> = {
  slug: "jobsJanitor",
  inputSchema: [],
  outputSchema: [
    { name: "interrupted", type: "number", required: true },
    { name: "massDeactivationForbidden", type: "checkbox", required: true },
    { name: "orphanQueued", type: "number", required: true },
    { name: "staleRunning", type: "number", required: true },
  ],
  concurrency: {
    exclusive: true,
    key: () => "maintenance:jobsJanitor",
    supersedes: false,
  },
  retries: 0,
  schedule: [
    {
      cron: cronFor("jobsJanitor"),
      queue: maintenanceQueue,
    },
  ],
  handler: async ({ req }) => {
    const result = await jobsJanitor(
      req.payload as unknown as Parameters<typeof jobsJanitor>[0],
    );
    return { output: result };
  },
};

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
      cron: cronFor("recoverLeadDeliveries"),
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
      cron: cronFor("catalogLifecycle"),
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
      cron: cronFor("leadRetentionCleanup"),
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

type RegisteredMaintenanceTask =
  | TaskConfig<CatalogLifecycleTask>
  | TaskConfig<JobsJanitorTask>
  | TaskConfig<LeadRetentionCleanupTask>
  | TaskConfig<RecoverLeadDeliveriesTask>;

export const maintenanceTasksBySlug = {
  catalogLifecycle: catalogLifecycleTask,
  jobsJanitor: jobsJanitorTask,
  leadRetentionCleanup: leadRetentionCleanupTask,
  recoverLeadDeliveries: recoverLeadDeliveriesTask,
} as const satisfies Record<MaintenanceTaskSlug, RegisteredMaintenanceTask>;

export const registeredMaintenanceTasks = maintenanceSchedules.map(
  (schedule) => maintenanceTasksBySlug[schedule.slug],
);
