import type { TaskConfig } from "payload";

import { dispatchDueFeeds } from "../../../core/data-access/system/dispatch-due-feeds.ts";

type DispatchDueFeedsTask = {
  input: Record<string, never>;
  output: {
    claimed: number;
    queued: number;
  };
};

export const dispatchDueFeedsTask: TaskConfig<DispatchDueFeedsTask> = {
  slug: "dispatchDueFeeds",
  inputSchema: [],
  outputSchema: [
    { name: "claimed", type: "number", required: true },
    { name: "queued", type: "number", required: true },
  ],
  retries: 0,
  schedule: [{ cron: "0 0/5 * * * *", queue: "system" }],
  handler: async ({ req }) => {
    const result = await dispatchDueFeeds(req.payload as unknown as Parameters<typeof dispatchDueFeeds>[0]);
    return { output: result };
  },
};
