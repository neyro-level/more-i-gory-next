import { isFirstFullRun } from "./import-state.ts";

export type DeactivationApprovalDecision = "approved" | "rejected";

export type DeactivationApproval = {
  approvedAt?: string | Date | null;
  approvedBy?: string | null;
  consumedAt?: string | Date | null;
  decision?: DeactivationApprovalDecision | null;
  expiresAt?: string | Date | null;
  runId?: string | null;
};

export type SafeDeactivationInput = {
  activeInScopeCount: number;
  deactivationApproval?: DeactivationApproval | null;
  feedSourceId: string;
  importRunId: string;
  isBaseline?: boolean;
  lastFullRunAt?: string | Date | null;
  market: "newbuild" | "secondary";
  maxDeactivationsPerRun: number;
  missingFromFeedCount: number;
  mode?: "full" | "incremental" | null;
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
      issueCode:
        | "deactivation-approval-consumed"
        | "deactivation-approval-expired"
        | "deactivation-approval-required"
        | "deactivation-approval-rejected"
        | "deactivation-approval-run-mismatch";
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

function hasPresentValue(value: unknown): boolean {
  if (value == null || value === "") return false;
  if (value instanceof Date) return Number.isFinite(value.getTime());
  return true;
}

function timestampMs(value: unknown): number | null {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : null;
  }
  if (typeof value !== "string" || value.trim() === "") return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

export function massDeactivationApprovalIssue(
  approval: DeactivationApproval | null | undefined,
  currentRunId: string,
  nowIso: string,
): Extract<SafeDeactivationPlan, { action: "suspicious" }>["issueCode"] | null {
  if (approval?.decision === "rejected") return "deactivation-approval-rejected";
  if (hasPresentValue(approval?.consumedAt)) return "deactivation-approval-consumed";
  if (approval?.decision !== "approved") return "deactivation-approval-required";
  if (approval.runId !== currentRunId) return "deactivation-approval-run-mismatch";
  if (!hasPresentValue(approval.approvedAt)) return "deactivation-approval-required";
  const expiresAt = timestampMs(approval.expiresAt);
  const now = timestampMs(nowIso);
  if (expiresAt == null || now == null || expiresAt <= now) return "deactivation-approval-expired";
  return null;
}

export function planSafeDeactivation(input: SafeDeactivationInput): SafeDeactivationPlan {
  const scope = createSafeDeactivationScope(input);

  if (input.isBaseline || isFirstFullRun({ lastFullRunAt: input.lastFullRunAt, mode: input.mode })) {
    return { action: "skip", reason: "baseline", scope };
  }

  if (input.missingFromFeedCount <= 0) {
    return { action: "skip", reason: "nothing-missing", scope };
  }

  if (exceedsSafetyGate(input)) {
    const issueCode = massDeactivationApprovalIssue(
      input.deactivationApproval,
      input.importRunId,
      input.nowIso,
    );
    if (issueCode) {
      return {
        action: "suspicious",
        issueCode,
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
