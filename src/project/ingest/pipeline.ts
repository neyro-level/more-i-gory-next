import type { FeedParserResult } from "../../core/ingest/parsers/types.ts";
import type { NormalizeFeedResult } from "../../core/ingest/normalize-feed.ts";
import type { UpsertFeedSummary } from "../../core/ingest/upsert-feed.ts";
import type { RecordedImportIssue } from "../../core/ingest/record-issues.ts";
import type { SafeDeactivationPlan } from "../../core/ingest/safe-deactivation.ts";

export const ingestStageOrder = [
  "claim-running",
  "resolve-feed-url",
  "fetch",
  "classify-conditional",
  "parse",
  "normalize",
  "upsert",
  "record-issues",
  "safe-deactivation",
  "finalize",
  "invalidate-cache",
] as const;

export type IngestStageId = (typeof ingestStageOrder)[number];

export type IngestPipelineInput = {
  feedSourceId: string;
  importRunId: string;
};

export type IngestPipelineState = {
  feedUrl?: string;
  fetch?: {
    body: Uint8Array;
    contentType: string | null;
    etag: string | null;
    lastModified: string | null;
    status: number;
  };
  conditional?: {
    businessWrite: false;
    kind: "not-modified" | "read-body";
  };
  parse?: FeedParserResult;
  normalize?: NormalizeFeedResult;
  upsert?: UpsertFeedSummary;
  recordedIssues?: RecordedImportIssue[];
  deactivation?: SafeDeactivationPlan;
  affectedComplexSlugs?: string[];
  affectedSliceSlugs?: string[];
};

export type IngestStageContext = {
  input: IngestPipelineInput;
  state: IngestPipelineState;
};

export type IngestRunStatus = "failed" | "running" | "skipped" | "completed" | "suspicious";

export type IngestStageResult = {
  continue: boolean;
  status: IngestRunStatus;
};

export type IngestStageHandler = (context: IngestStageContext) => Promise<IngestStageResult> | IngestStageResult;

export type IngestPipelineResult = {
  completedStages: IngestStageId[];
  pendingStage: IngestStageId | null;
  status: IngestRunStatus;
  state: IngestPipelineState;
};

export async function runIngestPipeline(args: {
  handlers: Partial<Record<IngestStageId, IngestStageHandler>>;
  input: IngestPipelineInput;
  state?: IngestPipelineState;
}): Promise<IngestPipelineResult> {
  const completedStages: IngestStageId[] = [];
  const state = args.state ?? {};

  for (const stage of ingestStageOrder) {
    const handler = args.handlers[stage];
    if (!handler) {
      return {
        completedStages,
        pendingStage: stage,
        status: completedStages.includes("claim-running") ? "running" : "skipped",
        state,
      };
    }

    const result = await handler({ input: args.input, state });
    completedStages.push(stage);

    if (!result.continue) {
      return {
        completedStages,
        pendingStage: null,
        status: result.status,
        state,
      };
    }
  }

  return {
    completedStages,
    pendingStage: null,
    status: "running",
    state,
  };
}

export function createImportFeedClaimHandler(
  claim: (input: IngestPipelineInput) => Promise<boolean>,
): IngestStageHandler {
  return async ({ input }) => {
    const transitioned = await claim(input);
    return transitioned
      ? { continue: true, status: "running" }
      : { continue: false, status: "skipped" };
  };
}
