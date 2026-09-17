const minuteMs = 60_000;

export type RecoverableLeadDelivery = Readonly<{
  heartbeatAt?: string | null;
  id: number | string;
  nextAttemptAt?: string | null;
  status: "pending" | "sending";
  updatedAt?: string | null;
}>;

export type LeadDeliveryRecoveryAction = Readonly<{
  data: {
    claimedAt: null;
    heartbeatAt: null;
    lastErrorRedacted: string;
    nextAttemptAt: string;
    status: "pending";
  };
  id: number | string;
  reason: "orphan-pending" | "stale-sending";
  requeue: true;
}>;

export function calculateLeadDeliveryRecoveryThresholdMs(
  maintenanceIntervalMinutes: number,
): number {
  return Math.max(5 * minuteMs, 2 * maintenanceIntervalMinutes * minuteMs);
}

function isDue(value: string | null | undefined, nowMs: number): boolean {
  if (!value) return true;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp <= nowMs;
}

function isOldEnough(
  value: string | null | undefined,
  nowMs: number,
  thresholdMs: number,
): boolean {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && nowMs - timestamp >= thresholdMs;
}

export function planLeadDeliveryRecovery(args: {
  deliveries: readonly RecoverableLeadDelivery[];
  liveLeadDeliveryJobIds: ReadonlySet<string>;
  maintenanceIntervalMinutes: number;
  now: Date;
}): LeadDeliveryRecoveryAction[] {
  const nowIso = args.now.toISOString();
  const nowMs = args.now.getTime();
  const thresholdMs = calculateLeadDeliveryRecoveryThresholdMs(
    args.maintenanceIntervalMinutes,
  );
  const actions: LeadDeliveryRecoveryAction[] = [];

  for (const delivery of args.deliveries) {
    const id = String(delivery.id);

    if (
      delivery.status === "sending" &&
      isOldEnough(delivery.heartbeatAt ?? delivery.updatedAt, nowMs, thresholdMs)
    ) {
      actions.push({
        data: {
          claimedAt: null,
          heartbeatAt: null,
          lastErrorRedacted: "Delivery recovered after stale sending state.",
          nextAttemptAt: nowIso,
          status: "pending",
        },
        id: delivery.id,
        reason: "stale-sending",
        requeue: true,
      });
      continue;
    }

    if (
      delivery.status === "pending" &&
      isDue(delivery.nextAttemptAt, nowMs) &&
      isOldEnough(delivery.updatedAt, nowMs, thresholdMs) &&
      !args.liveLeadDeliveryJobIds.has(id)
    ) {
      actions.push({
        data: {
          claimedAt: null,
          heartbeatAt: null,
          lastErrorRedacted: "Delivery recovered after orphan pending state.",
          nextAttemptAt: nowIso,
          status: "pending",
        },
        id: delivery.id,
        reason: "orphan-pending",
        requeue: true,
      });
    }
  }

  return actions;
}
