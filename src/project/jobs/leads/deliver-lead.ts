import type { TaskConfig } from "payload";

import { transitionLeadDeliveryToSending } from "../../../core/data-access/system/lead-delivery.ts";

type DeliverLeadTask = {
  input: {
    leadDeliveryId: string;
  };
  output: {
    status: "sending" | "skipped";
  };
};

export const leadDeliveryBackoffMs = [
  0,
  60_000,
  5 * 60_000,
  15 * 60_000,
  60 * 60_000,
  4 * 60 * 60_000,
] as const;

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
    const transitioned = await transitionLeadDeliveryToSending(
      req.payload as unknown as Parameters<typeof transitionLeadDeliveryToSending>[0],
      input,
    );

    return { output: { status: transitioned ? "sending" : "skipped" } };
  },
};
