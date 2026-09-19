import type { CollectionBeforeValidateHook, CollectionConfig } from "payload";

import { authenticatedFieldReadAccess, isOwnerAccess, publicReadAccess } from "../globals/access.ts";
import { assertMediaAlt } from "../media/alt.ts";
import { assertMediaKindPolicy, assertMediaUploadFile, MEDIA_UPLOAD_POLICY } from "../media/upload-policy.ts";

const validateMediaUpload: CollectionBeforeValidateHook = ({ data, req }) => {
  if (req.file) assertMediaUploadFile(req.file);
  if (data) {
    assertMediaKindPolicy(data);
    assertMediaAlt(data);
  }
  return data;
};

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    create: isOwnerAccess,
    delete: isOwnerAccess,
    read: publicReadAccess,
    update: isOwnerAccess,
  },
  admin: {
    defaultColumns: ["filename", "kind", "alt", "updatedAt"],
    group: "Media",
    useAsTitle: "filename",
  },
  fields: [
    {
      name: "kind",
      type: "select",
      options: [
        { label: "Region content", value: "region" },
        { label: "Project content", value: "project" },
        { label: "Complex content", value: "complex" },
        { label: "Open Graph", value: "og" },
        { label: "UI asset", value: "ui" },
      ],
      required: true,
      access: { read: authenticatedFieldReadAccess },
    },
    {
      name: "decorative",
      type: "checkbox",
      defaultValue: false,
      required: true,
      access: { read: authenticatedFieldReadAccess },
    },
    {
      name: "alt",
      type: "text",
      admin: {
        description: "Use an empty string only when decorative is enabled.",
      },
    },
    {
      name: "caption",
      type: "textarea",
      access: { read: authenticatedFieldReadAccess },
    },
    {
      name: "sourceLabel",
      type: "text",
      access: { read: authenticatedFieldReadAccess },
      admin: {
        description: "Legacy media registry id for seeded assets, or a human-readable source label for new uploads.",
      },
    },
    {
      name: "sourceUrl",
      type: "text",
      access: { read: authenticatedFieldReadAccess },
    },
  ],
  hooks: {
    beforeValidate: [validateMediaUpload],
  },
  timestamps: true,
  upload: {
    adminThumbnail: "thumbnail",
    disableLocalStorage: true,
    imageSizes: [
      {
        height: 320,
        name: "thumbnail",
        position: "centre",
        width: 480,
      },
      {
        height: undefined,
        name: "card",
        position: "centre",
        width: 768,
      },
      {
        height: undefined,
        name: "hero",
        position: "centre",
        width: 1600,
      },
      {
        height: 630,
        name: "og",
        position: "centre",
        width: 1200,
      },
    ],
    mimeTypes: [...MEDIA_UPLOAD_POLICY.allowedMimeTypes],
    pasteURL: false,
  },
  versions: false,
};
