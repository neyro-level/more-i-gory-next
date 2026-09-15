import "server-only";

export { createPublicGateway } from "./gateway.ts";
export type {
  PublicGateway,
  PublicGatewayConfig,
  PublicReadPort,
  PublicReadResult,
} from "./gateway.ts";
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
