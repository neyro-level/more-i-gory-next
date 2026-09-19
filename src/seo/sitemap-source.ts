import "server-only";

import { unstable_cache } from "next/cache";
import {
  listPublishedComplexes,
  listPublishedDevelopers,
  listPublishedManualProperties,
  listPublishedSitemapPages,
  listPublicRegions,
} from "@/core/data-access/public";
import { newbuildComplexSitemapEntries, rejectDisallowedSitemapEntries } from "./newbuild-indexing.ts";
import { seoRegistry } from "./registry";
import {
  articleSitemapEntries,
  cmsPageSitemapEntries,
  mergeSitemapEntries,
  normalizeSitemapCanonical,
  publicRegionSitemapEntries,
  publishedCatalogSitemapEntries,
} from "./sitemap-source-contract.ts";
import type { SitemapSourceEntry } from "./sitemap-source-contract.ts";

export { priorityMap } from "./sitemap-source-contract.ts";

export function staticRegistrySitemapEntries(): readonly SitemapSourceEntry[] {
  return seoRegistry
    .filter((entry) => entry.sitemap === "yes" && entry.index === "yes")
    .map((entry) => ({
      canonical: normalizeSitemapCanonical(entry.canonical),
      priority: entry.priority,
    }));
}

async function readSitemapEntries(): Promise<readonly SitemapSourceEntry[]> {
  const staticEntries = staticRegistrySitemapEntries();
  const [complexes, developers, pages, passports, regions] = await Promise.all([
    listPublishedComplexes(),
    listPublishedDevelopers(),
    listPublishedSitemapPages(),
    listPublishedManualProperties(),
    listPublicRegions(),
  ]);
  const catalogEntries = [
    ...newbuildComplexSitemapEntries(complexes),
    ...publishedCatalogSitemapEntries(developers),
    ...publishedCatalogSitemapEntries(passports),
    ...publicRegionSitemapEntries(regions),
    ...articleSitemapEntries(),
  ];

  return rejectDisallowedSitemapEntries(
    mergeSitemapEntries([
      ...staticEntries,
      ...cmsPageSitemapEntries(pages),
      ...catalogEntries,
    ]),
  );
}

export const getSitemapEntries = unstable_cache(readSitemapEntries, ["sitemap-entries"], {
  tags: ["sitemap", "page", "site-settings", "catalog", "developers", "properties"],
});
