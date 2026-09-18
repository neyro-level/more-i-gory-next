import type { PayloadRequest } from "payload";

import { retryAbandonedLeadDelivery } from "../../core/data-access/system/lead-delivery.ts";

function isOwner(req: PayloadRequest): boolean {
  return req.user?.collection === "users" && req.user.role === "owner";
}

function readLeadDeliveryId(req: PayloadRequest): string {
  const value = req.routeParams?.id;
  return typeof value === "string" && value.length > 0 ? value : "";
}

async function readReasonRedacted(req: PayloadRequest): Promise<string | undefined> {
  if (typeof req.json !== "function") return undefined;
  try {
    const body = await req.json();
    if (body && typeof body === "object" && typeof body.reasonRedacted === "string") {
      const trimmed = body.reasonRedacted.trim().slice(0, 300);
      return trimmed.length > 0 ? trimmed : undefined;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export async function handleOwnerRetryAbandonedLeadDelivery(req: PayloadRequest): Promise<Response> {
  if (!isOwner(req)) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  const leadDeliveryId = readLeadDeliveryId(req);
  if (!leadDeliveryId) {
    return Response.json({ error: "invalid_id" }, { status: 400 });
  }

  const retried = await retryAbandonedLeadDelivery(req.payload, {
    actorRef: `owner:${String(req.user?.id ?? "unknown")}`,
    leadDeliveryId,
    reasonRedacted: await readReasonRedacted(req),
  });

  if (!retried) {
    return Response.json({ error: "not_abandoned" }, { status: 409 });
  }

  return Response.json({ ok: true, status: "pending" }, { status: 200 });
}

export const ownerRetryAbandonedLeadDeliveryEndpoint = {
  handler: handleOwnerRetryAbandonedLeadDelivery,
  method: "post" as const,
  path: "/:id/retry",
};
