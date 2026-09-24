import type { PublicRegionDTO, SitemapPageDTO } from "@/core/dto";
import type { SeoEntry } from "./registry.ts";
import { resolveSeoState, type SeoRuntimeContour } from "./seo-state.ts";

export type SitemapPriority = "P1" | "P2" | "P3";

export type SitemapSourceEntry = Readonly<{
  canonical: string;
  priority: SitemapPriority;
}>;

export const priorityMap = {
  P1: 0.9,
  P2: 0.7,
  P3: 0.5,
} as const satisfies Record<SitemapPriority, number>;

export const supportedCmsPagePaths = new Set(["/analitika/", "/consent/", "/privacy/"]);

export function normalizeSitemapCanonical(canonical: string): string {
  return canonical === "/" ? "/" : `/${canonical.replace(/^\/+/, "").replace(/\/+$/, "")}/`;
}

export function isSupportedCmsPageCanonical(path: string, canonicalOverride?: string | null): boolean {
  return supportedCmsPagePaths.has(normalizeSitemapCanonical(canonicalOverride || path));
}

export function cmsPageSitemapEntries(
  pages: readonly SitemapPageDTO[],
  runtimeContour?: SeoRuntimeContour,
): readonly SitemapSourceEntry[] {
  return pages
    .map((page) => ({
      page,
      state: resolveSeoState({
        canonical: page.path,
        cmsSeo: page.seo,
        publicationStatus: page.status,
        routeSupported: isSupportedCmsPageCanonical(page.path, page.seo.canonicalOverride),
        runtimeContour,
      }),
    }))
    .filter(({ state }) => state.sitemap)
    .map(({ page, state }) => ({ canonical: state.canonical, priority: page.seo.priority }));
}

export function mergeSitemapEntries(entries: readonly SitemapSourceEntry[]): readonly SitemapSourceEntry[] {
  const seen = new Set<string>();
  const merged: SitemapSourceEntry[] = [];

  for (const entry of entries) {
    if (seen.has(entry.canonical)) continue;
    seen.add(entry.canonical);
    merged.push(entry);
  }

  return merged;
}

export function publishedCatalogSitemapEntries(
  records: readonly { path: string; seo?: { canonicalOverride?: string | null; robots?: "index-follow" | "noindex-follow" | null } }[],
  priority: SitemapPriority = "P1",
  runtimeContour?: SeoRuntimeContour,
): readonly SitemapSourceEntry[] {
  return records
    .map((record) => resolveSeoState({
      canonical: record.path,
      cmsSeo: record.seo,
      publicationStatus: "published",
      runtimeContour,
    }))
    .filter((state) => state.sitemap)
    .map((state) => ({ canonical: state.canonical, priority }));
}

export function publicRegionSitemapEntries(
  regions: readonly PublicRegionDTO[],
  registryEntries: readonly SeoEntry[] = [],
  runtimeContour?: SeoRuntimeContour,
): readonly SitemapSourceEntry[] {
  const registryByPageId = new Map(registryEntries.map((entry) => [entry.pageId, entry]));
  return regions
    .filter((region) => region.pageKey === "REGION" || region.pageKey === "CITY")
    .map((region) => ({
      state: resolveSeoState({
        canonical: region.path,
        publicationStatus: region.status,
        registry: registryByPageId.get(region.pageId),
        runtimeContour,
      }),
    }))
    .filter(({ state }) => state.sitemap)
    .map(({ state }) => ({ canonical: state.canonical, priority: "P1" }));
}

export function articleSitemapEntries(
  articles: readonly Readonly<{
    contentGate: "pass" | "fail" | "missing";
    path: string;
    registry: SeoEntry;
    status: "draft" | "review" | "published" | "archived";
  }>[] = [],
  runtimeContour?: SeoRuntimeContour,
): readonly SitemapSourceEntry[] {
  return articles
    .map((article) => resolveSeoState({
      canonical: article.path,
      contentGate: article.contentGate,
      lifecycle: article.status === "archived" ? "archived" : "active",
      publicationStatus: article.status,
      registry: article.registry,
      runtimeContour,
    }))
    .filter((state) => state.sitemap)
    .map((state) => ({ canonical: state.canonical, priority: "P2" }));
}
