import "server-only";

import { unstable_cache } from "next/cache";
import { getPayload } from "payload";

import { listPublishedComplexes } from "@/core/data-access/public";
import config from "../../payload.config.ts";
import { newbuildComplexSitemapEntries } from "./newbuild-indexing.ts";
import { seoRegistry } from "./registry";
import { cmsPageSitemapEntries, mergeSitemapEntries, normalizeSitemapCanonical } from "./sitemap-source-contract.ts";
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
  const complexEntries = newbuildComplexSitemapEntries(await listPublishedComplexes());

  try {
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

    return mergeSitemapEntries([...staticEntries, ...complexEntries, ...cmsPageSitemapEntries(pages.docs)]);
  } catch {
    return mergeSitemapEntries([...staticEntries, ...complexEntries]);
  }
}

export const getSitemapEntries = unstable_cache(readSitemapEntries, ["sitemap-entries"], {
  tags: ["page", "site-settings"],
});
