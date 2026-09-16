import type { CollectionBeforeValidateHook, CollectionConfig } from "payload";

import { pageBlocks } from "../blocks/page-blocks.ts";
import { assertPublishedSeo, seoFields } from "../fields/seo.ts";
import { isOwnerAccess, publicReadAccess } from "../globals/access.ts";

const validatePublishedSeo: CollectionBeforeValidateHook = ({ data }) => {
  if (data) assertPublishedSeo(data);
  return data;
};

export const Regions: CollectionConfig = {
  slug: "regions",
  access: {
    create: isOwnerAccess,
    delete: isOwnerAccess,
    read: publicReadAccess,
    update: isOwnerAccess,
  },
  admin: {
    defaultColumns: ["title", "kind", "parent", "status", "order", "updatedAt"],
    group: "Content",
    useAsTitle: "title",
  },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true },
    {
      name: "kind",
      type: "select",
      options: [
        { label: "Region", value: "region" },
        { label: "Locality", value: "locality" },
        { label: "Segment", value: "segment" },
      ],
      required: true,
    },
    {
      name: "parent",
      type: "relationship",
      hasMany: false,
      relationTo: "regions",
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      required: true,
    },
    { name: "lead", type: "textarea", required: true },
    { name: "investmentThesis", type: "textarea", required: true },
    { name: "riskSummary", type: "textarea", required: true },
    {
      name: "heroMedia",
      type: "relationship",
      hasMany: false,
      relationTo: "media",
      required: true,
    },
    {
      name: "blocks",
      type: "blocks",
      blocks: [...pageBlocks],
      minRows: 1,
      required: true,
    },
    seoFields,
    {
      name: "status",
      type: "text",
      defaultValue: "hidden",
      required: true,
      validate: (value: unknown) =>
        typeof value === "string" && ["published", "hidden", "stub"].includes(value)
          ? true
          : "Region status must be published, hidden or stub.",
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
