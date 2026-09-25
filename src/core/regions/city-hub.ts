import type { PublicPropertyDTO } from "../dto/property.ts";
import type { PublicRegionDTO } from "../dto/region.ts";

export type CityHubGate = Readonly<{
  reasons: readonly string[];
  state: "missing" | "pass";
}>;

export type CityHubModel = Readonly<{
  gate: CityHubGate;
  newbuildProjects: readonly PublicPropertyDTO[];
  projects: readonly PublicPropertyDTO[];
  siblingCities: readonly PublicRegionDTO[];
}>;

const draftLanguage = /чернов|будет опубликован|до утверждения|перед публикацией|публикация требует/i;

function hasIndependentLocalAnalysis(city: PublicRegionDTO): boolean {
  return city.investmentThesis.length >= 80
    && city.riskSummary.length >= 60
    && !draftLanguage.test(`${city.lead} ${city.investmentThesis} ${city.riskSummary}`);
}

export function buildCityHubModel(
  city: PublicRegionDTO,
  regions: readonly PublicRegionDTO[],
  projects: readonly PublicPropertyDTO[],
): CityHubModel {
  const cityProjects = projects
    .filter((project) => project.status === "active")
    .filter((project) => project.geoContext.region.slug === city.parentSlug)
    .filter((project) => project.geoContext.cityOrArea?.slug === city.slug)
    .slice(0, 6);
  const reasons: string[] = [];

  if (city.status !== "published" || !city.verifiedAt) {
    reasons.push("Город не опубликован с подтверждённой датой проверки.");
  }
  if (!hasIndependentLocalAnalysis(city)) {
    reasons.push("Самостоятельная локальная аналитика ещё не прошла Content Gate.");
  }
  if (cityProjects.length < 1) {
    reasons.push("Нет полного опубликованного инвестиционного паспорта для города.");
  }

  return {
    gate: { reasons, state: reasons.length === 0 ? "pass" : "missing" },
    newbuildProjects: cityProjects.filter((project) => project.market === "newbuild"),
    projects: cityProjects,
    siblingCities: regions
      .filter((region) => region.pageKey === "CITY" && region.parentSlug === city.parentSlug && region.id !== city.id)
      .filter((region) => region.status === "published"),
  };
}
