import type { CollectionBeforeValidateHook, CollectionConfig, FieldAccess } from "payload";

import { createCmsMutationInvalidationHook } from "../../core/cache/collection-invalidation.ts";

import {
  embeddedFeedSourceMarket,
  feedMarketMismatchError,
  feedOriginIdentityError,
  mergeFeedPropertyIdentity,
  resolveFeedSourceId,
} from "../../core/catalog/feed-property-invariants.ts";
import {
  manualPublicationGateError,
  mergeManualPublicationRecord,
} from "../../core/catalog/manual-publication-invariants.ts";
import {
  propertyCategoryOptions,
  propertyDealTypeOptions,
  validatePropertyCategoryField,
  validatePropertyDealTypeField,
} from "../../core/catalog/property-enums.ts";
import { loadFeedSourceMarket } from "../../core/data-access/system/load-feed-source-market.ts";
import { isOwnerAccess, publicReadAccess } from "../globals/access.ts";

const isOwnerFieldAccess: FieldAccess = ({ req }) => req.user?.collection === "users" && req.user.role === "owner";

const privateFieldAccess = {
  read: isOwnerFieldAccess,
};

const assertFeedPropertyInvariants: CollectionBeforeValidateHook = async ({ data, originalDoc, req }) => {
  if (!data) return data;

  const record = mergeFeedPropertyIdentity(originalDoc, data);
  const identityError = feedOriginIdentityError(record);
  if (identityError) throw new Error(identityError);
  if (record.origin !== "feed") return data;

  const embeddedMarket = embeddedFeedSourceMarket(record.feedSource);
  const feedSourceId = resolveFeedSourceId(record.feedSource);
  const loaded =
    embeddedMarket ??
    (feedSourceId == null ? null : await loadFeedSourceMarket(req.payload, feedSourceId));
  const mismatch = feedMarketMismatchError(record.market, loaded);
  if (mismatch) throw new Error(mismatch);
  return data;
};

const assertManualPublicationInvariants: CollectionBeforeValidateHook = ({ data, originalDoc }) => {
  if (!data) return data;
  const record = mergeManualPublicationRecord(originalDoc, data);
  const error = manualPublicationGateError(record);
  if (error) throw new Error(error);
  return data;
};

const validateInteger = (value: unknown) =>
  value == null || (typeof value === "number" && Number.isInteger(value)) ? true : "Value must be an integer.";

const validateSquareMeters = (value: unknown) =>
  value == null || (typeof value === "number" && Number.isFinite(value) && Number.isInteger(value * 100))
    ? true
    : "Area must be a decimal value with up to two fractional digits.";

const propertySourceFields = [
  {
    name: "label",
    type: "text",
    required: true,
  },
  {
    name: "url",
    type: "text",
  },
] satisfies CollectionConfig["fields"];

const propertyFactFields = [
  {
    name: "label",
    type: "text",
    required: true,
  },
  {
    name: "value",
    type: "textarea",
    required: true,
  },
] satisfies CollectionConfig["fields"];

export const Properties: CollectionConfig = {
  slug: "properties",
  access: {
    create: isOwnerAccess,
    delete: isOwnerAccess,
    read: publicReadAccess,
    update: isOwnerAccess,
  },
  admin: {
    defaultColumns: ["title", "origin", "market", "status", "region", "publishedAt", "updatedAt"],
    group: "Catalog",
    useAsTitle: "title",
  },
  fields: [
    {
      name: "origin",
      type: "select",
      defaultValue: "manual",
      index: true,
      options: [
        { label: "Feed", value: "feed" },
        { label: "Manual", value: "manual" },
      ],
      required: true,
    },
    {
      name: "feedSource",
      type: "relationship",
      hasMany: false,
      relationTo: "feed-sources",
    },
    { name: "externalId", type: "text" },
    { name: "importHash", type: "text" },
    { name: "firstSeenAt", type: "date" },
    { name: "lastSeenAt", type: "date" },
    { name: "lastImportRun", type: "text" },
    { name: "externalComplexId", type: "text" },
    { name: "externalComplexName", type: "text" },
    { name: "externalBuildingId", type: "text" },
    { name: "externalLayoutId", type: "text" },
    {
      name: "complex",
      type: "relationship",
      hasMany: false,
      index: true,
      relationTo: "residential-complexes",
    },
    {
      name: "building",
      type: "relationship",
      hasMany: false,
      index: true,
      relationTo: "buildings",
    },
    {
      name: "layout",
      type: "relationship",
      hasMany: false,
      index: true,
      relationTo: "layouts",
    },
    {
      name: "status",
      type: "select",
      defaultValue: "active",
      index: true,
      options: [
        { label: "Active", value: "active" },
        { label: "Archived", value: "archived" },
      ],
      required: true,
    },
    { name: "deactivatedAt", type: "date" },
    { name: "deactivatedByRun", type: "text" },
    {
      name: "needsReview",
      type: "checkbox",
      defaultValue: false,
      required: true,
    },
    { name: "publishedAt", type: "date", index: true },
    { name: "slug", type: "text", index: true, unique: true },
    {
      name: "market",
      type: "select",
      defaultValue: "secondary",
      index: true,
      options: [
        { label: "Secondary", value: "secondary" },
        { label: "Newbuild", value: "newbuild" },
      ],
      required: true,
    },
    {
      name: "category",
      type: "select",
      index: true,
      options: propertyCategoryOptions,
      validate: validatePropertyCategoryField,
    },
    {
      name: "dealType",
      type: "select",
      index: true,
      options: propertyDealTypeOptions,
      validate: validatePropertyDealTypeField,
    },
    { name: "priceMinor", type: "number", validate: validateInteger },
    { name: "currency", type: "text", defaultValue: "RUB" },
    { name: "pricePerMeterMinor", type: "number", validate: validateInteger },
    { name: "rooms", type: "number", validate: validateInteger },
    { name: "totalArea", type: "number", validate: validateSquareMeters },
    { name: "livingArea", type: "number", validate: validateSquareMeters },
    { name: "kitchenArea", type: "number", validate: validateSquareMeters },
    { name: "floor", type: "number", validate: validateInteger },
    { name: "floors", type: "number", validate: validateInteger },
    {
      name: "region",
      type: "relationship",
      hasMany: false,
      index: true,
      relationTo: "regions",
    },
    {
      name: "cityOrArea",
      type: "relationship",
      hasMany: false,
      index: true,
      relationTo: "regions",
    },
    { name: "locality", type: "text" },
    { name: "district", type: "text" },
    { name: "street", type: "text" },
    { name: "house", type: "text" },
    { name: "publicAddress", type: "text" },
    { name: "lat", type: "number" },
    { name: "lng", type: "number" },
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea" },
    {
      name: "images",
      type: "relationship",
      hasMany: true,
      relationTo: "media",
    },
    { name: "unitNumber", type: "text", access: privateFieldAccess },
    { name: "cadastralNumber", type: "text", access: privateFieldAccess },
    { name: "internalComment", type: "textarea", access: privateFieldAccess },
    { name: "ownerContact", type: "textarea", access: privateFieldAccess },
    { name: "verdict", type: "textarea" },
    {
      name: "facts",
      type: "array",
      fields: propertyFactFields,
    },
    { name: "budgetNote", type: "textarea" },
    { name: "riskSummary", type: "textarea" },
    {
      name: "sources",
      type: "array",
      fields: propertySourceFields,
    },
    { name: "verifiedAt", type: "date" },
  ],
  indexes: [
    { fields: ["feedSource", "externalId"], unique: true },
    { fields: ["origin", "status", "publishedAt"] },
    { fields: ["market", "region"] },
    { fields: ["complex", "building", "layout"] },
  ],
  hooks: {
    afterChange: [createCmsMutationInvalidationHook("properties")],
    afterDelete: [createCmsMutationInvalidationHook("properties")],
    beforeValidate: [assertFeedPropertyInvariants, assertManualPublicationInvariants],
  },
  lockDocuments: false,
  timestamps: true,
  versions: false,
};
