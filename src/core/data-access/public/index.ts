import "server-only";

export { createPublicGateway } from "./gateway.ts";
export {
  getCmsPageByPath,
} from "./pages.ts";
export {
  composePublicRegionPath,
  getPublicRegionByPath,
  getPublicRegionRelatedLinks,
  listPublicHubRegions,
  listPublicRegions,
  mapPublicRegion,
  mapPublicRegions,
} from "./regions.ts";
export type { PublicRegionDTO } from "./regions.ts";
export {
  activeNewbuildInventoryWhere,
  getPublishedComplexBySlug,
  getPublishedDeveloperBySlug,
  listActiveNewbuildInventoryByComplex,
  listPublishedComplexes,
  listPublishedComplexSlugs,
  listPublishedDevelopers,
  listPublishedDeveloperSlugs,
  publishedComplexesWhere,
  publishedDevelopersWhere,
} from "./newbuilds.ts";
export {
  archiveRetentionDays,
  getArchivedPropertyAction,
  getManualPropertyRouteBySlug,
  getPublishedManualPropertyBySlug,
  listManualPropertyRouteSlugs,
  listPublishedManualProperties,
  mapPublicProperty,
  propertyPublicationWhere,
  propertyRouteWhere,
  publicPropertySelect,
} from "./properties.ts";
export { fallbackSiteChrome, getSiteChrome, mapSiteChrome } from "./site-chrome.ts";
export type {
  PublicGateway,
  PublicGatewayConfig,
  PublicReadPort,
  PublicReadResult,
} from "./gateway.ts";
export type { ArchivedPropertyAction, PublicPropertyDTO } from "./properties.ts";
export type { PublicComplexDTO, PublicDeveloperDTO, PublicNewbuildInventoryDTO } from "./newbuilds.ts";
export type { SiteChrome, SiteNavigationLink } from "./site-chrome.ts";
export type { PublicQueryContract } from "@/core/query";
export type {
  ArticleDTO,
  LandingPageDTO,
  MediaAssetDTO,
  PageContent,
  PersonDTO,
  ProjectDTO,
  RegionDTO,
  SeoEntry,
  SourceDTO,
} from "@/core/dto";
