import {
  cacheTargets,
  invalidateAfterCommit,
  type CacheInvalidator,
} from "../cache/invalidation.ts";
import type { StructuredLogger } from "../observability/index.ts";
import type { IngestPipelineState, IngestRunStatus } from "../../project/ingest/pipeline.ts";

export function importCacheTargetsFromState(state: IngestPipelineState) {
  return cacheTargets.importAffectedBatch({
    complexSlugs: state.affectedComplexSlugs ?? [],
    sliceSlugs: state.affectedSliceSlugs ?? [],
  });
}

export function createInvalidateImportCacheHandler(deps: {
  invalidator: CacheInvalidator;
  logger?: Pick<StructuredLogger, "error" | "info">;
}) {
  const logger = deps.logger ?? {
    error() {},
    info() {},
  };

  return async (context: { state: IngestPipelineState }) => {
    const status: IngestRunStatus =
      context.state.deactivation?.action === "suspicious" ? "suspicious" : "success";
    const targets = importCacheTargetsFromState(context.state);
    await invalidateAfterCommit({
      invalidator: deps.invalidator,
      logger,
      targets,
    });
    return { continue: false, status };
  };
}
