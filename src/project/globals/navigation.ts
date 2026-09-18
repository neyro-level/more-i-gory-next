import type { Field, GlobalConfig } from "payload";

import { createCmsMutationInvalidationHook } from "../../core/cache/collection-invalidation.ts";

import { isOwnerAccess, publicReadAccess } from "./access.ts";

const navigationItemFields: Field[] = [
  { name: "label", type: "text", required: true },
  { name: "href", type: "text", required: true },
  {
    name: "openInNewTab",
    type: "checkbox",
    defaultValue: false,
  },
  {
    name: "nofollow",
    type: "checkbox",
    defaultValue: false,
  },
];

export const Navigation: GlobalConfig = {
  slug: "navigation",
  access: {
    read: publicReadAccess,
    update: isOwnerAccess,
  },
  admin: {
    group: "Site",
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Header",
          fields: [
            {
              name: "header",
              type: "array",
              fields: navigationItemFields,
            },
            {
              name: "headerCta",
              type: "group",
              fields: [
                { name: "label", type: "text" },
                { name: "href", type: "text" },
              ],
            },
          ],
        },
        {
          label: "Footer",
          fields: [
            {
              name: "footer",
              type: "array",
              fields: navigationItemFields,
            },
          ],
        },
        {
          label: "Legal",
          fields: [
            {
              name: "legal",
              type: "array",
              fields: navigationItemFields,
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [createCmsMutationInvalidationHook("navigation")],
  },
  versions: {
    drafts: false,
    max: 20,
  },
};
