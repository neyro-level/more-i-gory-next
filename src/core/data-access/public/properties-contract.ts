import type { SelectType, Where } from "payload";
import { z } from "zod";

import type { Media, Property, Region } from "../../../payload-types.ts";
import { publicMediaSchema } from "./media-contract.ts";

type PublicPropertyRecord = Readonly<
  Pick<Property, "id" | "origin" | "publishedAt" | "slug" | "status" | "title"> &
    Partial<
      Pick<
        Property,
        | "budgetNote"
        | "deactivatedAt"
        | "description"
        | "facts"
        | "images"
        | "locality"
        | "publicAddress"
        | "region"
        | "riskSummary"
        | "sources"
        | "verifiedAt"
        | "verdict"
      >
    >
>;

const fallbackCover = {
  alt: "Черновая обложка инвестиционного паспорта курортного проекта",
  height: 1000,
  src: "/images/projects/sample-resort/cover.webp",
  width: 1478,
};

const publicPropertySchema = z.object({
  budgetNote: z.string().optional(),
  deactivatedAt: z.string().optional(),
  description: z.string().optional(),
  facts: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).default([]),
  id: z.string().min(1),
  image: publicMediaSchema,
  path: z.string().startsWith("/").endsWith("/"),
  publishedAt: z.string().min(1),
  regionLabel: z.string().min(1),
  riskSummary: z.string().min(1),
  slug: z.string().min(1),
  sources: z.array(z.object({ label: z.string().min(1), url: z.string().optional() })).default([]),
  status: z.enum(["active", "archived"]),
  title: z.string().min(1),
  verdict: z.string().min(1),
  verifiedAt: z.string().optional(),
});

export type PublicPropertyDTO = z.infer<typeof publicPropertySchema>;

export const archiveRetentionDays = 60;

export type ArchivedPropertyAction =
  | Readonly<{ kind: "serve-noindex" }>
  | Readonly<{ kind: "redirect"; status: 301; target: "/obekty/" }>;

export const publicPropertySelect = {
  budgetNote: true,
  deactivatedAt: true,
  description: true,
  facts: true,
  id: true,
  images: true,
  locality: true,
  origin: true,
  publicAddress: true,
  publishedAt: true,
  region: true,
  riskSummary: true,
  slug: true,
  sources: true,
  status: true,
  title: true,
  verifiedAt: true,
  verdict: true,
} satisfies SelectType;

export function propertyPublicationWhere(slug?: string): Where {
  const and: Where[] = [
    { origin: { equals: "manual" } },
    { status: { equals: "active" } },
    { publishedAt: { exists: true } },
  ];

  if (slug) {
    and.push({ slug: { equals: slug } });
  }

  return { and };
}

export function propertyRouteWhere(slug?: string): Where {
  const and: Where[] = [
    { origin: { equals: "manual" } },
    { publishedAt: { exists: true } },
  ];

  if (slug) {
    and.push({ slug: { equals: slug } });
  }

  return { and };
}

function isRelationDocument<T extends { id: number }>(value: number | T | null | undefined): value is T {
  return typeof value === "object" && value !== null;
}

function getImage(property: PublicPropertyRecord) {
  const firstImage = property.images?.find((image): image is Media => isRelationDocument(image));
  const src = firstImage?.url;

  if (!src) {
    return fallbackCover;
  }

  return {
    alt: firstImage.alt?.trim() || property.title,
    height: firstImage.height ?? fallbackCover.height,
    src,
    width: firstImage.width ?? fallbackCover.width,
  };
}

function getRegionLabel(property: PublicPropertyRecord): string {
  if (isRelationDocument<Region>(property.region)) {
    return property.region.title;
  }

  return property.locality ?? property.publicAddress ?? "Регион уточняется";
}

export function mapPublicProperty(property: PublicPropertyRecord): PublicPropertyDTO {
  return publicPropertySchema.parse({
    budgetNote: property.budgetNote ?? undefined,
    deactivatedAt: property.deactivatedAt ?? undefined,
    description: property.description ?? undefined,
    facts: property.facts?.map((fact) => ({ label: fact.label, value: fact.value })) ?? [],
    id: String(property.id),
    image: getImage(property),
    path: `/obekty/${property.slug}/`,
    publishedAt: property.publishedAt,
    regionLabel: getRegionLabel(property),
    riskSummary: property.riskSummary ?? "Риски фиксируются в паспорте перед публикацией.",
    slug: property.slug,
    sources: property.sources?.map((source) => ({ label: source.label, url: source.url ?? undefined })) ?? [],
    status: property.status,
    title: property.title,
    verdict: property.verdict ?? property.description ?? "Инвестиционный вывод готовится к публикации.",
    verifiedAt: property.verifiedAt ?? undefined,
  });
}

export function getArchivedPropertyAction(
  property: Pick<PublicPropertyDTO, "deactivatedAt" | "status">,
  now: Date = new Date(),
): ArchivedPropertyAction {
  if (property.status !== "archived") {
    return { kind: "serve-noindex" };
  }

  if (!property.deactivatedAt) {
    return { kind: "serve-noindex" };
  }

  const deactivatedAt = new Date(property.deactivatedAt);
  const archiveAgeMs = now.getTime() - deactivatedAt.getTime();
  const retentionMs = archiveRetentionDays * 24 * 60 * 60 * 1000;

  if (!Number.isFinite(deactivatedAt.getTime()) || archiveAgeMs <= retentionMs) {
    return { kind: "serve-noindex" };
  }

  return { kind: "redirect", status: 301, target: "/obekty/" };
}
