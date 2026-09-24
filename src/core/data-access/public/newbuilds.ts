import "server-only";

import { unstable_cache } from "next/cache.js";
import { getPayload } from "payload";
import type { SelectType, Where } from "payload";
import { z } from "zod";

import config from "../../../../payload.config.ts";
import { publicMediaSchema } from "./media-contract.ts";
import { publicMediaOrFallback } from "./missing-image.ts";
import { publicReadWithFallback } from "./read-fallback.ts";
import type { Developer, Media, Property, Region, ResidentialComplex } from "../../../payload-types.ts";

const publicEntitySeoSchema = z.object({
  canonicalOverride: z.string().optional(),
  description: z.string().min(1),
  ogImagePath: z.string().optional(),
  priority: z.enum(["P1", "P2", "P3"]),
  robots: z.enum(["index-follow", "noindex-follow"]),
  title: z.string().min(1),
});

const publicDeveloperSchema = z.object({
  description: z.string().optional(),
  id: z.string().min(1),
  path: z.string().startsWith("/").endsWith("/"),
  seo: publicEntitySeoSchema,
  slug: z.string().min(1),
  title: z.string().min(1),
});

const publicComplexSchema = z.object({
  address: z.string().optional(),
  developer: publicDeveloperSchema,
  id: z.string().min(1),
  image: publicMediaSchema,
  path: z.string().startsWith("/").endsWith("/"),
  regionLabel: z.string().min(1),
  seo: publicEntitySeoSchema,
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

type PublicDeveloperRecord = Readonly<Pick<Developer, "description" | "id" | "seo" | "slug" | "status" | "title">>;

type PublicComplexRecord = Readonly<
  Pick<ResidentialComplex, "address" | "developer" | "id" | "media" | "region" | "seo" | "slug" | "status" | "title">
>;

type PublicNewbuildInventoryRecord = Readonly<
  Pick<Property, "id" | "market" | "origin" | "priceMinor" | "rooms" | "status" | "title" | "totalArea">
>;

export const publicDeveloperSelect = {
  description: true,
  id: true,
  seo: true,
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
  seo: true,
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
  return publicMediaOrFallback({
    alt: firstImage?.alt,
    height: firstImage?.height,
    src: firstImage?.url,
    titleFallback: complex.title,
    width: firstImage?.width,
  });
}

function getRegionLabel(complex: PublicComplexRecord): string {
  return isRelationDocument<Region>(complex.region) ? complex.region.title : "Крым";
}

function mapPublicDeveloper(developer: PublicDeveloperRecord): PublicDeveloperDTO {
  return publicDeveloperSchema.parse({
    description: developer.description ?? undefined,
    id: String(developer.id),
    path: `/zastroyshchik/${developer.slug}/`,
    seo: developer.seo,
    slug: developer.slug,
    title: developer.title,
  });
}

function mapPublicComplex(complex: PublicComplexRecord): PublicComplexDTO {
  const developer = isRelationDocument<Developer>(complex.developer)
    ? mapPublicDeveloper(complex.developer)
    : {
        id: "unknown",
        path: "/zastroyshchik/",
        seo: {
          description: "Данные застройщика уточняются.",
          priority: "P3" as const,
          robots: "noindex-follow" as const,
          title: "Застройщик уточняется",
        },
        slug: "unknown",
        title: "Застройщик уточняется",
      };

  return publicComplexSchema.parse({
    address: complex.address?.publicAddress ?? complex.address?.locality ?? undefined,
    developer,
    id: String(complex.id),
    image: getImage(complex),
    path: `/novostroyki/${complex.slug}/`,
    regionLabel: getRegionLabel(complex),
    seo: complex.seo,
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
  return publicReadWithFallback({
    fallback: [],
    reader: "published-complexes",
    read: async () => {
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
    },
  });
}

async function readPublishedDevelopers(slug?: string): Promise<readonly PublicDeveloperDTO[]> {
  return publicReadWithFallback({
    fallback: [],
    reader: "published-developers",
    read: async () => {
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
    },
  });
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
  return publicReadWithFallback({
    fallback: [],
    reader: "active-newbuild-inventory",
    read: async () => {
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
    },
  });
}
