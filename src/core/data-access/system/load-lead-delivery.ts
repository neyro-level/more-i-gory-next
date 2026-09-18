import type { LeadDeliveryPayload } from "../../leads/delivery.ts";
import type { LeadDeliveryAttemptLogEntry } from "../../leads/delivery-state.ts";

export type LoadLeadDeliveryForSendInput = Readonly<{
  leadDeliveryId: string;
}>;

export type LoadLeadDeliveryForSendResult = Readonly<{
  attemptLog: readonly LeadDeliveryAttemptLogEntry[];
  attempts: number;
  channelId: string;
  payload: LeadDeliveryPayload;
}>;

export class LeadDeliveryLoadError extends Error {
  readonly safeCode: string;

  constructor(safeCode: string, message: string) {
    super(message);
    this.name = "LeadDeliveryLoadError";
    this.safeCode = safeCode;
  }
}

type PayloadLike = {
  findByID: (args: {
    collection: "lead-deliveries" | "leads";
    depth: 0;
    id: number | string;
    overrideAccess: true;
  }) => Promise<unknown>;
};

type RawAttemptLogEntry = Readonly<{
  attemptedAt?: unknown;
  deliveryCertainty?: unknown;
  outcome?: unknown;
  redactedMessage?: unknown;
  safeCode?: unknown;
}>;

function asId(value: unknown, field: string): number | string {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.length > 0) return value;
  if (typeof value === "object" && value !== null && "id" in value) {
    return asId(value.id, field);
  }
  throw new LeadDeliveryLoadError("lead_delivery_invalid_id", `${field} is missing.`);
}

function asRequiredString(value: unknown, field: string): string {
  if (typeof value === "string" && value.length > 0) return value;
  throw new LeadDeliveryLoadError("lead_delivery_invalid_field", `${field} is missing.`);
}

function asIso(value: unknown, field: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  if (typeof value === "string" && value.length > 0) return value;
  throw new LeadDeliveryLoadError("lead_delivery_invalid_field", `${field} is missing.`);
}

function asAttempts(value: unknown): number {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  throw new LeadDeliveryLoadError("lead_delivery_invalid_attempts", "attempts is missing.");
}

function asDeliveryCertainty(value: unknown): LeadDeliveryAttemptLogEntry["deliveryCertainty"] {
  if (value === "confirmed" || value === "not_delivered" || value === "unknown") return value;
  return "unknown";
}

function asOutcome(value: unknown): LeadDeliveryAttemptLogEntry["outcome"] {
  if (
    value === "pending" ||
    value === "sending" ||
    value === "sent" ||
    value === "failed" ||
    value === "abandoned"
  ) {
    return value;
  }
  return "failed";
}

function mapAttemptLog(value: unknown): readonly LeadDeliveryAttemptLogEntry[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry: RawAttemptLogEntry) => ({
    attemptedAt: asIso(entry?.attemptedAt, "attemptLog.attemptedAt"),
    deliveryCertainty: asDeliveryCertainty(entry?.deliveryCertainty),
    outcome: asOutcome(entry?.outcome),
    redactedMessage: typeof entry?.redactedMessage === "string" ? entry.redactedMessage : undefined,
    safeCode: typeof entry?.safeCode === "string" ? entry.safeCode : undefined,
  }));
}

export async function loadLeadDeliveryForSend(
  payload: PayloadLike,
  input: LoadLeadDeliveryForSendInput,
): Promise<LoadLeadDeliveryForSendResult | null> {
  const delivery = (await payload.findByID({
    collection: "lead-deliveries",
    depth: 0,
    id: input.leadDeliveryId,
    overrideAccess: true,
  })) as {
    attempts?: unknown;
    attemptLog?: unknown;
    channelId?: unknown;
    id?: unknown;
    idempotencyKey?: unknown;
    lead?: unknown;
  } | null;

  if (!delivery) return null;

  const leadId = asId(delivery.lead, "lead");
  const lead = (await payload.findByID({
    collection: "leads",
    depth: 0,
    id: leadId,
    overrideAccess: true,
  })) as {
    consent?: { acceptedAt?: unknown; version?: unknown };
    email?: unknown;
    id?: unknown;
    message?: unknown;
    name?: unknown;
    phone?: unknown;
    sourcePath?: unknown;
  } | null;

  if (!lead) {
    throw new LeadDeliveryLoadError("lead_missing", "Lead for delivery is missing.");
  }

  const deliveryId = asId(delivery.id ?? input.leadDeliveryId, "deliveryId");
  const email = typeof lead.email === "string" && lead.email.length > 0 ? lead.email : undefined;

  return {
    attemptLog: mapAttemptLog(delivery.attemptLog),
    attempts: asAttempts(delivery.attempts),
    channelId: asRequiredString(delivery.channelId, "channelId"),
    payload: {
      consent: {
        acceptedAt: asIso(lead.consent?.acceptedAt, "consent.acceptedAt"),
        version: asRequiredString(lead.consent?.version, "consent.version"),
      },
      deliveryId,
      idempotencyKey: asRequiredString(delivery.idempotencyKey, "idempotencyKey"),
      lead: {
        email,
        message: asRequiredString(lead.message, "lead.message"),
        name: asRequiredString(lead.name, "lead.name"),
        phone: asRequiredString(lead.phone, "lead.phone"),
        sourcePath: asRequiredString(lead.sourcePath, "lead.sourcePath"),
      },
      leadId: asId(lead.id ?? leadId, "leadId"),
    },
  };
}
