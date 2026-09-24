import { composeLegacyRegionPathFromSlugs, composeRegionPathFromSlugs } from "./region-path-policy.ts";

export type RegionRouteEntry = Readonly<{
  key: string;
  pageId: string;
  parentKey: string | null;
  pageKey: "CITY" | "REGION" | null;
  slug: string;
}>;

export type RegionInternalLink = Readonly<{
  href: string;
  label: string;
  relation: "child" | "methodology" | "objects" | "parent" | "sibling";
}>;

export const regionRouteEntries = [
  { key: "krym", pageId: "PAGE-007", slug: "krym", parentKey: null, pageKey: "REGION" },
  { key: "yalta", pageId: "PAGE-008", slug: "yalta", parentKey: "krym", pageKey: "CITY" },
  { key: "sevastopol", pageId: "PAGE-009", slug: "sevastopol", parentKey: "krym", pageKey: "CITY" },
  { key: "evpatoriya", pageId: "PAGE-010", slug: "evpatoriya", parentKey: "krym", pageKey: "CITY" },
  { key: "alushta", pageId: "PAGE-011", slug: "alushta", parentKey: "krym", pageKey: "CITY" },
  { key: "krym-novostroyki", pageId: "PAGE-024", slug: "novostroyki", parentKey: "krym", pageKey: null },
  { key: "krym-apartamenty", pageId: "PAGE-025", slug: "apartamenty", parentKey: "krym", pageKey: null },
  { key: "arkhyz", pageId: "PAGE-012", slug: "arkhyz", parentKey: null, pageKey: null },
  { key: "altay", pageId: "PAGE-013", slug: "altay", parentKey: null, pageKey: null },
  { key: "sochi", pageId: "PAGE-003", slug: "sochi", parentKey: null, pageKey: null },
] as const satisfies readonly RegionRouteEntry[];

export function getRegionRoutePath(entry: RegionRouteEntry, entries: readonly RegionRouteEntry[] = regionRouteEntries) {
  const byKey = new Map(entries.map((candidate) => [candidate.key, candidate]));
  const slugs = [entry.slug];
  let parentKey = entry.parentKey;

  while (parentKey) {
    const parent = byKey.get(parentKey);
    if (!parent) throw new Error(`Unknown parentKey "${parentKey}" for ${entry.key}.`);
    slugs.unshift(parent.slug);
    parentKey = parent.parentKey;
  }

  return entry.pageKey ? composeRegionPathFromSlugs(slugs) : composeLegacyRegionPathFromSlugs(slugs);
}

export function getRegionRoutePlan() {
  return regionRouteEntries.map((entry) => ({ ...entry, path: getRegionRoutePath(entry) }));
}

export function getRegionHubPlan() {
  return getRegionRoutePlan().filter((entry) => entry.key !== "sochi");
}

export function getRegionRelatedLinks(
  entry: RegionRouteEntry,
  titles: Readonly<Record<string, string>> = {},
): RegionInternalLink[] {
  const routePlan = getRegionRoutePlan();
  const visibleEntries = routePlan.filter((candidate) => candidate.key !== "sochi");
  const links: RegionInternalLink[] = [];
  const labelFor = (candidate: { key: string; slug: string }) => titles[candidate.key] ?? candidate.slug;

  if (entry.parentKey) {
    const parent = visibleEntries.find((candidate) => candidate.key === entry.parentKey);
    if (parent) links.push({ href: parent.path, label: labelFor(parent), relation: "parent" });
  }

  links.push(
    ...visibleEntries
      .filter((candidate) => candidate.parentKey === entry.key)
      .map((candidate) => ({ href: candidate.path, label: labelFor(candidate), relation: "child" as const })),
  );

  if (entry.parentKey) {
    links.push(
      ...visibleEntries
        .filter((candidate) => candidate.parentKey === entry.parentKey && candidate.key !== entry.key)
        .map((candidate) => ({ href: candidate.path, label: labelFor(candidate), relation: "sibling" as const })),
    );
  }

  links.push(
    { href: "/metodika/", label: "Методика отбора", relation: "methodology" },
    { href: "/obekty/", label: "Объекты", relation: "objects" },
  );

  if (entry.key === "krym-novostroyki") {
    links.push({ href: "/novostroyki/", label: "Каталог ЖК", relation: "objects" });
  }

  return links;
}

export function findRegionRouteBySegments(segments: readonly string[]) {
  try {
    const canonical = composeRegionPathFromSlugs(segments);
    return getRegionRoutePlan().find((entry) => entry.path === canonical) ?? null;
  } catch {
    return null;
  }
}

export function regionPageIdBySlug(slug: string, path: string): string | undefined {
  return getRegionRoutePlan().find((entry) => entry.slug === slug && entry.path === path)?.pageId
    ?? getRegionRoutePlan().find((entry) => entry.path === path)?.pageId;
}
