import type { TaskConfig } from "payload";

import { loadFeedSourceConditionalState } from "../../../core/data-access/system/load-feed-source-conditional.ts";
import { loadFeedSourceParser } from "../../../core/data-access/system/load-feed-source-parser.ts";
import { loadFeedSourceUrlRef } from "../../../core/data-access/system/load-feed-source-url-ref.ts";
import { loadFeedSourceMarket } from "../../../core/data-access/system/load-feed-source-market.ts";
import { loadFeedDeactivationPolicy } from "../../../core/data-access/system/apply-safe-deactivation.ts";
import { createImportIssue } from "../../../core/data-access/system/create-import-issue.ts";
import { findPropertiesByExternalId } from "../../../core/data-access/system/apply-feed-upsert.ts";
import { createClassifyConditionalHandler } from "../../../core/ingest/classify-conditional.ts";
import { createFetchFeedHandler, parseOutboundAllowedHosts } from "../../../core/ingest/fetch-feed.ts";
import { createSafeDeactivationHandler } from "../../../core/ingest/run-safe-deactivation.ts";
import { createRecordImportIssuesHandler } from "../../../core/ingest/record-issues.ts";
import { createUpsertFeedHandler } from "../../../core/ingest/upsert-feed.ts";
import { createNormalizeFeedHandler } from "../../../core/ingest/normalize-feed.ts";
import { createParseFeedHandler } from "../../../core/ingest/parse-feed.ts";
import { createResolveFeedUrlHandler } from "../../../core/ingest/resolve-feed-url.ts";
import { createFinalizeImportHandler } from "../../../core/ingest/finalize-import.ts";
import { createInvalidateImportCacheHandler } from "../../../core/ingest/invalidate-import-cache.ts";
import { createCacheInvalidator, type CacheInvalidator } from "../../../core/cache/invalidator.ts";
import {
  finalizeUnchangedImportRun,
  touchImportRunHeartbeat,
  transitionImportRunToRunning,
} from "../../../core/data-access/system/import-feed-run.ts";
import { createSafeOutboundClient, type SafeOutboundClient } from "../../../core/security/outbound-http/index.ts";
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
    status: "failed" | "running" | "skipped" | "completed" | "suspicious";
  };
};

type ImportFeedPayload = Parameters<typeof transitionImportRunToRunning>[0] &
  Parameters<typeof loadFeedSourceUrlRef>[0] &
  Parameters<typeof loadFeedSourceConditionalState>[0] &
  Parameters<typeof loadFeedSourceParser>[0] &
  Parameters<typeof loadFeedSourceMarket>[0] &
  Parameters<typeof findPropertiesByExternalId>[0] &
  Parameters<typeof createImportIssue>[0] &
  Parameters<typeof loadFeedDeactivationPolicy>[0];

export function createImportFeedPipelineHandlers(
  payload: ImportFeedPayload,
  lookupEnv: (name: string) => string | undefined | Promise<string | undefined>,
  outbound: SafeOutboundClient | (() => SafeOutboundClient | Promise<SafeOutboundClient>),
  cache?: { invalidator: CacheInvalidator },
): Partial<
  Record<
    | "claim-running"
    | "resolve-feed-url"
    | "fetch"
    | "classify-conditional"
    | "parse"
    | "normalize"
    | "upsert"
    | "record-issues"
    | "safe-deactivation"
    | "finalize"
    | "invalidate-cache",
    IngestStageHandler
  >
> {
  const invalidator =
    cache?.invalidator ??
    createCacheInvalidator({
      branch: "http",
      invalidateBatch: async () => {},
    });
  return {
    "claim-running": createImportFeedClaimHandler((claimInput) =>
      transitionImportRunToRunning(payload, claimInput),
    ),
    "resolve-feed-url": createResolveFeedUrlHandler({
      loadFeedUrlRef: (feedSourceId) => loadFeedSourceUrlRef(payload, feedSourceId),
      lookupEnv,
    }),
    fetch: createFetchFeedHandler({
      loadConditionalState: (feedSourceId) => loadFeedSourceConditionalState(payload, feedSourceId),
      outbound,
    }),
    "classify-conditional": createClassifyConditionalHandler({
      finalizeUnchanged: (claimInput) => finalizeUnchangedImportRun(payload, claimInput),
    }),
    parse: createParseFeedHandler({
      loadParser: (feedSourceId) => loadFeedSourceParser(payload, feedSourceId),
    }),
    normalize: createNormalizeFeedHandler(),
    upsert: createUpsertFeedHandler({ payload }),
    "record-issues": createRecordImportIssuesHandler({ payload }),
    "safe-deactivation": createSafeDeactivationHandler({ payload }),
    finalize: createFinalizeImportHandler({ payload }),
    "invalidate-cache": createInvalidateImportCacheHandler({ invalidator }),
  };
}

async function lookupFeedUrlRuntimeEnv(name: string): Promise<string | undefined> {
  const { lookupRuntimeEnv } = await import("../../env.ts");
  return lookupRuntimeEnv(name);
}

async function createFeedOutboundClient(): Promise<SafeOutboundClient> {
  const { env } = await import("../../env.ts");
  return createSafeOutboundClient({
    allowedHosts: parseOutboundAllowedHosts(env.OUTBOUND_ALLOWED_HOSTS),
  });
}

export const importFeedHeartbeatIntervalMs = 60_000;

export async function runImportFeedWithHeartbeat(args: {
  cache?: { invalidator: CacheInvalidator };
  clearHeartbeatInterval?: (handle: ReturnType<typeof setInterval>) => void;
  lookupEnv: (name: string) => string | undefined | Promise<string | undefined>;
  outbound: SafeOutboundClient | (() => SafeOutboundClient | Promise<SafeOutboundClient>);
  payload: ImportFeedPayload;
  input: ImportFeedTask["input"];
  setHeartbeatInterval?: typeof setInterval;
}): Promise<Awaited<ReturnType<typeof runIngestPipeline>>> {
  const schedule = args.setHeartbeatInterval ?? setInterval;
  const clear = args.clearHeartbeatInterval ?? clearInterval;
  const handle = schedule(() => {
    void touchImportRunHeartbeat(args.payload, args.input);
  }, importFeedHeartbeatIntervalMs);
  try {
    return await runIngestPipeline({
      handlers: createImportFeedPipelineHandlers(
        args.payload,
        args.lookupEnv,
        args.outbound,
        args.cache,
      ),
      input: args.input,
    });
  } finally {
    clear(handle);
  }
}

async function createImportFeedHttpInvalidator(): Promise<CacheInvalidator> {
  return createCacheInvalidator({
    branch: "http",
    async invalidateBatch(targets) {
      const { env } = await import("../../env.ts");
      if (!env.REVALIDATE_SECRET || !env.INTERNAL_REVALIDATE_BASE_URL) {
        throw new Error("HTTP cache invalidation is not configured.");
      }
      const response = await fetch(new URL("/api/internal/revalidate", env.INTERNAL_REVALIDATE_BASE_URL), {
        body: JSON.stringify({ targets }),
        headers: {
          authorization: `Bearer ${env.REVALIDATE_SECRET}`,
          "content-type": "application/json",
        },
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("internal revalidate failed");
      }
    },
  });
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
    const result = await runImportFeedWithHeartbeat({
      cache: { invalidator: await createImportFeedHttpInvalidator() },
      input,
      lookupEnv: lookupFeedUrlRuntimeEnv,
      outbound: createFeedOutboundClient,
      payload: req.payload as unknown as ImportFeedPayload,
    });

    return { output: { status: result.status === "running" ? "running" : result.status } };
  },
};
