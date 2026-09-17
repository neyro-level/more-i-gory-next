import type { JobsConfig } from "payload";

import { dispatchDueFeedsTask } from "./imports/dispatch-due-feeds.ts";
import { importFeedTask } from "./imports/import-feed.ts";
import { deliverLeadTask } from "./leads/deliver-lead.ts";
import { registeredMaintenanceTasks } from "./maintenance/scheduled-tasks.ts";
import { systemHealthTask } from "./system-health.ts";

type JobsAutoRunConfig = Extract<
  NonNullable<JobsConfig["autoRun"]>,
  readonly unknown[]
>;

function isOwnerRequest(args: { req: { user?: { collection?: string; role?: string } | null } }): boolean {
  return args.req.user?.collection === "users" && args.req.user.role === "owner";
}

export const jobsAutoRun = [
  { disableScheduling: false, queue: "system" },
  { disableScheduling: true, queue: "imports" },
  { disableScheduling: false, queue: "maintenance" },
  { disableScheduling: true, queue: "lead-deliveries" },
] satisfies JobsAutoRunConfig;

export const jobsCollectionDiagnosticOverrides = {
  jobsCollectionOverrides: ({ defaultJobsCollection }) => ({
    ...defaultJobsCollection,
    access: {
      ...defaultJobsCollection.access,
      create: () => false,
      delete: () => false,
      read: isOwnerRequest,
      update: () => false,
    },
    admin: {
      ...defaultJobsCollection.admin,
      description: "Read-only owner diagnostics for queued jobs. Mutations stay blocked.",
      hidden: false,
    },
  }),
} satisfies Pick<JobsConfig, "jobsCollectionOverrides">;

export function createJobsConfig(jobsAutorun: "false" | "true"): JobsConfig {
  return {
    access: {
      cancel: isOwnerRequest,
      queue: isOwnerRequest,
      run: isOwnerRequest,
    },
    autoRun: jobsAutoRun,
    enableConcurrencyControl: true,
    ...jobsCollectionDiagnosticOverrides,
    shouldAutoRun: () => jobsAutorun === "true",
    tasks: [
      systemHealthTask,
      dispatchDueFeedsTask,
      importFeedTask,
      deliverLeadTask,
      ...registeredMaintenanceTasks,
    ],
  };
}
