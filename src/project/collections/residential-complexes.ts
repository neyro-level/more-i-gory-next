import type { CollectionBeforeValidateHook, CollectionConfig } from "payload";

import { createCmsMutationInvalidationHook } from "../../core/cache/collection-invalidation.ts";

import { pageBlocks } from "../blocks/page-blocks.ts";
import { assertPublishedSeo, seoFields } from "../fields/seo.ts";
import { isOwnerAccess, publicReadAccess } from "../globals/access.ts";

const validatePublishedSeo: CollectionBeforeValidateHook = ({ data }) => {
  if (data) assertPublishedSeo(data);
  return data;
};

const addressFields = [
  { name: "locality", type: "text" },
  { name: "district", type: "text" },
  { name: "street", type: "text" },
  { name: "house", type: "text" },
  { name: "publicAddress", type: "text" },
  { name: "lat", type: "number" },
  { name: "lng", type: "number" },
] satisfies CollectionConfig["fields"];

export const ResidentialComplexes: CollectionConfig = {
  slug: "residential-complexes",
  dbName: "complexes",
  access: {
    create: isOwnerAccess,
    delete: isOwnerAccess,
    read: publicReadAccess,
    update: isOwnerAccess,
  },
  admin: {
    defaultColumns: ["title", "developer", "region", "status", "updatedAt"],
    group: "Newbuilds",
    useAsTitle: "title",
  },
  fields: [
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "title", type: "text", required: true },
    {
      name: "developer",
      type: "relationship",
      hasMany: false,
      index: true,
      relationTo: "developers",
      required: true,
    },
    {
      name: "region",
      type: "relationship",
      hasMany: false,
      index: true,
      relationTo: "regions",
      required: true,
    },
    {
      name: "feedSource",
      type: "relationship",
      hasMany: false,
      relationTo: "feed-sources",
    },
    { name: "externalComplexId", type: "text" },
    {
      name: "address",
      type: "group",
      fields: addressFields,
    },
    {
      name: "media",
      type: "relationship",
      hasMany: true,
      relationTo: "media",
    },
    {
      name: "blocks",
      type: "blocks",
      blocks: [...pageBlocks],
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
    afterChange: [createCmsMutationInvalidationHook("residential-complexes")],
    afterDelete: [createCmsMutationInvalidationHook("residential-complexes")],
    beforeValidate: [validatePublishedSeo],
  },
  indexes: [
    { fields: ["feedSource", "externalComplexId"], unique: true },
    { fields: ["status", "region"] },
    { fields: ["developer", "region"] },
  ],
  lockDocuments: {
    duration: 300,
  },
  timestamps: true,
  versions: {
    drafts: true,
    maxPerDoc: 20,
  },
};
