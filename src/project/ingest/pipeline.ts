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

export type IngestStageContext = {
  input: IngestPipelineInput;
};

export type IngestStageResult = {
  continue: boolean;
  status: "failed" | "running" | "skipped";
};

export type IngestStageHandler = (context: IngestStageContext) => Promise<IngestStageResult> | IngestStageResult;

export type IngestPipelineResult = {
  completedStages: IngestStageId[];
  pendingStage: IngestStageId | null;
  status: "failed" | "running" | "skipped";
};

export async function runIngestPipeline(args: {
  handlers: Partial<Record<IngestStageId, IngestStageHandler>>;
  input: IngestPipelineInput;
}): Promise<IngestPipelineResult> {
  const completedStages: IngestStageId[] = [];

  for (const stage of ingestStageOrder) {
    const handler = args.handlers[stage];
    if (!handler) {
      return {
        completedStages,
        pendingStage: stage,
        status: completedStages.includes("claim-running") ? "running" : "skipped",
      };
    }

    const result = await handler({ input: args.input });
    completedStages.push(stage);

    if (!result.continue) {
      return {
        completedStages,
        pendingStage: null,
        status: result.status,
      };
    }
  }

  return {
    completedStages,
    pendingStage: null,
    status: "running",
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
