import type { CollectionConfig } from "payload";

import { isOwnerAccess } from "../globals/access.ts";

const validateInteger = (value: unknown) =>
  value == null || (typeof value === "number" && Number.isInteger(value)) ? true : "Value must be an integer.";

const validatePercent = (value: unknown) =>
  value == null || (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100)
    ? true
    : "Value must be a percent from 0 to 100.";

export const FeedSources: CollectionConfig = {
  slug: "feed-sources",
  access: {
    create: isOwnerAccess,
    delete: isOwnerAccess,
    read: isOwnerAccess,
    update: isOwnerAccess,
  },
  admin: {
    defaultColumns: ["code", "parser", "market", "enabled", "nextDueAt", "lastSuccessfulRunAt"],
    group: "System",
    useAsTitle: "code",
  },
  fields: [
    { name: "code", type: "text", index: true, required: true, unique: true },
    { name: "parser", type: "text", index: true },
    {
      name: "market",
      type: "select",
      defaultValue: "newbuild",
      index: true,
      options: [
        { label: "Secondary", value: "secondary" },
        { label: "Newbuild", value: "newbuild" },
      ],
      required: true,
    },
    {
      name: "feedUrlRef",
      type: "text",
      admin: {
        description: "Secret Master reference only. Do not store raw feed credentials here.",
      },
    },
    { name: "enabled", type: "checkbox", defaultValue: false, required: true },
    { name: "refreshIntervalMinutes", type: "number", defaultValue: 60, required: true, validate: validateInteger },
    { name: "nextDueAt", type: "date", index: true },
    { name: "lastAttemptAt", type: "date" },
    { name: "lastSuccessfulRunAt", type: "date" },
    { name: "lastFullRunAt", type: "date" },
    { name: "safetyThresholdPercent", type: "number", defaultValue: 20, required: true, validate: validatePercent },
    { name: "maxDeactivationsPerRun", type: "number", defaultValue: 0, required: true, validate: validateInteger },
    { name: "lastOfferCount", type: "number", validate: validateInteger },
    { name: "lastEtag", type: "text" },
    { name: "lastModified", type: "text" },
    { name: "lastFeedHash", type: "text" },
    {
      name: "deactivationApproval",
      type: "select",
      defaultValue: "required",
      index: true,
      options: [
        { label: "Required", value: "required" },
        { label: "Approved", value: "approved" },
        { label: "Rejected", value: "rejected" },
      ],
      required: true,
    },
    { name: "deactivationApprovalConsumedAt", type: "date" },
  ],
  indexes: [
    { fields: ["enabled", "nextDueAt"] },
    { fields: ["market", "parser"] },
  ],
  timestamps: true,
  versions: false,
};
