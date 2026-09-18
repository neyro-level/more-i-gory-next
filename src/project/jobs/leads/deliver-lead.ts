import type { TaskConfig } from "payload";

import {
  markLeadDeliverySent,
  recordLeadDeliveryFailureAndMaybeRetry,
  transitionLeadDeliveryToSending,
} from "../../../core/data-access/system/lead-delivery.ts";
import { loadLeadDeliveryForSend } from "../../../core/data-access/system/load-lead-delivery.ts";
import { LeadDeliveryFailure, type LeadDeliveryChannel } from "../../../core/leads/delivery.ts";
import { planRetryableLeadDeliveryFailure } from "../../../core/leads/delivery-state.ts";
import type { StructuredLogger } from "../../../core/observability/index.ts";
import {
  createLeadChannelRegistry,
  type LeadChannelEnv,
} from "../../leads/channel-registry.ts";

type DeliverLeadTask = {
  input: {
    leadDeliveryId: string;
  };
  output: {
    status: "failed" | "missing" | "retry_scheduled" | "sent" | "skipped";
  };
};

type PayloadLike = Parameters<typeof transitionLeadDeliveryToSending>[0] &
  Parameters<typeof loadLeadDeliveryForSend>[0] &
  Parameters<typeof markLeadDeliverySent>[0] &
  Parameters<typeof recordLeadDeliveryFailureAndMaybeRetry>[0];

export const leadDeliveryBackoffMs = [
  0,
  60_000,
  5 * 60_000,
  15 * 60_000,
  60 * 60_000,
  4 * 60 * 60_000,
] as const;

type DeliverLeadRuntime = Readonly<{
  env?: LeadChannelEnv;
  leadDeliveryId: string;
  loadEnv?: () => LeadChannelEnv | Promise<LeadChannelEnv>;
  logger?: Pick<StructuredLogger, "info" | "warn" | "error">;
  now?: Date;
  payload: PayloadLike;
  resolveChannel?: (channelId: string) => LeadDeliveryChannel | undefined;
}>;

function silentLogger(): Pick<StructuredLogger, "info" | "warn" | "error"> {
  return {
    error() {},
    info() {},
    warn() {},
  };
}

function unknownChannelFailure(channelId: string): LeadDeliveryFailure {
  return new LeadDeliveryFailure({
    deliveryCertainty: "not_delivered",
    redactedMessage: `Lead channel is not registered: ${channelId}`,
    retryable: false,
    safeCode: "lead_channel_missing",
  });
}

function unexpectedFailure(): LeadDeliveryFailure {
  return new LeadDeliveryFailure({
    deliveryCertainty: "unknown",
    redactedMessage: "Lead delivery failed before remote confirmation.",
    retryable: true,
    safeCode: "lead_delivery_unexpected",
  });
}

async function recordFailure(
  runtime: DeliverLeadRuntime,
  input: {
    attemptLog: Parameters<typeof planRetryableLeadDeliveryFailure>[0]["attemptLog"];
    attempts: number;
    channelId?: string;
    failure: LeadDeliveryFailure;
  },
): Promise<"failed" | "retry_scheduled"> {
  const now = runtime.now ?? new Date();
  const plan = planRetryableLeadDeliveryFailure({
    attemptLog: input.attemptLog,
    attempts: input.attempts,
    backoffMs: leadDeliveryBackoffMs,
    failure: input.failure,
    now,
  });
  const logger = runtime.logger ?? silentLogger();
  logger.info("lead_delivery_outcome", {
    channelId: input.channelId,
    leadDeliveryId: runtime.leadDeliveryId,
    safeCode: input.failure.safeCode,
    status: plan.status,
  });
  return recordLeadDeliveryFailureAndMaybeRetry(runtime.payload, {
    leadDeliveryId: runtime.leadDeliveryId,
    plan,
  });
}

export async function deliverLead(runtime: DeliverLeadRuntime): Promise<DeliverLeadTask["output"]["status"]> {
  const now = runtime.now ?? new Date();
  const claimed = await transitionLeadDeliveryToSending(runtime.payload, { leadDeliveryId: runtime.leadDeliveryId }, now);
  if (!claimed) return "skipped";

  const loaded = await loadLeadDeliveryForSend(runtime.payload, { leadDeliveryId: runtime.leadDeliveryId });
  if (!loaded) {
    await recordFailure(runtime, {
      attemptLog: [],
      attempts: 0,
      failure: new LeadDeliveryFailure({
        deliveryCertainty: "not_delivered",
        redactedMessage: "Lead delivery row disappeared after claim.",
        retryable: false,
        safeCode: "lead_delivery_missing",
      }),
    });
    return "missing";
  }

  const env = runtime.env ?? (await runtime.loadEnv?.());
  const channel =
    runtime.resolveChannel?.(loaded.channelId) ??
    (env ? createLeadChannelRegistry(env).get(loaded.channelId) : undefined);

  if (!channel) {
    return recordFailure(runtime, {
      attemptLog: loaded.attemptLog,
      attempts: loaded.attempts,
      channelId: loaded.channelId,
      failure: unknownChannelFailure(loaded.channelId),
    });
  }

  try {
    const result = await channel.deliver(loaded.payload);
    const marked = await markLeadDeliverySent(
      runtime.payload,
      { externalRef: result.externalRef, leadDeliveryId: runtime.leadDeliveryId },
      now,
    );
    if (!marked) return "skipped";
    return "sent";
  } catch (error) {
    const failure = error instanceof LeadDeliveryFailure ? error : unexpectedFailure();
    return recordFailure(runtime, {
      attemptLog: loaded.attemptLog,
      attempts: loaded.attempts,
      channelId: loaded.channelId,
      failure,
    });
  }
}

export const deliverLeadTask: TaskConfig<DeliverLeadTask> = {
  slug: "deliverLead",
  inputSchema: [{ name: "leadDeliveryId", type: "text", required: true }],
  outputSchema: [{ name: "status", type: "text", required: true }],
  concurrency: {
    exclusive: true,
    key: ({ input }) => `delivery:${input.leadDeliveryId}`,
    supersedes: false,
  },
  retries: 0,
  handler: async ({ input, req }) => {
    const status = await deliverLead({
      leadDeliveryId: input.leadDeliveryId,
      loadEnv: async () => (await import("../../env.ts")).env,
      payload: req.payload as unknown as PayloadLike,
    });
    return { output: { status } };
  },
};
