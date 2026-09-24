import type { SelectType, Where } from "payload";

import type { Media, Property, Region } from "../../../payload-types.ts";
import { routeGrammar } from "../../routing/grammar/index.ts";
import { publicPropertySchema, type PublicPropertyDTO } from "../../dto/property.ts";
import { publicMediaOrFallback } from "./missing-image.ts";

export type { PublicPropertyDTO } from "../../dto/property.ts";

type PublicPropertyRecord = Readonly<
  Pick<Property, "id" | "origin" | "publishedAt" | "slug" | "status" | "title"> &
    Partial<
      Pick<
        Property,
        | "budgetNote"
        | "complex"
        | "cityOrArea"
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
  cityOrArea: true,
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
  { region: { exists: true } },
  { slug: { exists: true } },
  { verifiedAt: { exists: true } },
  { verdict: { exists: true } },
  { riskSummary: { exists: true } },
  { "sources.label": { exists: true } },
  { "facts.label": { exists: true } },
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
  return publicMediaOrFallback({
    alt: firstImage?.alt,
    height: firstImage?.height,
    src: firstImage?.url,
    titleFallback: property.title,
    width: firstImage?.width,
  });
}

function getRegionLabel(property: PublicPropertyRecord): string {
  if (isRelationDocument<Region>(property.cityOrArea)) {
    return property.cityOrArea.title;
  }
  if (isRelationDocument<Region>(property.region)) {
    return property.region.title;
  }

  return property.locality ?? property.publicAddress ?? "Регион уточняется";
}

function getProjectGeoContext(property: PublicPropertyRecord) {
  if (!isRelationDocument<Region>(property.region) || !property.region.slug) {
    throw new Error("Published manual passport requires a populated region relation.");
  }

  const region = {
    id: String(property.region.id),
    path: routeGrammar.buildUrl({ pageKey: "REGION", regionSlug: property.region.slug }),
    slug: property.region.slug,
    title: property.region.title,
  };
  const cityOrArea = isRelationDocument<Region>(property.cityOrArea) && property.cityOrArea.slug
    ? {
        id: String(property.cityOrArea.id),
        path: routeGrammar.buildUrl({
          pageKey: "CITY",
          regionSlug: property.region.slug,
          citySlug: property.cityOrArea.slug,
        }),
        slug: property.cityOrArea.slug,
        title: property.cityOrArea.title,
      }
    : undefined;

  return { cityOrArea, region };
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
    geoContext: getProjectGeoContext(property),
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
