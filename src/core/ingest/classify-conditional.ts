import { classifyConditionalFeedResponse } from "./import-state.ts";
import type { FeedFetchResult } from "./fetch-feed.ts";

export type ConditionalClassifyState = {
  businessWrite: false;
  kind: "not-modified" | "read-body";
};

export function createClassifyConditionalHandler(deps: {
  finalizeUnchanged: (input: { feedSourceId: string; importRunId: string }) => Promise<boolean>;
}) {
  return async (context: {
    input: { feedSourceId: string; importRunId: string };
    state: { fetch?: FeedFetchResult; conditional?: ConditionalClassifyState };
  }) => {
    const status = context.state.fetch?.status;
    if (typeof status !== "number") {
      return { continue: false, status: "failed" as const };
    }

    const classified = classifyConditionalFeedResponse(status);
    context.state.conditional = classified;

    if (classified.kind !== "not-modified") {
      return { continue: true, status: "running" as const };
    }

    const finalized = await deps.finalizeUnchanged(context.input);
    return finalized
      ? { continue: false, status: "skipped" as const }
      : { continue: false, status: "failed" as const };
  };
}
