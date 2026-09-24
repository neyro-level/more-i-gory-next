import type { CollectionBeforeValidateHook, CollectionConfig } from "payload";

import { createCmsMutationInvalidationHook } from "../../core/cache/collection-invalidation.ts";

import { pageBlocks } from "../blocks/page-blocks.ts";
import { assertPublishedSeo, seoFields } from "../fields/seo.ts";
import { isOwnerAccess, publicReadAccess } from "../globals/access.ts";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const validateRegionDomain: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  if (!data) return data;
  const record = { ...originalDoc, ...data };
  if (typeof record.slug !== "string" || !slugPattern.test(record.slug)) {
    throw new Error("Region slug must use lowercase latin letters, digits and single hyphens.");
  }
  if (record.kind === "region" && record.pageKey !== "REGION") {
    throw new Error("Region entities require pageKey REGION.");
  }
  if (record.kind === "locality" && (record.pageKey !== "CITY" || !record.parent)) {
    throw new Error("City or area entities require pageKey CITY and a parent region.");
  }
  if (record.kind === "segment" && record.pageKey) {
    throw new Error("Legacy segment entities cannot own REGION or CITY canonicals.");
  }
  if (record.kind === "segment" && record.status === "published") {
    throw new Error("Legacy segment entities cannot be published as canonical geo pages.");
  }
  if (record.status === "published" && !record.verifiedAt) {
    throw new Error("Published region entities require verifiedAt.");
  }
  return data;
};

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
    { name: "slug", type: "text", index: true, required: true, unique: true },
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
      name: "pageKey",
      type: "select",
      options: [
        { label: "Region canonical", value: "REGION" },
        { label: "City or area canonical", value: "CITY" },
      ],
    },
    { name: "verifiedAt", type: "date" },
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
    afterChange: [createCmsMutationInvalidationHook("regions")],
    afterDelete: [createCmsMutationInvalidationHook("regions")],
    beforeValidate: [validateRegionDomain, validatePublishedSeo],
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
