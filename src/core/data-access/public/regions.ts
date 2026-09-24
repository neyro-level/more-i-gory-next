import "server-only";

import { unstable_cache } from "next/cache.js";
import { getPayload } from "payload";

import config from "../../../../payload.config.ts";
import { isPublicReadOperationalError, publicReadOrThrow } from "./read-fallback.ts";
import {
  isGenericPublicRegion,
  listFallbackPublicRegions,
  listFallbackRoutableRegions,
  mapPublicRegions,
  publicRegionSelect,
  type PublicRegionDTO,
} from "./regions-contract.ts";

export type { PublicRegionDTO } from "./regions-contract.ts";
export {
  composePublicRegionPath,
  getPublicRegionStaticParams,
  getPublicRegionRelatedLinks,
  isGenericPublicRegion,
  mapPublicRegion,
  mapPublicRegions,
} from "./regions-contract.ts";

async function readPublicRegions(): Promise<readonly PublicRegionDTO[]> {
  return publicReadOrThrow({
    reader: "public-regions",
    read: async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: "regions",
        depth: 1,
        limit: 100,
        overrideAccess: false,
        pagination: false,
        select: publicRegionSelect,
        where: {
          status: { equals: "published" },
        },
      });

      return mapPublicRegions(result.docs).filter(
        (region) => region.status === "published" && isGenericPublicRegion(region),
      );
    },
  });
}

async function readRoutableRegions(): Promise<readonly PublicRegionDTO[]> {
  return publicReadOrThrow({
    reader: "routable-regions",
    read: async () => {
      const payload = await getPayload({ config });
      const result = await payload.find({
        collection: "regions",
        depth: 1,
        limit: 100,
        overrideAccess: false,
        pagination: false,
        select: publicRegionSelect,
      });

      return mapPublicRegions(result.docs);
    },
  });
}

const getCachedPublicRegions = unstable_cache(readPublicRegions, ["public-regions"], {
  tags: ["catalog", "sitemap"],
});

const getCachedRoutableRegions = unstable_cache(readRoutableRegions, ["routable-regions"], {
  tags: ["catalog", "sitemap"],
});

export async function listPublicRegions(): Promise<readonly PublicRegionDTO[]> {
  try {
    return await getCachedPublicRegions();
  } catch (error) {
    if (isPublicReadOperationalError(error)) return listFallbackPublicRegions();
    throw error;
  }
}

export async function getPublicRegionByPath(path: string): Promise<PublicRegionDTO | null> {
  const regions = await getCachedPublicRegions();
  return regions.find((region) => region.path === path) ?? null;
}

export async function getRoutableRegionByPath(path: string): Promise<PublicRegionDTO | null> {
  let regions: readonly PublicRegionDTO[];
  try {
    regions = await getCachedRoutableRegions();
  } catch (error) {
    if (!isPublicReadOperationalError(error)) throw error;
    regions = listFallbackRoutableRegions();
  }
  return regions.find((region) => region.path === path) ?? null;
}

export async function listPublicHubRegions(): Promise<readonly PublicRegionDTO[]> {
  const regions = await listPublicRegions();
  return regions.filter(isGenericPublicRegion);
}
