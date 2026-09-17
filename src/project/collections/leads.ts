import type { CollectionConfig } from "payload";

import { isOwnerAccess } from "../globals/access.ts";

const consentFields = [
  { name: "accepted", type: "checkbox", required: true },
  { name: "version", type: "text", required: true },
  { name: "acceptedAt", type: "date", required: true },
] satisfies CollectionConfig["fields"];

export const Leads: CollectionConfig = {
  slug: "leads",
  access: {
    create: isOwnerAccess,
    delete: isOwnerAccess,
    read: isOwnerAccess,
    update: isOwnerAccess,
  },
  admin: {
    defaultColumns: ["status", "name", "phone", "email", "sourcePath", "createdAt"],
    group: "Leads",
    useAsTitle: "name",
  },
  fields: [
    {
      name: "status",
      type: "select",
      defaultValue: "new",
      index: true,
      options: [
        { label: "New", value: "new" },
        { label: "Processing", value: "processing" },
        { label: "Closed", value: "closed" },
        { label: "Spam", value: "spam" },
      ],
      required: true,
    },
    { name: "name", type: "text", required: true },
    { name: "phone", type: "text", required: true },
    { name: "email", type: "email" },
    { name: "message", type: "textarea", required: true },
    { name: "sourcePath", type: "text", index: true, required: true },
    { name: "formId", type: "text", index: true },
    {
      name: "consent",
      type: "group",
      fields: consentFields,
      required: true,
    },
    { name: "utm", type: "json" },
    { name: "metadata", type: "json" },
  ],
  indexes: [
    { fields: ["status", "createdAt"] },
    { fields: ["sourcePath", "createdAt"] },
  ],
  lockDocuments: false,
  timestamps: true,
  versions: false,
};
