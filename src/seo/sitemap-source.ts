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
import { articles } from "@/content/articles/articles";
import { resolveRuntimeContour } from "@/project/runtime-contour";
import { getSeoEntry, seoRegistry } from "./registry";
import { resolveSeoState } from "./seo-state.ts";
import {
  articleSitemapEntries,
  cmsPageSitemapEntries,
  mergeSitemapEntries,
  publicRegionSitemapEntries,
  publishedCatalogSitemapEntries,
} from "./sitemap-source-contract.ts";
import type { SitemapSourceEntry } from "./sitemap-source-contract.ts";

export { priorityMap } from "./sitemap-source-contract.ts";

export function staticRegistrySitemapEntries(): readonly SitemapSourceEntry[] {
  const runtimeContour = resolveRuntimeContour();
  return seoRegistry
    .map((entry) => ({
      entry,
      state: resolveSeoState({ canonical: entry.canonical, registry: entry, runtimeContour }),
    }))
    .filter(({ state }) => state.sitemap)
    .map(({ entry, state }) => ({ canonical: state.canonical, priority: entry.priority }));
}

async function readSitemapEntries(): Promise<readonly SitemapSourceEntry[]> {
  const runtimeContour = resolveRuntimeContour();
  const staticEntries = staticRegistrySitemapEntries();
  const [complexes, developers, pages, passports, regions] = await Promise.all([
    listPublishedComplexes(),
    listPublishedDevelopers(),
    listPublishedSitemapPages(),
    listPublishedManualProperties(),
    listPublicRegions(),
  ]);
  const catalogEntries = [
    ...newbuildComplexSitemapEntries(complexes, runtimeContour),
    ...publishedCatalogSitemapEntries(developers, "P1", runtimeContour),
    ...publishedCatalogSitemapEntries(passports, "P1", runtimeContour),
    ...publicRegionSitemapEntries(regions, seoRegistry, runtimeContour),
    ...articleSitemapEntries(articles.map((article) => ({
      contentGate: "missing" as const,
      path: article.path,
      registry: getSeoEntry(article.targetPageId),
      status: article.status,
    })), runtimeContour),
  ];

  return rejectDisallowedSitemapEntries(
    mergeSitemapEntries([
      ...staticEntries,
      ...cmsPageSitemapEntries(pages, runtimeContour),
      ...catalogEntries,
    ]),
  );
}

export const getSitemapEntries = unstable_cache(readSitemapEntries, ["sitemap-entries"], {
  tags: ["sitemap", "page", "site-settings", "catalog", "developers", "properties"],
});
