import type { CollectionConfig } from "payload";

import { isOwnerAccess } from "../globals/access.ts";
import { ownerRetryAbandonedLeadDeliveryEndpoint } from "../leads/owner-retry.ts";

const validateInteger = (value: unknown) =>
  value == null || (typeof value === "number" && Number.isInteger(value) && value >= 0)
    ? true
    : "Value must be a non-negative integer.";

const attemptLogFields = [
  { name: "attemptedAt", type: "date", required: true },
  {
    name: "outcome",
    type: "select",
    options: [
      { label: "Pending", value: "pending" },
      { label: "Sending", value: "sending" },
      { label: "Sent", value: "sent" },
      { label: "Failed", value: "failed" },
      { label: "Abandoned", value: "abandoned" },
    ],
    required: true,
  },
  { name: "safeCode", type: "text" },
  { name: "redactedMessage", type: "textarea" },
] satisfies CollectionConfig["fields"];

const manualRetryAuditFields = [
  { name: "requestedAt", type: "date", required: true },
  { name: "actorRef", type: "text", required: true },
  { name: "reasonRedacted", type: "textarea" },
] satisfies CollectionConfig["fields"];

export const LeadDeliveries: CollectionConfig = {
  slug: "lead-deliveries",
  access: {
    create: isOwnerAccess,
    delete: isOwnerAccess,
    read: isOwnerAccess,
    update: isOwnerAccess,
  },
  admin: {
    defaultColumns: ["lead", "channelId", "status", "attempts", "nextAttemptAt", "updatedAt"],
    description:
      "Owner-only manual retry for abandoned rows: POST /api/lead-deliveries/:id/retry. See docs/OPERATIONS.md.",
    group: "Leads",
    useAsTitle: "idempotencyKey",
  },
  endpoints: [ownerRetryAbandonedLeadDeliveryEndpoint],
  fields: [
    {
      name: "lead",
      type: "relationship",
      hasMany: false,
      index: true,
      relationTo: "leads",
      required: true,
    },
    { name: "channelId", type: "text", index: true, required: true },
    {
      name: "status",
      type: "select",
      defaultValue: "pending",
      index: true,
      options: [
        { label: "Pending", value: "pending" },
        { label: "Sending", value: "sending" },
        { label: "Sent", value: "sent" },
        { label: "Failed", value: "failed" },
        { label: "Abandoned", value: "abandoned" },
      ],
      required: true,
    },
    { name: "attempts", type: "number", defaultValue: 0, required: true, validate: validateInteger },
    { name: "nextAttemptAt", type: "date", index: true },
    { name: "idempotencyKey", type: "text", index: true, required: true, unique: true },
    { name: "externalRef", type: "text", index: true },
    { name: "lastErrorRedacted", type: "textarea" },
    { name: "claimedAt", type: "date", index: true },
    { name: "heartbeatAt", type: "date", index: true },
    {
      name: "manualRetryAudit",
      type: "array",
      fields: manualRetryAuditFields,
      maxRows: 20,
    },
    {
      name: "attemptLog",
      type: "array",
      fields: attemptLogFields,
      maxRows: 20,
    },
  ],
  indexes: [
    { fields: ["status", "nextAttemptAt"] },
    { fields: ["lead", "channelId"], unique: true },
    { fields: ["status", "claimedAt"] },
  ],
  lockDocuments: false,
  timestamps: true,
  versions: false,
};
