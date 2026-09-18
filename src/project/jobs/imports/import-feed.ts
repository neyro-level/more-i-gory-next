import type { TaskConfig } from "payload";

import { transitionImportRunToRunning } from "../../../core/data-access/system/import-feed-run.ts";
import { createImportFeedClaimHandler, runIngestPipeline } from "../../ingest/pipeline.ts";

type ImportFeedTask = {
  input: {
    feedSourceId: string;
    importRunId: string;
  };
  output: {
    status: "running" | "skipped";
  };
};

export const importFeedTask: TaskConfig<ImportFeedTask> = {
  slug: "importFeed",
  inputSchema: [
    { name: "feedSourceId", type: "text", required: true },
    { name: "importRunId", type: "text", required: true },
  ],
  outputSchema: [{ name: "status", type: "text", required: true }],
  concurrency: {
    exclusive: true,
    key: ({ input }) => `import:feed:${input.feedSourceId}`,
  },
  retries: 0,
  handler: async ({ input, req }) => {
    const result = await runIngestPipeline({
      handlers: {
        "claim-running": createImportFeedClaimHandler((claimInput) =>
          transitionImportRunToRunning(
            req.payload as unknown as Parameters<typeof transitionImportRunToRunning>[0],
            claimInput,
          ),
        ),
      },
      input,
    });

    return { output: { status: result.status === "running" ? "running" : "skipped" } };
  },
};
