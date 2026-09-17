import "server-only";

import config from "@payload-config";
import { commitTransaction, createLocalReq, getPayload, initTransaction, killTransaction } from "payload";

export type CreateLeadInput = Readonly<{
  activeChannelIds: readonly string[];
  consent: {
    accepted: boolean;
    acceptedAt: string;
    version: string;
  };
  email?: string;
  formId?: string;
  message: string;
  metadata?: Record<string, unknown>;
  name: string;
  phone: string;
  sourcePath: string;
  utm?: Record<string, unknown>;
}>;

export type CreateLeadResult = Readonly<{
  deliveryIds: (number | string)[];
  id: number | string;
  queuedDeliveryIds: (number | string)[];
}>;

async function enqueueLeadDelivery(
  payload: Awaited<ReturnType<typeof getPayload>>,
  leadDeliveryId: number | string,
): Promise<boolean> {
  try {
    await payload.jobs.queue({
      input: { leadDeliveryId: String(leadDeliveryId) },
      overrideAccess: true,
      queue: "lead-deliveries",
      task: "deliverLead",
    } as never);
    return true;
  } catch {
    return false;
  }
}

export async function createLead(input: CreateLeadInput): Promise<CreateLeadResult> {
  const payload = await getPayload({ config });
  const req = await createLocalReq({}, payload);
  const deliveryIds: (number | string)[] = [];
  let leadId: number | string | undefined;

  try {
    await initTransaction(req);
    const lead = await payload.create({
      collection: "leads",
      data: {
        consent: input.consent,
        email: input.email,
        formId: input.formId,
        message: input.message,
        metadata: input.metadata,
        name: input.name,
        phone: input.phone,
        retentionStatus: "active",
        sourcePath: input.sourcePath,
        status: "new",
        utm: input.utm,
      },
      overrideAccess: true,
      req,
    });
    leadId = lead.id;

    for (const channelId of input.activeChannelIds) {
      const delivery = await payload.create({
        collection: "lead-deliveries",
        data: {
          attempts: 0,
          channelId,
          idempotencyKey: `lead:${lead.id}:channel:${channelId}`,
          lead: lead.id,
          status: "pending",
        },
        overrideAccess: true,
        req,
      });
      deliveryIds.push(delivery.id);
    }

    await commitTransaction(req);
  } catch (error) {
    await killTransaction(req);
    throw error;
  }

  const queuedDeliveryIds: (number | string)[] = [];
  for (const deliveryId of deliveryIds) {
    if (await enqueueLeadDelivery(payload, deliveryId)) {
      queuedDeliveryIds.push(deliveryId);
    }
  }

  return { deliveryIds, id: leadId, queuedDeliveryIds };
}
