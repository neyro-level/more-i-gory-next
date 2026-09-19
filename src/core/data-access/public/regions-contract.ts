import type { SelectType } from "payload";
import { z } from "zod";

import type { Media, Region } from "../../../payload-types.ts";
import { getRegionRoutePlan } from "../../../content/regions/region-route-plan.ts";
import { composeRegionPathFromSlugs } from "../../../content/regions/region-path-policy.ts";
import { publicMediaSchema } from "./media-contract.ts";

type PublicRegionRecord = Readonly<
  Pick<Region, "id" | "investmentThesis" | "kind" | "lead" | "order" | "riskSummary" | "slug" | "status" | "title"> & {
    heroMedia?: number | Media | null;
    parent?: number | Region | null;
  }
>;

const fallbackImage = {
  alt: "Панорамный вид курортного побережья для сайта Море и Горы",
  height: 1524,
  src: "/images/og/default.webp",
  width: 2560,
};

export const publicRegionSchema = z.object({
  id: z.string().min(1),
  image: publicMediaSchema,
  investmentThesis: z.string().min(1),
  kind: z.enum(["region", "locality", "segment"]),
  lead: z.string().min(1),
  pageId: z.string().min(1),
  parentSlug: z.string().min(1).optional(),
  path: z.string().startsWith("/").endsWith("/"),
  riskSummary: z.string().min(1),
  slug: z.string().min(1),
  status: z.enum(["published", "hidden", "stub"]),
  title: z.string().min(1),
});

export type PublicRegionDTO = z.infer<typeof publicRegionSchema>;

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

function mapImage(value: PublicRegionRecord["heroMedia"]) {
  if (value && typeof value === "object" && typeof value.url === "string") {
    return publicMediaSchema.parse({
      alt: value.alt || fallbackImage.alt,
      height: value.height ?? fallbackImage.height,
      src: value.url,
      width: value.width ?? fallbackImage.width,
    });
  }
  return fallbackImage;
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
