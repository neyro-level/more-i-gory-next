import registryData from "./registry.json";
import { seoEntrySchema, type SeoEntry } from "./schema";

export type { SeoEntry } from "./schema";

export const seoRegistry = seoEntrySchema.array().parse(registryData);

export const seoEntriesByPageId = new Map<string, SeoEntry>(
  seoRegistry.map((entry) => [entry.pageId, entry]),
);

export function getSeoEntry(pageId: string): SeoEntry {
  const entry = seoEntriesByPageId.get(pageId);

  if (!entry) {
    throw new Error(`Unknown SEO pageId: ${pageId}`);
  }

  return entry;
}

export function getPublishedSitemapEntries(): SeoEntry[] {
  return seoRegistry.filter((entry) => entry.sitemap === "yes" && entry.index === "yes");
}
