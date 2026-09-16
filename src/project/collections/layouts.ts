import type { CollectionConfig } from "payload";

import { isOwnerAccess } from "../globals/access.ts";

const validateInteger = (value: unknown) =>
  value == null || (typeof value === "number" && Number.isInteger(value)) ? true : "Value must be an integer.";

const validateSquareMeters = (value: unknown) =>
  value == null || (typeof value === "number" && Number.isFinite(value) && Number.isInteger(value * 100))
    ? true
    : "Area must be a decimal value with up to two fractional digits.";

export const Layouts: CollectionConfig = {
  slug: "layouts",
  access: {
    create: isOwnerAccess,
    delete: isOwnerAccess,
    read: isOwnerAccess,
    update: isOwnerAccess,
  },
  admin: {
    defaultColumns: ["externalLayoutId", "complex", "building", "rooms", "totalArea", "status", "updatedAt"],
    group: "Newbuilds",
    useAsTitle: "externalLayoutId",
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
    {
      name: "building",
      type: "relationship",
      hasMany: false,
      index: true,
      relationTo: "buildings",
    },
    { name: "externalLayoutId", type: "text", required: true },
    { name: "rooms", type: "number", validate: validateInteger },
    { name: "totalArea", type: "number", validate: validateSquareMeters },
    {
      name: "plan",
      type: "relationship",
      hasMany: false,
      relationTo: "media",
    },
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
    { fields: ["complex", "building", "externalLayoutId"], unique: true },
    { fields: ["status", "complex"] },
  ],
  lockDocuments: false,
  timestamps: true,
  versions: false,
};
