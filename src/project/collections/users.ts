import type { Access, CollectionConfig } from "payload";
import { isOwnerAccess, ownerOrSelfAccess } from "@/core/access";

const isOwner: Access = isOwnerAccess;
const ownerOrSelf: Access = ownerOrSelfAccess;

export const Users: CollectionConfig = {
  slug: "users",
  access: {
    admin: ({ req }) => req.user?.collection === "users",
    create: isOwner,
    delete: isOwner,
    read: ownerOrSelf,
    unlock: isOwner,
    update: ownerOrSelf,
  },
  admin: {
    defaultColumns: ["email", "role", "updatedAt"],
    useAsTitle: "email",
  },
  auth: {
    lockTime: 10 * 60 * 1000,
    maxLoginAttempts: 5,
  },
  fields: [
    {
      name: "role",
      type: "select",
      access: {
        update: ({ req }) => req.user?.collection === "users" && req.user.role === "owner",
      },
      defaultValue: "editor",
      options: [
        { label: "Owner", value: "owner" },
        { label: "Editor", value: "editor" },
      ],
      required: true,
      saveToJWT: true,
    },
  ],
  versions: false,
};
