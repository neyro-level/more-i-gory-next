import type {
  ArticleDTO,
  LandingPageDTO,
  MediaAssetDTO,
  PageContent,
  ProjectDTO,
  RegionDTO,
  SourceDTO,
} from "@more-i-gory/contracts";

export interface ContentRepository {
  getArticles(): Promise<ArticleDTO[]>;
  getArticleBySlug(slug: string): Promise<ArticleDTO | null>;
  getMediaAsset(id: string): Promise<MediaAssetDTO | null>;
  getMediaAssets(): Promise<MediaAssetDTO[]>;
  getLandingPage(pageId: string): Promise<LandingPageDTO | null>;
  getPageContent(pageId: string): Promise<PageContent | null>;
  getProjects(): Promise<ProjectDTO[]>;
  getProjectBySlug(slug: string): Promise<ProjectDTO | null>;
  getRegions(): Promise<RegionDTO[]>;
  getRegionBySlug(slug: string): Promise<RegionDTO | null>;
  getSources(): Promise<SourceDTO[]>;
}
