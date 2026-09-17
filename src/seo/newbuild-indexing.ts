import type { PublicComplexDTO } from "@/core/data-access/public";
import type { SitemapSourceEntry } from "./sitemap-source-contract.ts";
import { normalizeSitemapCanonical } from "./sitemap-source-contract.ts";

const newbuildFilterIndexWhitelist = new Set<string>(["/novostroyki/"]);
const newbuildLayoutIndexWhitelist = new Set<string>();

export function normalizeIndexPath(path: string): string {
  return normalizeSitemapCanonical(path.split("?")[0] ?? path);
}

export function isIndexableNewbuildFilterPath(path: string): boolean {
  return newbuildFilterIndexWhitelist.has(normalizeIndexPath(path));
}

export function isIndexableNewbuildLayoutPath(path: string): boolean {
  return newbuildLayoutIndexWhitelist.has(normalizeIndexPath(path));
}

export function isIndexableNewbuildUnitPath(): boolean {
  return false;
}

export function newbuildComplexSitemapEntries(
  complexes: readonly Pick<PublicComplexDTO, "path">[],
): readonly SitemapSourceEntry[] {
  return complexes.map((complex) => ({
    canonical: normalizeIndexPath(complex.path),
    priority: "P1",
  }));
}
