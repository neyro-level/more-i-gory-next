import { createHash } from "node:crypto";

import { loadImportRunMode } from "../data-access/system/apply-safe-deactivation.ts";
import { finalizeImportRun, markFeedSourceImportFinished } from "../data-access/system/import-feed-run.ts";
import type { IngestPipelineState } from "../../project/ingest/pipeline.ts";

export function hashFeedBody(body: Uint8Array | undefined): string | null {
  if (!body || body.byteLength === 0) return null;
  return createHash("sha256").update(body).digest("hex");
}

export function createFinalizeImportHandler(deps: {
  payload: Parameters<typeof finalizeImportRun>[0] & Parameters<typeof loadImportRunMode>[0];
}) {
  return async (context: {
    input: { feedSourceId: string; importRunId: string };
    state: IngestPipelineState;
  }) => {
    const now = new Date();
    const nowIso = now.toISOString();
    const suspicious = context.state.deactivation?.action === "suspicious";
    const status: "completed" | "suspicious" = suspicious ? "suspicious" : "completed";
    const offeredCount = context.state.parse?.offeredCount ?? 0;
    const createdCount = context.state.upsert?.createdCount ?? 0;
    const updatedCount = context.state.upsert?.updatedCount ?? 0;
    const skippedCount = context.state.upsert?.skippedCount ?? 0;
    const deactivatedCount =
      context.state.deactivation?.action === "deactivate" ? context.state.deactivation.missingFromFeedCount : 0;
    const issueCount = (context.state.recordedIssues?.length ?? 0) + (suspicious ? 1 : 0);
    const feedHash = hashFeedBody(context.state.fetch?.body);
    const mode = await loadImportRunMode(deps.payload, context.input.importRunId);

    const finalized = await finalizeImportRun(
      deps.payload,
      {
        createdCount,
        deactivatedCount,
        etag: context.state.fetch?.etag,
        feedHash,
        feedSourceId: context.input.feedSourceId,
        importRunId: context.input.importRunId,
        issueCount,
        lastModified: context.state.fetch?.lastModified,
        offeredCount,
        skippedCount,
        status,
        summary: suspicious ? "Run finished as suspicious." : "Run completed.",
        updatedCount,
      },
      now,
    );

    if (!finalized) {
      return { continue: false, status: "failed" as const };
    }

    await markFeedSourceImportFinished(deps.payload, {
      etag: context.state.fetch?.etag,
      feedHash,
      feedSourceId: context.input.feedSourceId,
      lastModified: context.state.fetch?.lastModified,
      lastOfferCount: offeredCount,
      markFullRun: mode === "full",
      nowIso,
      successful: !suspicious,
    });

    return { continue: false, status };
  };
}
