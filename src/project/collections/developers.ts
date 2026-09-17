import type { CollectionBeforeValidateHook, CollectionConfig } from "payload";

import { assertPublishedSeo, seoFields } from "../fields/seo.ts";
import { isOwnerAccess, publicReadAccess } from "../globals/access.ts";

const validatePublishedSeo: CollectionBeforeValidateHook = ({ data }) => {
  if (data) assertPublishedSeo(data);
  return data;
};

export const Developers: CollectionConfig = {
  slug: "developers",
  access: {
    create: isOwnerAccess,
    delete: isOwnerAccess,
    read: publicReadAccess,
    update: isOwnerAccess,
  },
  admin: {
    defaultColumns: ["title", "status", "updatedAt"],
    group: "Newbuilds",
    useAsTitle: "title",
  },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "media",
      type: "relationship",
      hasMany: true,
      relationTo: "media",
    },
    seoFields,
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
  hooks: {
    beforeValidate: [validatePublishedSeo],
  },
  lockDocuments: {
    duration: 300,
  },
  timestamps: true,
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
};
