import type { CollectionConfig } from "payload";

import { isOwnerAccess } from "../globals/access.ts";

export const Buildings: CollectionConfig = {
  slug: "buildings",
  access: {
    create: isOwnerAccess,
    delete: isOwnerAccess,
    read: isOwnerAccess,
    update: isOwnerAccess,
  },
  admin: {
    defaultColumns: ["name", "complex", "status", "updatedAt"],
    group: "Newbuilds",
    useAsTitle: "name",
  },
  fields: [
    {
      name: "complex",
      type: "relationship",
      hasMany: false,
      index: true,
      relationTo: "residential-complexes",
      required: true,
    },
    { name: "externalBuildingId", type: "text" },
    { name: "name", type: "text", required: true },
    { name: "completionDeadline", type: "text" },
    {
      name: "status",
      type: "select",
      defaultValue: "hidden",
      index: true,
      options: [
        { label: "Hidden", value: "hidden" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
      required: true,
    },
  ],
  indexes: [
    { fields: ["complex", "externalBuildingId"], unique: true },
    { fields: ["status", "complex"] },
  ],
  lockDocuments: false,
  timestamps: true,
  versions: false,
};
