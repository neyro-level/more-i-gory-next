import type { CollectionConfig } from "payload";

import { isOwnerAccess } from "../globals/access.ts";

export const FeedSources: CollectionConfig = {
  slug: "feed-sources",
  access: {
    create: isOwnerAccess,
    delete: isOwnerAccess,
    read: isOwnerAccess,
    update: isOwnerAccess,
  },
  admin: {
    defaultColumns: ["code", "market", "enabled", "updatedAt"],
    group: "System",
    useAsTitle: "code",
  },
  fields: [
    { name: "code", type: "text", required: true, unique: true },
    { name: "parser", type: "text" },
    {
      name: "market",
      type: "select",
      defaultValue: "newbuild",
      options: [
        { label: "Secondary", value: "secondary" },
        { label: "Newbuild", value: "newbuild" },
      ],
      required: true,
    },
    {
      name: "feedUrlRef",
      type: "text",
      admin: {
        description: "Secret Master reference only. Do not store raw feed credentials here.",
      },
    },
    { name: "enabled", type: "checkbox", defaultValue: false, required: true },
  ],
  timestamps: true,
  versions: false,
};
