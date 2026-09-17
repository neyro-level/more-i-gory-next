export type DeactivationApprovalState = "approved" | "rejected" | "required";

export type SafeDeactivationInput = {
  activeInScopeCount: number;
  deactivationApproval: DeactivationApprovalState;
  deactivationApprovalConsumedAt?: string | null;
  feedSourceId: string;
  importRunId: string;
  isBaseline: boolean;
  market: "newbuild" | "secondary";
  maxDeactivationsPerRun: number;
  missingFromFeedCount: number;
  nowIso: string;
  safetyThresholdPercent: number;
};

export type SafeDeactivationPlan =
  | {
      action: "skip";
      reason: "baseline" | "nothing-missing";
      scope: SafeDeactivationScope;
    }
  | {
      action: "suspicious";
      issueCode: "deactivation-approval-consumed" | "deactivation-approval-required" | "deactivation-approval-rejected";
      missingFromFeedCount: number;
      scope: SafeDeactivationScope;
    }
  | {
      action: "deactivate";
      consumeApprovalAt?: string;
      deactivationPatch: {
        deactivatedAt: string;
        deactivatedByRun: string;
        status: "archived";
      };
      missingFromFeedCount: number;
      scope: SafeDeactivationScope;
    };

export type SafeDeactivationScope = {
  and: [
    { origin: { equals: "feed" } },
    { feedSource: { equals: string } },
    { market: { equals: "newbuild" | "secondary" } },
    { status: { equals: "active" } },
  ];
};

export function createSafeDeactivationScope(input: {
  feedSourceId: string;
  market: "newbuild" | "secondary";
}): SafeDeactivationScope {
  return {
    and: [
      { origin: { equals: "feed" } },
      { feedSource: { equals: input.feedSourceId } },
      { market: { equals: input.market } },
      { status: { equals: "active" } },
    ],
  };
}

function exceedsSafetyGate(input: SafeDeactivationInput): boolean {
  if (input.maxDeactivationsPerRun >= 0 && input.missingFromFeedCount > input.maxDeactivationsPerRun) return true;
  if (input.activeInScopeCount <= 0) return input.missingFromFeedCount > 0;

  const missingPercent = (input.missingFromFeedCount / input.activeInScopeCount) * 100;
  return missingPercent > input.safetyThresholdPercent;
}

export function planSafeDeactivation(input: SafeDeactivationInput): SafeDeactivationPlan {
  const scope = createSafeDeactivationScope(input);

  if (input.isBaseline) {
    return { action: "skip", reason: "baseline", scope };
  }

  if (input.missingFromFeedCount <= 0) {
    return { action: "skip", reason: "nothing-missing", scope };
  }

  if (exceedsSafetyGate(input)) {
    if (input.deactivationApproval === "rejected") {
      return {
        action: "suspicious",
        issueCode: "deactivation-approval-rejected",
        missingFromFeedCount: input.missingFromFeedCount,
        scope,
      };
    }

    if (input.deactivationApprovalConsumedAt) {
      return {
        action: "suspicious",
        issueCode: "deactivation-approval-consumed",
        missingFromFeedCount: input.missingFromFeedCount,
        scope,
      };
    }

    if (input.deactivationApproval !== "approved") {
      return {
        action: "suspicious",
        issueCode: "deactivation-approval-required",
        missingFromFeedCount: input.missingFromFeedCount,
        scope,
      };
    }

    return {
      action: "deactivate",
      consumeApprovalAt: input.nowIso,
      deactivationPatch: {
        deactivatedAt: input.nowIso,
        deactivatedByRun: input.importRunId,
        status: "archived",
      },
      missingFromFeedCount: input.missingFromFeedCount,
      scope,
    };
  }

  return {
    action: "deactivate",
    deactivationPatch: {
      deactivatedAt: input.nowIso,
      deactivatedByRun: input.importRunId,
      status: "archived",
    },
    missingFromFeedCount: input.missingFromFeedCount,
    scope,
  };
}
