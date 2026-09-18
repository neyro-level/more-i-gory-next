import "server-only";

import { unstable_cache } from "next/cache.js";
import { getPayload } from "payload";

import config from "../../../../payload.config.ts";
export {
  archiveRetentionDays,
  getArchivedPropertyAction,
  mapPublicProperty,
  propertyPublicationWhere,
  propertyRouteWhere,
  publicPropertySelect,
} from "./properties-contract.ts";
export type { ArchivedPropertyAction, PublicPropertyDTO } from "./properties-contract.ts";

import {
  mapPublicProperty,
  propertyPublicationWhere,
  propertyRouteWhere,
  publicPropertySelect,
  type PublicPropertyDTO,
} from "./properties-contract.ts";
import { publicReadWithFallback } from "./read-fallback.ts";(slug?: string): Promise<readonly PublicPropertyDTO[]> {
  return publicReadWithFallback({
    fallback: [],
    reader: "published-manual-properties",
    read: async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: "properties",
        depth: 1,
        limit: slug ? 1 : 100,
        overrideAccess: false,
        pagination: false,
        select: publicPropertySelect,
        where: propertyPublicationWhere(slug),
      });

      return result.docs.map(mapPublicProperty);
    },
  });
}

async function readManualPropertyRoutes(slug?: string): Promise<readonly PublicPropertyDTO[]> {
  return publicReadWithFallback({
    fallback: [],
    reader: "manual-property-routes",
    read: async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: "properties",
        depth: 1,
        limit: slug ? 1 : 100,
        overrideAccess: false,
        pagination: false,
        select: publicPropertySelect,
        where: propertyRouteWhere(slug),
      });

      return result.docs.map(mapPublicProperty);
    },
  });
}

export const listPublishedManualProperties = unstable_cache(
  () => readPublishedManualProperties(),
  ["published-manual-properties"],
  { tags: ["properties"] },
);

export async function getPublishedManualPropertyBySlug(slug: string): Promise<PublicPropertyDTO | null> {
  const cachedReader = unstable_cache(
    () => readPublishedManualProperties(slug),
    ["published-manual-property", slug],
    { tags: ["properties", `property:${slug}`] },
  );

  return (await cachedReader())[0] ?? null;
}

export const listManualPropertyRouteSlugs = unstable_cache(
  async () => (await readManualPropertyRoutes()).map((property) => property.slug),
  ["manual-property-route-slugs"],
  { tags: ["properties"] },
);

export async function getManualPropertyRouteBySlug(slug: string): Promise<PublicPropertyDTO | null> {
  const cachedReader = unstable_cache(
    () => readManualPropertyRoutes(slug),
    ["manual-property-route", slug],
    { tags: ["properties", `property:${slug}`] },
  );

  return (await cachedReader())[0] ?? null;
}
