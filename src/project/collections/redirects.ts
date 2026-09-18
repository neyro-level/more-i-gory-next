import type { CollectionBeforeValidateHook, CollectionConfig } from "payload";

import { isOwnerAccess, publicReadAccess } from "@/project/globals/access";
import { seoRegistry } from "@/seo/registry";
import { normalizeRedirectPath, validateRedirectEntries, type RedirectEntry } from "@/project/redirects/validation";

const validateRedirects: CollectionBeforeValidateHook = async ({ data, operation, originalDoc, req }) => {
  if (!data || (operation !== "create" && operation !== "update")) return data;

  const source = normalizeRedirectPath(String(data.source ?? ""));
  const destination = normalizeRedirectPath(String(data.destination ?? ""));
  const currentId = originalDoc?.id;

  const [existingRedirects, pages] = await Promise.all([
    req.payload.find({
      collection: "redirects",
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      where: currentId ? { id: { not_equals: currentId } } : undefined,
    }),
    req.payload.find({
      collection: "pages",
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      select: { path: true },
      where: { status: { equals: "published" } },
    }),
  ]);

  const knownTargets = new Set<string>([
    ...seoRegistry.map((entry) => normalizeRedirectPath(entry.canonical)),
    ...pages.docs.map((page) => normalizeRedirectPath(page.path)),
  ]);
  const entries: RedirectEntry[] = [
    ...existingRedirects.docs.map((entry) => ({
      destination: String(entry.destination),
      permanent: entry.permanent !== false,
      source: String(entry.source),
    })),
    { destination, permanent: data.permanent !== false, source },
  ];

  validateRedirectEntries(entries, knownTargets);

  return {
    ...data,
    destination,
    source,
  };
};

export const Redirects: CollectionConfig = {
  slug: "redirects",
  access: {
    create: isOwnerAccess,
    delete: isOwnerAccess,
    read: publicReadAccess,
    update: isOwnerAccess,
  },
  admin: {
    defaultColumns: ["source", "destination", "permanent", "updatedAt"],
    group: "Content",
    useAsTitle: "source",
  },
  fields: [
    { name: "source", type: "text", required: true, unique: true },
    { name: "destination", type: "text", required: true },
    { name: "permanent", type: "checkbox", defaultValue: true, required: true },
  ],
  hooks: {
    beforeValidate: [validateRedirects],
  },
  timestamps: true,
  versions: false,
};
