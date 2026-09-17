import type { JobsConfig } from "payload";

import { dispatchDueFeedsTask } from "./imports/dispatch-due-feeds.ts";
import { importFeedTask } from "./imports/import-feed.ts";
import { systemHealthTask } from "./system-health.ts";

type JobsAutoRunConfig = Extract<
  NonNullable<JobsConfig["autoRun"]>,
  readonly unknown[]
>;

export const jobsAutoRun = [
  { disableScheduling: false, queue: "system" },
  { disableScheduling: true, queue: "imports" },
  { disableScheduling: false, queue: "maintenance" },
  { disableScheduling: true, queue: "lead-deliveries" },
] satisfies JobsAutoRunConfig;

export function createJobsConfig(jobsAutorun: "false" | "true"): JobsConfig {
  return {
    access: {
      cancel: ({ req }) => req.user?.collection === "users" && req.user.role === "owner",
      queue: ({ req }) => req.user?.collection === "users" && req.user.role === "owner",
      run: ({ req }) => req.user?.collection === "users" && req.user.role === "owner",
    },
    autoRun: jobsAutoRun,
    enableConcurrencyControl: true,
    shouldAutoRun: () => jobsAutorun === "true",
    tasks: [systemHealthTask, dispatchDueFeedsTask, importFeedTask],
  };
}
