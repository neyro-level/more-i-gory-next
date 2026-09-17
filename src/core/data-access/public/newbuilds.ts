import "server-only";

import { unstable_cache } from "next/cache.js";
import { getPayload } from "payload";
import type { SelectType, Where } from "payload";
import { z } from "zod";

import config from "../../../../payload.config.ts";
import type { Developer, Media, Property, Region, ResidentialComplex } from "../../../payload-types.ts";

const fallbackCover = {
  alt: "Новостройка у моря для инвестиционного разбора",
  height: 1000,
  src: "/images/projects/sample-resort/cover.webp",
  width: 1478,
};

const mediaSchema = z.object({
  alt: z.string().min(1),
  height: z.number().int().positive(),
  src: z.union([z.string().startsWith("/"), z.string().url()]),
  width: z.number().int().positive(),
});

const publicDeveloperSchema = z.object({
  description: z.string().optional(),
  id: z.string().min(1),
  path: z.string().startsWith("/").endsWith("/"),
  slug: z.string().min(1),
  title: z.string().min(1),
});

const publicComplexSchema = z.object({
  address: z.string().optional(),
  developer: publicDeveloperSchema,
  id: z.string().min(1),
  image: mediaSchema,
  path: z.string().startsWith("/").endsWith("/"),
  regionLabel: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
});

const publicNewbuildInventorySchema = z.object({
  id: z.string().min(1),
  priceMinor: z.number().int().positive().optional(),
  rooms: z.number().int().nonnegative().optional(),
  title: z.string().min(1),
  totalArea: z.number().positive().optional(),
});

export type PublicDeveloperDTO = z.infer<typeof publicDeveloperSchema>;
export type PublicComplexDTO = z.infer<typeof publicComplexSchema>;
export type PublicNewbuildInventoryDTO = z.infer<typeof publicNewbuildInventorySchema>;

type RelationDocument<T extends { id: number }> = number | T | null | undefined;

type PublicDeveloperRecord = Readonly<Pick<Developer, "description" | "id" | "slug" | "status" | "title">>;

type PublicComplexRecord = Readonly<
  Pick<ResidentialComplex, "address" | "developer" | "id" | "media" | "region" | "slug" | "status" | "title">
>;

type PublicNewbuildInventoryRecord = Readonly<
  Pick<Property, "id" | "market" | "origin" | "priceMinor" | "rooms" | "status" | "title" | "totalArea">
>;

export const publicDeveloperSelect = {
  description: true,
  id: true,
  slug: true,
  status: true,
  title: true,
} satisfies SelectType;

export const publicComplexSelect = {
  address: true,
  developer: true,
  id: true,
  media: true,
  region: true,
  slug: true,
  status: true,
  title: true,
} satisfies SelectType;

export const publicNewbuildInventorySelect = {
  id: true,
  market: true,
  origin: true,
  priceMinor: true,
  rooms: true,
  status: true,
  title: true,
  totalArea: true,
} satisfies SelectType;

export function publishedDevelopersWhere(slug?: string): Where {
  const and: Where[] = [{ status: { equals: "published" } }];
  if (slug) and.push({ slug: { equals: slug } });
  return { and };
}

export function publishedComplexesWhere(slug?: string): Where {
  const and: Where[] = [{ status: { equals: "published" } }];
  if (slug) and.push({ slug: { equals: slug } });
  return { and };
}

export function activeNewbuildInventoryWhere(complexId: string | number): Where {
  return {
    and: [
      { origin: { equals: "feed" } },
      { market: { equals: "newbuild" } },
      { status: { equals: "active" } },
      { complex: { equals: complexId } },
    ],
  };
}

function isRelationDocument<T extends { id: number }>(value: RelationDocument<T>): value is T {
  return typeof value === "object" && value !== null;
}

function getImage(complex: PublicComplexRecord) {
  const firstImage = complex.media?.find((image): image is Media => isRelationDocument(image));
  const src = firstImage?.url;

  if (!src) return fallbackCover;

  return {
    alt: firstImage.alt?.trim() || complex.title,
    height: firstImage.height ?? fallbackCover.height,
    src,
    width: firstImage.width ?? fallbackCover.width,
  };
}

function getRegionLabel(complex: PublicComplexRecord): string {
  return isRelationDocument<Region>(complex.region) ? complex.region.title : "Крым";
}

function mapPublicDeveloper(developer: PublicDeveloperRecord): PublicDeveloperDTO {
  return publicDeveloperSchema.parse({
    description: developer.description ?? undefined,
    id: String(developer.id),
    path: `/zastroyshchik/${developer.slug}/`,
    slug: developer.slug,
    title: developer.title,
  });
}

function mapPublicComplex(complex: PublicComplexRecord): PublicComplexDTO {
  const developer = isRelationDocument<Developer>(complex.developer)
    ? mapPublicDeveloper(complex.developer)
    : { id: "unknown", path: "/zastroyshchik/", slug: "unknown", title: "Застройщик уточняется" };

  return publicComplexSchema.parse({
    address: complex.address?.publicAddress ?? complex.address?.locality ?? undefined,
    developer,
    id: String(complex.id),
    image: getImage(complex),
    path: `/novostroyki/${complex.slug}/`,
    regionLabel: getRegionLabel(complex),
    slug: complex.slug,
    title: complex.title,
  });
}

function mapPublicNewbuildInventory(property: PublicNewbuildInventoryRecord): PublicNewbuildInventoryDTO {
  return publicNewbuildInventorySchema.parse({
    id: String(property.id),
    priceMinor: property.priceMinor ?? undefined,
    rooms: property.rooms ?? undefined,
    title: property.title,
    totalArea: property.totalArea ?? undefined,
  });
}

async function readPublishedComplexes(slug?: string): Promise<readonly PublicComplexDTO[]> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "residential-complexes",
      depth: 2,
      limit: slug ? 1 : 100,
      overrideAccess: false,
      pagination: false,
      select: publicComplexSelect,
      where: publishedComplexesWhere(slug),
    });

    return result.docs.map((doc) => mapPublicComplex(doc as PublicComplexRecord));
  } catch {
    return [];
  }
}

async function readPublishedDevelopers(slug?: string): Promise<readonly PublicDeveloperDTO[]> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "developers",
      depth: 1,
      limit: slug ? 1 : 100,
      overrideAccess: false,
      pagination: false,
      select: publicDeveloperSelect,
      where: publishedDevelopersWhere(slug),
    });

    return result.docs.map((doc) => mapPublicDeveloper(doc as PublicDeveloperRecord));
  } catch {
    return [];
  }
}

export const listPublishedComplexes = unstable_cache(
  () => readPublishedComplexes(),
  ["published-newbuild-complexes"],
  { tags: ["catalog", "complexes"] },
);

export async function getPublishedComplexBySlug(slug: string): Promise<PublicComplexDTO | null> {
  const cachedReader = unstable_cache(
    () => readPublishedComplexes(slug),
    ["published-newbuild-complex", slug],
    { tags: ["catalog", `complex:${slug}`] },
  );

  return (await cachedReader())[0] ?? null;
}

export const listPublishedComplexSlugs = unstable_cache(
  async () => (await readPublishedComplexes()).map((complex) => complex.slug),
  ["published-newbuild-complex-slugs"],
  { tags: ["catalog", "complexes"] },
);

export const listPublishedDevelopers = unstable_cache(
  () => readPublishedDevelopers(),
  ["published-newbuild-developers"],
  { tags: ["catalog", "developers"] },
);

export async function getPublishedDeveloperBySlug(slug: string): Promise<PublicDeveloperDTO | null> {
  const cachedReader = unstable_cache(
    () => readPublishedDevelopers(slug),
    ["published-newbuild-developer", slug],
    { tags: ["catalog", `developer:${slug}`] },
  );

  return (await cachedReader())[0] ?? null;
}

export const listPublishedDeveloperSlugs = unstable_cache(
  async () => (await readPublishedDevelopers()).map((developer) => developer.slug),
  ["published-newbuild-developer-slugs"],
  { tags: ["catalog", "developers"] },
);

export async function listActiveNewbuildInventoryByComplex(complexId: string): Promise<readonly PublicNewbuildInventoryDTO[]> {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "properties",
      depth: 0,
      limit: 100,
      overrideAccess: false,
      pagination: false,
      select: publicNewbuildInventorySelect,
      where: activeNewbuildInventoryWhere(complexId),
    });

    return result.docs.map((doc) => mapPublicNewbuildInventory(doc as PublicNewbuildInventoryRecord));
  } catch {
    return [];
  }
}
