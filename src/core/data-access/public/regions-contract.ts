import type { SelectType } from "payload";

import type { Media, Region } from "../../../payload-types.ts";
import { regionSeedContent } from "../../../content/regions/region-seed-content.ts";
import { getRegionRoutePlan } from "../../../content/regions/region-route-plan.ts";
import type { RegionInternalLink } from "../../../content/regions/region-route-plan.ts";
import { composeRegionPathFromSlugs } from "../../../content/regions/region-path-policy.ts";
import { getMediaAsset } from "../../../content/media/media-assets.ts";
import { publicRegionSchema, type PublicRegionDTO } from "../../dto/region.ts";
import { CANONICAL_MISSING_IMAGE, publicMediaOrFallback } from "./missing-image.ts";

export { publicRegionSchema } from "../../dto/region.ts";
export type { PublicRegionDTO } from "../../dto/region.ts";

type PublicRegionRecord = Readonly<
  Pick<Region, "id" | "investmentThesis" | "kind" | "lead" | "order" | "riskSummary" | "slug" | "status" | "title"> & {
    heroMedia?: number | Media | null;
    parent?: number | Region | null;
  }
>;

function mapImage(value: PublicRegionRecord["heroMedia"]) {
  if (value && typeof value === "object" && typeof value.url === "string") {
    return publicMediaOrFallback({
      alt: value.alt,
      height: value.height,
      src: value.url,
      width: value.width,
    });
  }
  return CANONICAL_MISSING_IMAGE;
}

export function isGenericPublicRegion(region: PublicRegionDTO | null): region is PublicRegionDTO {
  return region?.status === "published";
}

export function getPublicRegionStaticParams(regions: readonly PublicRegionDTO[]) {
  return regions
    .filter(isGenericPublicRegion)
    .filter((region) => region.slug !== "sochi")
    .map((region) => ({
      path: region.path.replace(/^\/investicionnaya-nedvizhimost\//, "").replace(/\/$/, "").split("/"),
    }));
}

export const publicRegionSelect = {
  heroMedia: true,
  id: true,
  investmentThesis: true,
  kind: true,
  lead: true,
  order: true,
  parent: true,
  riskSummary: true,
  slug: true,
  status: true,
  title: true,
} satisfies SelectType;

function relationSlug(value: PublicRegionRecord["parent"]): string | undefined {
  if (value && typeof value === "object" && "slug" in value && typeof value.slug === "string") {
    return value.slug;
  }
}

function regionStatus(value: string): PublicRegionDTO["status"] {
  if (value === "published" || value === "hidden" || value === "stub") return value;
  return "hidden";
}

export function composePublicRegionPath(record: PublicRegionRecord, records: readonly PublicRegionRecord[]): string {
  const byId = new Map(records.map((item) => [item.id, item]));
  const slugs = [record.slug];
  let parent = record.parent;

  while (parent) {
    const parentId = typeof parent === "object" && parent ? parent.id : parent;
    const resolved = typeof parent === "object" && parent && "slug" in parent ? parent : byId.get(Number(parentId));
    if (!resolved) break;
    slugs.unshift(resolved.slug);
    parent = "parent" in resolved ? resolved.parent : undefined;
    if (slugs.length > 8) break;
  }

  return composeRegionPathFromSlugs(slugs);
}

export function mapPublicRegion(
  record: PublicRegionRecord,
  records: readonly PublicRegionRecord[] = [record],
): PublicRegionDTO {
  const path = composePublicRegionPath(record, records);
  const pageId = getRegionRoutePlan().find((entry) => entry.path === path)?.pageId ?? `region:${record.slug}`;

  return publicRegionSchema.parse({
    id: String(record.id),
    image: mapImage(record.heroMedia),
    investmentThesis: record.investmentThesis,
    kind: record.kind,
    lead: record.lead,
    pageId,
    parentSlug: relationSlug(record.parent),
    path,
    riskSummary: record.riskSummary,
    slug: record.slug,
    status: regionStatus(String(record.status)),
    title: record.title,
  });
}

export function mapPublicRegions(records: readonly PublicRegionRecord[]): readonly PublicRegionDTO[] {
  return [...records]
    .sort((left, right) => left.order - right.order)
    .map((record) => mapPublicRegion(record, records));
}

export function listFallbackPublicRegions(): readonly PublicRegionDTO[] {
  const plan = getRegionRoutePlan();
  const byKey = new Map(plan.map((entry) => [entry.key, entry]));

  return plan
    .map((entry) => {
      const content = regionSeedContent[entry.key];
      if (!content) throw new Error(`Missing CMS seed content for region "${entry.key}".`);
      const parent = entry.parentKey ? byKey.get(entry.parentKey) : undefined;

      return publicRegionSchema.parse({
        id: `fallback:${entry.key}`,
        image: publicMediaOrFallback(getMediaAsset(content.mediaSourceLabel) ?? CANONICAL_MISSING_IMAGE),
        investmentThesis: content.investmentThesis,
        kind: content.kind,
        lead: content.lead,
        pageId: entry.pageId,
        parentSlug: parent?.slug,
        path: entry.path,
        riskSummary: content.riskSummary,
        slug: entry.slug,
        status: content.status,
        title: content.title,
      });
    })
    .filter((region) => region.status === "published");
}

const approvedRegionCrossLinks: readonly RegionInternalLink[] = [
  { href: "/metodika/", label: "Методика отбора", relation: "methodology" },
  { href: "/obekty/", label: "Объекты", relation: "objects" },
];

function visiblePublicRegions(regions: readonly PublicRegionDTO[]): readonly PublicRegionDTO[] {
  return regions.filter((region) => region.status === "published" && region.slug !== "sochi");
}

export function getPublicRegionRelatedLinks(
  region: PublicRegionDTO,
  regions: readonly PublicRegionDTO[],
): RegionInternalLink[] {
  const catalog = visiblePublicRegions(regions);
  const links: RegionInternalLink[] = [];

  if (region.parentSlug) {
    const parent = catalog.find((item) => item.slug === region.parentSlug && region.path.startsWith(item.path));
    if (parent) links.push({ href: parent.path, label: parent.title, relation: "parent" });
  }

  links.push(
    ...catalog
      .filter((item) => item.parentSlug === region.slug && item.path.startsWith(region.path))
      .map((item) => ({ href: item.path, label: item.title, relation: "child" as const })),
  );

  if (region.parentSlug) {
    links.push(
      ...catalog
        .filter((item) => item.parentSlug === region.parentSlug && item.id !== region.id)
        .map((item) => ({ href: item.path, label: item.title, relation: "sibling" as const })),
    );
  }

  links.push(...approvedRegionCrossLinks);

  if (region.slug === "novostroyki" && region.parentSlug === "krym") {
    links.push({ href: "/novostroyki/", label: "Каталог ЖК", relation: "objects" });
  }

  return links;
}
