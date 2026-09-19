import type { CollectionConfig } from "payload";

import { isOwnerAccess } from "../globals/access.ts";

const validateInteger = (value: unknown) =>
  value == null || (typeof value === "number" && Number.isInteger(value)) ? true : "Value must be an integer.";

export const ImportRuns: CollectionConfig = {
  slug: "import-runs",
  access: {
    create: isOwnerAccess,
    delete: isOwnerAccess,
    read: isOwnerAccess,
    update: isOwnerAccess,
  },
  admin: {
    defaultColumns: ["feedSource", "status", "mode", "startedAt", "finishedAt"],
    group: "System",
    useAsTitle: "id",
  },
  fields: [
    {
      name: "feedSource",
      type: "relationship",
      hasMany: false,
      index: true,
      relationTo: "feed-sources",
      required: true,
    },
    {
      name: "status",
      type: "select",
      defaultValue: "queued",
      index: true,
      options: [
        { label: "Queued", value: "queued" },
        { label: "Running", value: "running" },
        { label: "Success", value: "success" },
        { label: "Unchanged", value: "unchanged" },
        { label: "Suspicious", value: "suspicious" },
        { label: "Failed", value: "failed" },
        { label: "Interrupted", value: "interrupted" },
      ],
      required: true,
    },
    {
      name: "mode",
      type: "select",
      defaultValue: "incremental",
      options: [
        { label: "Incremental", value: "incremental" },
        { label: "Full", value: "full" },
      ],
      required: true,
    },
    { name: "jobId", type: "text", index: true },
    { name: "startedAt", type: "date", index: true },
    { name: "heartbeatAt", type: "date", index: true },
    { name: "finishedAt", type: "date" },
    { name: "feedHash", type: "text" },
    { name: "etag", type: "text" },
    { name: "lastModified", type: "text" },
    { name: "offeredCount", type: "number", validate: validateInteger },
    { name: "createdCount", type: "number", defaultValue: 0, required: true, validate: validateInteger },
    { name: "updatedCount", type: "number", defaultValue: 0, required: true, validate: validateInteger },
    { name: "skippedCount", type: "number", defaultValue: 0, required: true, validate: validateInteger },
    { name: "deactivatedCount", type: "number", defaultValue: 0, required: true, validate: validateInteger },
    { name: "issueCount", type: "number", defaultValue: 0, required: true, validate: validateInteger },
    { name: "summary", type: "textarea" },
  ],
  indexes: [
    { fields: ["feedSource", "status"] },
    { fields: ["feedSource", "startedAt"] },
  ],
  lockDocuments: false,
  timestamps: true,
  versions: false,
};
