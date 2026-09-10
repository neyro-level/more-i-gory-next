import type { MetadataRoute } from "next";
import { siteUrl } from "@/seo/metadata";
import { getPublishedSitemapEntries } from "@/seo/registry";

const priorityMap = {
  P1: 0.9,
  P2: 0.7,
  P3: 0.5,
} as const;

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return getPublishedSitemapEntries().map((entry) => ({
    changeFrequency: "weekly",
    priority: priorityMap[entry.priority],
    url: new URL(entry.canonical, siteUrl).toString(),
  }));
}
