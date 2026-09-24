import "server-only";

import { unstable_cache } from "next/cache.js";
import { getPayload } from "payload";

import config from "../../../../payload.config.ts";
import { publicReadWithFallback } from "./read-fallback.ts";
import {
  isGenericPublicRegion,
  listFallbackPublicRegions,
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
  return publicReadWithFallback({
    fallback: listFallbackPublicRegions(),
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

export const listPublicRegions = unstable_cache(readPublicRegions, ["public-regions"], {
  tags: ["catalog", "sitemap"],
});

export async function getPublicRegionByPath(path: string): Promise<PublicRegionDTO | null> {
  const regions = await listPublicRegions();
  return regions.find((region) => region.path === path) ?? null;
}

export async function listPublicHubRegions(): Promise<readonly PublicRegionDTO[]> {
  const regions = await listPublicRegions();
  return regions.filter(
    (region) => region.status === "published" && region.slug !== "sochi" && isGenericPublicRegion(region),
  );
}
