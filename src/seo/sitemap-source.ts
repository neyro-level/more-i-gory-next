import "server-only";

import { unstable_cache } from "next/cache";
import { getPayload } from "payload";

import { listPublishedComplexes, listPublishedDevelopers, listPublishedManualProperties } from "@/core/data-access/public";
import { publicReadWithFallback } from "@/core/data-access/public/read-fallback.ts";
import config from "../../payload.config.ts";
import { newbuildComplexSitemapEntries, rejectDisallowedSitemapEntries } from "./newbuild-indexing.ts";
import { seoRegistry } from "./registry";
import {
  articleSitemapEntries,
  cmsPageSitemapEntries,
  mergeSitemapEntries,
  normalizeSitemapCanonical,
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
  const [complexes, developers, passports] = await Promise.all([
    listPublishedComplexes(),
    listPublishedDevelopers(),
    listPublishedManualProperties(),
  ]);
  const catalogEntries = [
    ...newbuildComplexSitemapEntries(complexes),
    ...publishedCatalogSitemapEntries(developers),
    ...publishedCatalogSitemapEntries(passports),
    ...articleSitemapEntries(),
  ];

  return publicReadWithFallback({
    fallback: rejectDisallowedSitemapEntries(mergeSitemapEntries([...staticEntries, ...catalogEntries])),
    reader: "sitemap-cms-pages",
    read: async () => {
      const payload = await getPayload({ config });
      const pages = await payload.find({
        collection: "pages",
        depth: 0,
        limit: 1000,
        overrideAccess: false,
        pagination: false,
        select: {
          path: true,
          seo: true,
          status: true,
        },
        where: {
          status: { equals: "published" },
        },
      });

      return rejectDisallowedSitemapEntries(
        mergeSitemapEntries([
          ...staticEntries,
          ...cmsPageSitemapEntries(pages.docs),
          ...catalogEntries,
        ]),
      );
    },
  });
}

export const getSitemapEntries = unstable_cache(readSitemapEntries, ["sitemap-entries"], {
  tags: ["sitemap", "page", "site-settings", "catalog", "developers", "properties"],
});
