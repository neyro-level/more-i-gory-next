import type { ContentRepository } from "./repository";
import { localContentRepository } from "./adapters/local-content-repository";

const publishableStatus = "published";

export function createContentService(repository: ContentRepository = localContentRepository) {
  return {
    getArticle: (slug: string) => repository.getArticleBySlug(slug),
    getMediaAsset: (id: string) => repository.getMediaAsset(id),
    getLandingPage: (pageId: string) => repository.getLandingPage(pageId),
    getPage: (pageId: string) => repository.getPageContent(pageId),
    getProject: (slug: string) => repository.getProjectBySlug(slug),
    getRegion: (slug: string) => repository.getRegionBySlug(slug),
    listArticles: () => repository.getArticles(),

    async listPublishedArticles() {
      const articles = await repository.getArticles();
      return articles.filter((article) => article.status === publishableStatus);
    },

    async listPublishedProjects() {
      const projects = await repository.getProjects();
      return projects.filter((project) => project.status === publishableStatus);
    },

    async listPublishedRegions() {
      const regions = await repository.getRegions();
      return regions.filter((region) => region.status === publishableStatus);
    },

    listRegions: () => repository.getRegions(),
  };
}

export const contentService = createContentService();
