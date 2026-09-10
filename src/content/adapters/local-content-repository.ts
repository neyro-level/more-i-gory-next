import articlesData from "../data/articles.json";
import mediaData from "../data/media.json";
import pagesData from "../data/pages.json";
import projectsData from "../data/projects.json";
import regionsData from "../data/regions.json";
import type { ContentRepository } from "../repository";
import {
  articleSchema,
  mediaAssetSchema,
  pageContentSchema,
  projectSchema,
  regionSchema,
} from "../domain/schemas";

const mediaAssets = mediaAssetSchema.array().parse(mediaData);
const regions = regionSchema.array().parse(regionsData);
const projects = projectSchema.array().parse(projectsData);
const articles = articleSchema.array().parse(articlesData);
const pages = pageContentSchema.array().parse(pagesData);

export const localContentRepository: ContentRepository = {
  async getArticleBySlug(slug) {
    return articles.find((article) => article.slug === slug) ?? null;
  },

  async getArticles() {
    return articles;
  },

  async getMediaAsset(id) {
    return mediaAssets.find((asset) => asset.id === id) ?? null;
  },

  async getMediaAssets() {
    return mediaAssets;
  },

  async getPageContent(pageId) {
    return pages.find((page) => page.id === pageId) ?? null;
  },

  async getProjectBySlug(slug) {
    return projects.find((project) => project.slug === slug) ?? null;
  },

  async getProjects() {
    return projects;
  },

  async getRegionBySlug(slug) {
    return regions.find((region) => region.slug === slug) ?? null;
  },

  async getRegions() {
    return regions;
  },

  async getSources() {
    return [];
  },
};
