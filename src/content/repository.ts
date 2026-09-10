import type {
  ArticleDTO,
  MediaAssetDTO,
  PageContent,
  ProjectDTO,
  RegionDTO,
  SourceDTO,
} from "./domain/types";

export interface ContentRepository {
  getArticles(): Promise<ArticleDTO[]>;
  getArticleBySlug(slug: string): Promise<ArticleDTO | null>;
  getMediaAsset(id: string): Promise<MediaAssetDTO | null>;
  getMediaAssets(): Promise<MediaAssetDTO[]>;
  getPageContent(pageId: string): Promise<PageContent | null>;
  getProjects(): Promise<ProjectDTO[]>;
  getProjectBySlug(slug: string): Promise<ProjectDTO | null>;
  getRegions(): Promise<RegionDTO[]>;
  getRegionBySlug(slug: string): Promise<RegionDTO | null>;
  getSources(): Promise<SourceDTO[]>;
}
