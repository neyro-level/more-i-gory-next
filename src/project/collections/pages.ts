import type { CollectionBeforeValidateHook, CollectionConfig } from "payload";

import { pageBlocks } from "../blocks/page-blocks.ts";
import { assertPublishedSeo, seoFields } from "../fields/seo.ts";
import { isOwnerAccess, publicReadAccess } from "../globals/access.ts";

const validatePublishedSeo: CollectionBeforeValidateHook = ({ data }) => {
  if (data) assertPublishedSeo(data);
  return data;
};

export const Pages: CollectionConfig = {
  slug: "pages",
  access: {
    create: isOwnerAccess,
    delete: isOwnerAccess,
    read: publicReadAccess,
    update: isOwnerAccess,
  },
  admin: {
    defaultColumns: ["title", "path", "status", "updatedAt"],
    group: "Content",
    useAsTitle: "title",
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "path", type: "text", required: true, unique: true },
    {
      name: "status",
      type: "select",
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "published" },
        { label: "Archived", value: "archived" },
      ],
      required: true,
    },
    { name: "summary", type: "textarea" },
    seoFields,
    {
      name: "blocks",
      type: "blocks",
      blocks: [...pageBlocks],
      minRows: 1,
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
