import type { DeliveryCertainty, LeadDeliveryFailure } from "./delivery.ts";

export type LeadDeliveryStatus = "pending" | "sending" | "sent" | "failed" | "abandoned";

export type LeadDeliveryAttemptLogEntry = Readonly<{
  attemptedAt: string;
  deliveryCertainty: DeliveryCertainty;
  outcome: LeadDeliveryStatus;
  redactedMessage?: string;
  safeCode?: string;
}>;

export type LeadDeliveryRetryPlanInput = Readonly<{
  attemptLog?: readonly LeadDeliveryAttemptLogEntry[];
  attempts: number;
  backoffMs: readonly number[];
  failure: Pick<LeadDeliveryFailure, "deliveryCertainty" | "redactedMessage" | "retryable" | "safeCode">;
  maxAttemptLogRows?: number;
  now: Date;
}>;

export type LeadDeliveryRetryPlan = Readonly<{
  attempts: number;
  attemptLog: readonly LeadDeliveryAttemptLogEntry[];
  enqueueNextAttempt: boolean;
  lastErrorRedacted: string;
  nextAttemptAt?: string;
  status: "failed" | "pending";
}>;

const defaultMaxAttemptLogRows = 20;

function compactAttemptLog(
  entries: readonly LeadDeliveryAttemptLogEntry[],
  maxRows: number,
): readonly LeadDeliveryAttemptLogEntry[] {
  if (entries.length <= maxRows) return entries;
  return entries.slice(entries.length - maxRows);
}

export function planRetryableLeadDeliveryFailure(input: LeadDeliveryRetryPlanInput): LeadDeliveryRetryPlan {
  const attempts = input.attempts + 1;
  const attemptedAt = input.now.toISOString();
  const attemptLog = compactAttemptLog(
    [
      ...(input.attemptLog ?? []),
      {
        attemptedAt,
        deliveryCertainty: input.failure.deliveryCertainty,
        outcome: "failed",
        redactedMessage: input.failure.redactedMessage,
        safeCode: input.failure.safeCode,
      },
    ],
    input.maxAttemptLogRows ?? defaultMaxAttemptLogRows,
  );

  if (!input.failure.retryable) {
    return {
      attempts,
      attemptLog,
      enqueueNextAttempt: false,
      lastErrorRedacted: input.failure.redactedMessage,
      status: "failed",
    };
  }

  const backoff = input.backoffMs[Math.min(attempts, input.backoffMs.length - 1)];
  const nextAttemptAt = new Date(input.now.getTime() + backoff).toISOString();

  return {
    attempts,
    attemptLog,
    enqueueNextAttempt: true,
    lastErrorRedacted: input.failure.redactedMessage,
    nextAttemptAt,
    status: "pending",
  };
}
