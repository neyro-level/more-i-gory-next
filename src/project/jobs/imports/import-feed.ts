import type { TaskConfig } from "payload";

import { loadFeedSourceUrlRef } from "../../../core/data-access/system/load-feed-source-url-ref.ts";
import { createResolveFeedUrlHandler } from "../../../core/ingest/resolve-feed-url.ts";
import { transitionImportRunToRunning } from "../../../core/data-access/system/import-feed-run.ts";
import {
  createImportFeedClaimHandler,
  runIngestPipeline,
  type IngestStageHandler,
} from "../../ingest/pipeline.ts";

type ImportFeedTask = {
  input: {
    feedSourceId: string;
    importRunId: string;
  };
  output: {
    status: "failed" | "running" | "skipped";
  };
};

type ImportFeedPayload = Parameters<typeof transitionImportRunToRunning>[0] &
  Parameters<typeof loadFeedSourceUrlRef>[0];

export function createImportFeedPipelineHandlers(
  payload: ImportFeedPayload,
  lookupEnv: (name: string) => string | undefined | Promise<string | undefined>,
): Partial<Record<"claim-running" | "resolve-feed-url", IngestStageHandler>> {
  return {
    "claim-running": createImportFeedClaimHandler((claimInput) =>
      transitionImportRunToRunning(payload, claimInput),
    ),
    "resolve-feed-url": createResolveFeedUrlHandler({
      loadFeedUrlRef: (feedSourceId) => loadFeedSourceUrlRef(payload, feedSourceId),
      lookupEnv,
    }),
  };
}

async function lookupFeedUrlRuntimeEnv(name: string): Promise<string | undefined> {
  const { lookupRuntimeEnv } = await import("../../env.ts");
  return lookupRuntimeEnv(name);
}

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
      handlers: createImportFeedPipelineHandlers(
        req.payload as unknown as ImportFeedPayload,
        lookupFeedUrlRuntimeEnv,
      ),
      input,
    });

    return { output: { status: result.status === "running" ? "running" : result.status } };
  },
};
