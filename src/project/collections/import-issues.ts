import type { CollectionConfig } from "payload";

import { isOwnerAccess } from "../globals/access.ts";

export const ImportIssues: CollectionConfig = {
  slug: "import-issues",
  access: {
    create: isOwnerAccess,
    delete: isOwnerAccess,
    read: isOwnerAccess,
    update: isOwnerAccess,
  },
  admin: {
    defaultColumns: ["importRun", "severity", "code", "externalId", "updatedAt"],
    group: "System",
    useAsTitle: "code",
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
      name: "importRun",
      type: "relationship",
      hasMany: false,
      index: true,
      relationTo: "import-runs",
      required: true,
    },
    {
      name: "severity",
      type: "select",
      defaultValue: "warning",
      index: true,
      options: [
        { label: "Info", value: "info" },
        { label: "Warning", value: "warning" },
        { label: "Error", value: "error" },
        { label: "Critical", value: "critical" },
      ],
      required: true,
    },
    { name: "code", type: "text", index: true, required: true },
    { name: "externalId", type: "text", index: true },
    { name: "path", type: "text" },
    { name: "message", type: "textarea", required: true },
    { name: "details", type: "json" },
  ],
  indexes: [
    { fields: ["importRun", "severity"] },
    { fields: ["feedSource", "code"] },
  ],
  lockDocuments: false,
  timestamps: true,
  versions: false,
};
