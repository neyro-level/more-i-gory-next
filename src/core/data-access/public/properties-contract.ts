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
        | "complex"
        | "deactivatedAt"
        | "description"
        | "facts"
        | "images"
        | "locality"
        | "market"
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
  facts: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).min(1),
  id: z.string().min(1),
  image: publicMediaSchema,
  market: z.enum(["secondary", "newbuild"]).optional(),
  complexId: z.string().min(1).optional(),
  path: z.string().startsWith("/").endsWith("/"),
  publishedAt: z.string().min(1),
  regionLabel: z.string().min(1),
  riskSummary: z.string().min(1),
  slug: z.string().min(1),
  sources: z.array(z.object({ label: z.string().min(1), url: z.string().optional() })).min(1),
  status: z.enum(["active", "archived"]),
  title: z.string().min(1),
  verdict: z.string().min(1),
  verifiedAt: z.string().min(1),
});

export type PublicPropertyDTO = z.infer<typeof publicPropertySchema>;

export const archiveRetentionDays = 60;

export type ArchivedPropertyAction =
  | Readonly<{ kind: "serve-noindex" }>
  | Readonly<{ kind: "redirect"; status: 301; target: string }>
  | Readonly<{ kind: "gone"; status: 410 }>;

export type ArchiveReplacementCandidate = Readonly<{
  complexId?: string;
  market?: "secondary" | "newbuild";
  path: string;
  regionLabel: string;
  slug: string;
}>;

export const publicPropertySelect = {
  budgetNote: true,
  complex: true,
  deactivatedAt: true,
  description: true,
  facts: true,
  id: true,
  images: true,
  locality: true,
  market: true,
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

const manualPassportPublicationExists: Where[] = [
  { publishedAt: { exists: true } },
  { slug: { exists: true } },
  { verifiedAt: { exists: true } },
  { verdict: { exists: true } },
  { riskSummary: { exists: true } },
  { sources: { exists: true } },
  { facts: { exists: true } },
];

export function propertyPublicationWhere(slug?: string): Where {
  const and: Where[] = [
    { origin: { equals: "manual" } },
    { status: { equals: "active" } },
    ...manualPassportPublicationExists,
  ];

  if (slug) {
    and.push({ slug: { equals: slug } });
  }

  return { and };
}

export function propertyRouteWhere(slug?: string): Where {
  const and: Where[] = [{ origin: { equals: "manual" } }, ...manualPassportPublicationExists];

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

function relationId(value: unknown): string | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "object" && value !== null && "id" in value) {
    const id = (value as { id: unknown }).id;
    if (typeof id === "number" || typeof id === "string") return String(id);
  }
  return undefined;
}

export function mapPublicProperty(property: PublicPropertyRecord): PublicPropertyDTO {
  return publicPropertySchema.parse({
    budgetNote: property.budgetNote ?? undefined,
    complexId: relationId(property.complex),
    deactivatedAt: property.deactivatedAt ?? undefined,
    description: property.description ?? undefined,
    facts: property.facts?.map((fact) => ({ label: fact.label, value: fact.value })) ?? [],
    id: String(property.id),
    image: getImage(property),
    market: property.market,
    path: `/obekty/${property.slug}/`,
    publishedAt: property.publishedAt,
    regionLabel: getRegionLabel(property),
    riskSummary: property.riskSummary,
    slug: property.slug,
    sources: property.sources?.map((source) => ({ label: source.label, url: source.url ?? undefined })) ?? [],
    status: property.status,
    title: property.title,
    verdict: property.verdict,
    verifiedAt: property.verifiedAt,
  });
}

function isSameArchiveType(
  archived: Pick<ArchiveReplacementCandidate, "market">,
  candidate: Pick<ArchiveReplacementCandidate, "market">,
): boolean {
  if (!archived.market || !candidate.market) return true;
  return archived.market === candidate.market;
}

export function uniqueArchiveReplacementPath(
  archived: ArchiveReplacementCandidate,
  published: readonly ArchiveReplacementCandidate[],
): string | null {
  const matches = published.filter((candidate) => {
    if (candidate.slug === archived.slug) return false;
    if (candidate.path === "/obekty/" || candidate.path === "/") return false;
    if (!isSameArchiveType(archived, candidate)) return false;
    if (archived.complexId) return candidate.complexId === archived.complexId;
    return candidate.regionLabel === archived.regionLabel;
  });

  return matches.length === 1 ? matches[0]?.path ?? null : null;
}

export function getArchivedPropertyAction(
  property: Pick<PublicPropertyDTO, "deactivatedAt" | "status"> & Partial<ArchiveReplacementCandidate>,
  now: Date = new Date(),
  published: readonly ArchiveReplacementCandidate[] = [],
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

  const target = uniqueArchiveReplacementPath(
    {
      complexId: property.complexId,
      market: property.market,
      path: property.path ?? `/obekty/${property.slug ?? ""}/`,
      regionLabel: property.regionLabel ?? "",
      slug: property.slug ?? "",
    },
    published,
  );

  if (target && target !== "/obekty/" && target !== "/") {
    return { kind: "redirect", status: 301, target };
  }

  return { kind: "gone", status: 410 };
}
