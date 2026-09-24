import type { PublicPropertyDTO } from "../dto/property.ts";
import type { PublicRegionDTO } from "../dto/region.ts";

export const CRIMEA_HUB_CITY_SLUGS = ["yalta", "sevastopol", "evpatoriya", "alushta"] as const;

export type CrimeaHubGate = Readonly<{
  cityCount: number;
  projectCount: number;
  reasons: readonly string[];
  state: "missing" | "pass";
}>;

export type CrimeaHubModel = Readonly<{
  cities: readonly PublicRegionDTO[];
  gate: CrimeaHubGate;
  projects: readonly PublicPropertyDTO[];
}>;

function isVerifiedCrimeaCity(region: PublicRegionDTO): boolean {
  return region.pageKey === "CITY"
    && region.parentSlug === "krym"
    && region.status === "published"
    && typeof region.verifiedAt === "string";
}

function isPublishedCrimeaProject(project: PublicPropertyDTO): boolean {
  return project.status === "active" && project.geoContext.region.slug === "krym";
}

export function buildCrimeaHubModel(
  regions: readonly PublicRegionDTO[],
  projects: readonly PublicPropertyDTO[],
): CrimeaHubModel {
  const cityOrder = new Map(CRIMEA_HUB_CITY_SLUGS.map((slug, index) => [slug, index]));
  const cities = regions
    .filter((region) => region.parentSlug === "krym" && cityOrder.has(region.slug as typeof CRIMEA_HUB_CITY_SLUGS[number]))
    .sort((left, right) => (cityOrder.get(left.slug as typeof CRIMEA_HUB_CITY_SLUGS[number]) ?? 99)
      - (cityOrder.get(right.slug as typeof CRIMEA_HUB_CITY_SLUGS[number]) ?? 99));
  const verifiedCities = cities.filter(isVerifiedCrimeaCity);
  const publishedProjects = projects.filter(isPublishedCrimeaProject).slice(0, 6);
  const reasons: string[] = [];

  if (verifiedCities.length < 3) {
    reasons.push(`Проверено городов: ${verifiedCities.length} из необходимых 3.`);
  }
  if (publishedProjects.length < 4) {
    reasons.push(`Опубликовано инвестиционных паспортов: ${publishedProjects.length} из необходимых 4.`);
  }

  return {
    cities,
    gate: {
      cityCount: verifiedCities.length,
      projectCount: publishedProjects.length,
      reasons,
      state: reasons.length === 0 ? "pass" : "missing",
    },
    projects: publishedProjects,
  };
}
