import { isBaselineImport } from "./import-state.ts";
import { planSafeDeactivation, type SafeDeactivationPlan } from "./safe-deactivation.ts";
import {
  archiveMissingFeedProperties,
  consumeDeactivationApproval,
  findActiveFeedPropertiesInScope,
  loadFeedDeactivationPolicy,
  loadImportRunMode,
} from "../data-access/system/apply-safe-deactivation.ts";
import { createImportIssue } from "../data-access/system/create-import-issue.ts";

type DeactivationPayload = Parameters<typeof loadFeedDeactivationPolicy>[0] &
  Parameters<typeof createImportIssue>[0];

export async function runSafeDeactivation(args: {
  feedSourceId: string;
  importRunId: string;
  nowIso?: string;
  payload: DeactivationPayload;
  seenExternalIds: readonly string[];
}): Promise<SafeDeactivationPlan> {
  const nowIso = args.nowIso ?? new Date().toISOString();
  const mode = await loadImportRunMode(args.payload, args.importRunId);
  const policy = await loadFeedDeactivationPolicy(args.payload, args.feedSourceId);

  if (mode !== "full" || policy.market == null) {
    return planSafeDeactivation({
      activeInScopeCount: 0,
      deactivationApproval: policy.deactivationApproval,
      feedSourceId: args.feedSourceId,
      importRunId: args.importRunId,
      isBaseline: true,
      lastFullRunAt: policy.lastFullRunAt,
      market: policy.market ?? "newbuild",
      maxDeactivationsPerRun: policy.maxDeactivationsPerRun,
      missingFromFeedCount: 0,
      mode,
      nowIso,
      safetyThresholdPercent: policy.safetyThresholdPercent,
    });
  }

  const scope = {
    and: [
      { origin: { equals: "feed" as const } },
      { feedSource: { equals: args.feedSourceId } },
      { market: { equals: policy.market } },
      { status: { equals: "active" as const } },
    ],
  };
  const active = await findActiveFeedPropertiesInScope(args.payload, scope);
  const seen = new Set(args.seenExternalIds);
  const missing = active.filter((item) => !seen.has(item.externalId));
  const plan = planSafeDeactivation({
    activeInScopeCount: active.length,
    deactivationApproval: policy.deactivationApproval,
    feedSourceId: args.feedSourceId,
    importRunId: args.importRunId,
    isBaseline: isBaselineImport({
      lastFeedHash: policy.lastFeedHash,
      lastFullRunAt: policy.lastFullRunAt,
      lastOfferCount: policy.lastOfferCount,
    }),
    lastFullRunAt: policy.lastFullRunAt,
    market: policy.market,
    maxDeactivationsPerRun: policy.maxDeactivationsPerRun,
    missingFromFeedCount: missing.length,
    mode,
    nowIso,
    safetyThresholdPercent: policy.safetyThresholdPercent,
  });

  if (plan.action === "deactivate") {
    await archiveMissingFeedProperties(args.payload, {
      ids: missing.map((item) => item.id),
      patch: plan.deactivationPatch,
    });
    if (plan.consumeApprovalAt) {
      await consumeDeactivationApproval(args.payload, args.feedSourceId, plan.consumeApprovalAt);
    }
  }

  if (plan.action === "suspicious") {
    await createImportIssue(args.payload, {
      code: plan.issueCode,
      feedSource: args.feedSourceId,
      importRun: args.importRunId,
      message: "Mass deactivation blocked by the safety gate.",
      severity: "critical",
    });
  }

  return plan;
}

export function createSafeDeactivationHandler(deps: { payload: DeactivationPayload }) {
  return async (context: {
    input: { feedSourceId: string; importRunId: string };
    state: {
      parse?: { offers?: Array<{ externalId: string }> };
      normalize?: { offers?: Array<{ externalId: string }> };
      deactivation?: SafeDeactivationPlan;
    };
  }) => {
    const seenExternalIds = (context.state.normalize?.offers ?? context.state.parse?.offers ?? []).map(
      (offer) => offer.externalId,
    );
    context.state.deactivation = await runSafeDeactivation({
      feedSourceId: context.input.feedSourceId,
      importRunId: context.input.importRunId,
      payload: deps.payload,
      seenExternalIds,
    });
    return { continue: true, status: "running" as const };
  };
}
