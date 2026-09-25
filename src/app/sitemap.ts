import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/seo/metadata";
import { getSitemapEntries, priorityMap } from "@/seo/sitemap-source";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const entries = await getSitemapEntries();
  return entries.map((entry) => ({
    changeFrequency: "weekly",
    priority: priorityMap[entry.priority],
    url: new URL(entry.canonical, siteUrl).toString(),
  }));
}
