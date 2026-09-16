import type { Page } from "../payload-types.ts";

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

export function normalizeSitemapCanonical(canonical: string): string {
  return canonical === "/" ? "/" : `/${canonical.replace(/^\/+/, "").replace(/\/+$/, "")}/`;
}

export function cmsPageSitemapEntries(pages: readonly Pick<Page, "path" | "seo" | "status">[]): readonly SitemapSourceEntry[] {
  return pages
    .filter((page) => page.status === "published")
    .filter((page) => page.seo?.robots !== "noindex-follow")
    .map((page) => ({
      canonical: normalizeSitemapCanonical(page.seo?.canonicalOverride || page.path),
      priority: page.seo?.priority ?? "P2",
    }));
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
