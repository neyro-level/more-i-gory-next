type LeadDeliveryTransitionInput = {
  leadDeliveryId: string;
};

type LeadDeliverySentInput = LeadDeliveryTransitionInput & {
  externalRef?: string;
};

type LeadDeliveryFailurePlan = {
  attempts: number;
  attemptLog: readonly Record<string, unknown>[];
  enqueueNextAttempt: boolean;
  lastErrorRedacted: string;
  nextAttemptAt?: string;
  status: "failed" | "pending";
};

type LeadDeliveryRecord = {
  id: number | string;
};

type ManualRetryAuditEntry = {
  actorRef: string;
  reasonRedacted?: string;
  requestedAt: string;
};

type LeadDeliveryManualRetryRecord = LeadDeliveryRecord & {
  manualRetryAudit?: readonly ManualRetryAuditEntry[];
  status?: string;
};

type PayloadLike = {
  findByID?: (args: {
    collection: "lead-deliveries";
    depth: 0;
    id: string;
    overrideAccess: true;
  }) => Promise<LeadDeliveryManualRetryRecord | null | undefined>;
  jobs?: {
    queue: (args: {
      input: { leadDeliveryId: string };
      overrideAccess: true;
      queue: "lead-deliveries";
      task: "deliverLead";
      waitUntil?: Date;
    }) => Promise<unknown>;
  };
  update: (args: {
    collection: "lead-deliveries";
    data: Record<string, unknown>;
    overrideAccess: true;
    where: Record<string, unknown>;
  }) => Promise<{ docs?: LeadDeliveryRecord[] } | unknown>;
};

const defaultMaxManualRetryAuditRows = 20;

function compactManualRetryAudit(
  entries: readonly ManualRetryAuditEntry[],
  maxRows = defaultMaxManualRetryAuditRows,
): readonly ManualRetryAuditEntry[] {
  if (entries.length <= maxRows) return entries;
  return entries.slice(entries.length - maxRows);
}

export async function transitionLeadDeliveryToSending(
  payload: PayloadLike,
  input: LeadDeliveryTransitionInput,
  now = new Date(),
): Promise<boolean> {
  const nowIso = now.toISOString();
  const transition = await payload.update({
    collection: "lead-deliveries",
    data: {
      claimedAt: nowIso,
      heartbeatAt: nowIso,
      status: "sending",
    },
    overrideAccess: true,
    where: {
      and: [
        { id: { equals: input.leadDeliveryId } },
        { status: { equals: "pending" } },
        {
          or: [
            { nextAttemptAt: { less_than_equal: nowIso } },
            { nextAttemptAt: { exists: false } },
          ],
        },
      ],
    },
  });
  const result = transition as { docs?: LeadDeliveryRecord[] };
  return Array.isArray(result.docs) && result.docs.length > 0;
}

export async function retryAbandonedLeadDelivery(
  payload: PayloadLike,
  input: LeadDeliveryTransitionInput & {
    actorRef: string;
    reasonRedacted?: string;
  },
  now = new Date(),
): Promise<boolean> {
  const existing = await payload.findByID?.({
    collection: "lead-deliveries",
    depth: 0,
    id: input.leadDeliveryId,
    overrideAccess: true,
  });

  if (!existing || existing.status !== "abandoned") return false;

  const requestedAt = now.toISOString();
  const manualRetryAudit = compactManualRetryAudit([
    ...(existing.manualRetryAudit ?? []),
    {
      actorRef: input.actorRef,
      reasonRedacted: input.reasonRedacted ?? "Manual retry requested.",
      requestedAt,
    },
  ]);

  const update = await payload.update({
    collection: "lead-deliveries",
    data: {
      claimedAt: null,
      heartbeatAt: null,
      lastErrorRedacted: null,
      manualRetryAudit,
      nextAttemptAt: requestedAt,
      status: "pending",
    },
    overrideAccess: true,
    where: {
      and: [
        { id: { equals: input.leadDeliveryId } },
        { status: { equals: "abandoned" } },
      ],
    },
  });
  const result = update as { docs?: LeadDeliveryRecord[] };
  const retried = Array.isArray(result.docs) && result.docs.length > 0;

  if (retried) {
    await payload.jobs?.queue({
      input: { leadDeliveryId: input.leadDeliveryId },
      overrideAccess: true,
      queue: "lead-deliveries",
      task: "deliverLead",
      waitUntil: now,
    });
  }

  return retried;
}

export async function markLeadDeliverySent(
  payload: PayloadLike,
  input: LeadDeliverySentInput,
  now = new Date(),
): Promise<boolean> {
  const update = await payload.update({
    collection: "lead-deliveries",
    data: {
      externalRef: input.externalRef,
      heartbeatAt: now.toISOString(),
      lastErrorRedacted: null,
      status: "sent",
    },
    overrideAccess: true,
    where: {
      and: [
        { id: { equals: input.leadDeliveryId } },
        { status: { equals: "sending" } },
      ],
    },
  });
  const result = update as { docs?: LeadDeliveryRecord[] };
  return Array.isArray(result.docs) && result.docs.length > 0;
}

export async function recordLeadDeliveryFailureAndMaybeRetry(
  payload: PayloadLike,
  input: LeadDeliveryTransitionInput & { plan: LeadDeliveryFailurePlan },
): Promise<"failed" | "retry_scheduled"> {
  await payload.update({
    collection: "lead-deliveries",
    data: {
      attempts: input.plan.attempts,
      attemptLog: input.plan.attemptLog,
      claimedAt: null,
      heartbeatAt: null,
      lastErrorRedacted: input.plan.lastErrorRedacted,
      nextAttemptAt: input.plan.nextAttemptAt,
      status: input.plan.status,
    },
    overrideAccess: true,
    where: {
      and: [
        { id: { equals: input.leadDeliveryId } },
        { status: { equals: "sending" } },
      ],
    },
  });

  if (input.plan.enqueueNextAttempt && input.plan.nextAttemptAt) {
    await payload.jobs?.queue({
      input: { leadDeliveryId: input.leadDeliveryId },
      overrideAccess: true,
      queue: "lead-deliveries",
      task: "deliverLead",
      waitUntil: new Date(input.plan.nextAttemptAt),
    });
    return "retry_scheduled";
  }

  return "failed";
}
