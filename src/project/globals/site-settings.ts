import type { GlobalConfig } from "payload";

import { isOwnerAccess, publicReadAccess } from "./access.ts";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
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
          label: "Identity",
          fields: [
            {
              name: "siteName",
              type: "text",
              defaultValue: "Море и Горы",
              required: true,
            },
            {
              name: "shortName",
              type: "text",
              defaultValue: "МГ",
              required: true,
            },
            {
              name: "tagline",
              type: "text",
              defaultValue: "инвестиционное бюро",
            },
            {
              name: "canonicalDomain",
              type: "text",
              admin: {
                description: "Owner-filled production origin, for example https://example.ru. Empty until domain is approved.",
              },
            },
          ],
        },
        {
          label: "Contacts",
          fields: [
            {
              name: "contacts",
              type: "group",
              fields: [
                { name: "phone", type: "text" },
                { name: "email", type: "email" },
                { name: "telegram", type: "text" },
                { name: "whatsapp", type: "text" },
                { name: "address", type: "textarea" },
                { name: "workingHours", type: "text" },
              ],
            },
            {
              name: "socialLinks",
              type: "array",
              fields: [
                { name: "label", type: "text", required: true },
                { name: "url", type: "text", required: true },
              ],
            },
          ],
        },
        {
          label: "SEO",
          fields: [
            {
              name: "defaultSeo",
              type: "group",
              fields: [
                { name: "title", type: "text" },
                { name: "description", type: "textarea" },
                { name: "ogImagePath", type: "text" },
                {
                  name: "robots",
                  type: "select",
                  defaultValue: "index-follow",
                  options: [
                    { label: "index, follow", value: "index-follow" },
                    { label: "noindex, follow", value: "noindex-follow" },
                  ],
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: "Legal",
          fields: [
            {
              name: "legalLinks",
              type: "array",
              fields: [
                { name: "label", type: "text", required: true },
                { name: "href", type: "text", required: true },
              ],
            },
            {
              name: "legalNotice",
              type: "textarea",
              defaultValue: "Материалы сайта не являются индивидуальной инвестиционной рекомендацией.",
            },
          ],
        },
        {
          label: "Analytics",
          fields: [
            {
              name: "analytics",
              type: "group",
              admin: {
                description: "Public analytics identifiers only. Secrets and tokens stay in env/secret manager.",
              },
              fields: [
                { name: "yandexMetrikaId", type: "text" },
                { name: "vkPixelId", type: "text" },
                { name: "callTrackingId", type: "text" },
              ],
            },
          ],
        },
      ],
    },
  ],
  versions: {
    drafts: false,
    max: 20,
  },
};
