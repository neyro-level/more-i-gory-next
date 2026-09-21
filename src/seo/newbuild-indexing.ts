import type { PublicComplexDTO } from "@/core/data-access/public";
import type { SitemapSourceEntry } from "./sitemap-source-contract.ts";
import { normalizeSitemapCanonical } from "./sitemap-source-contract.ts";

const newbuildFilterIndexWhitelist = new Set<string>(["/novostroyki/"]);
const newbuildLayoutIndexWhitelist = new Set<string>();
const technicalFixtureCanonicalPatterns = [
  /^\/obekty\/db-proof-[a-z0-9-]+\/$/,
  /^\/obekty\/preview-project\/$/,
  /^\/novostroyki\/preview-complex\/$/,
  /^\/zastroyshchik\/preview-developer\/$/,
] as const;

export function normalizeIndexPath(path: string): string {
  return normalizeSitemapCanonical(path.split("?")[0] ?? path);
}

export function isIndexableNewbuildFilterPath(path: string): boolean {
  return newbuildFilterIndexWhitelist.has(normalizeIndexPath(path));
}

export function isIndexableNewbuildLayoutPath(path: string): boolean {
  return newbuildLayoutIndexWhitelist.has(normalizeIndexPath(path));
}

export function isIndexableNewbuildUnitPath(_path?: string): boolean {
  return false;
}

export function isAllowedSitemapCanonical(canonical: string): boolean {
  if (/[?#]/.test(canonical)) return false;
  const path = normalizeIndexPath(canonical);
  if (technicalFixtureCanonicalPatterns.some((pattern) => pattern.test(path))) return false;
  if (/\/(lot-\d+|unit-[a-z0-9-]+)\/$/.test(path)) return isIndexableNewbuildUnitPath(path);
  if (/\/(planirovki|layouts)\//.test(path)) return isIndexableNewbuildLayoutPath(path);
  if (path.startsWith("/novostroyki/")) {
    const rest = path.slice("/novostroyki/".length).replace(/\/$/, "");
    if (rest.includes("/")) return false;
  }
  return true;
}

export function rejectDisallowedSitemapEntries(
  entries: readonly SitemapSourceEntry[],
): readonly SitemapSourceEntry[] {
  return entries.filter((entry) => isAllowedSitemapCanonical(entry.canonical));
}

export function newbuildComplexSitemapEntries(
  complexes: readonly Pick<PublicComplexDTO, "path">[],
): readonly SitemapSourceEntry[] {
  return complexes.map((complex) => ({
    canonical: normalizeIndexPath(complex.path),
    priority: "P1",
  }));
}
