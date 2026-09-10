import type { ContentRepository } from "../repository";

export class PayloadContentRepository implements ContentRepository {
  private notConnected(): never {
    throw new Error("PayloadContentRepository is reserved for the future Payload adapter.");
  }

  async getArticleBySlug() {
    return this.notConnected();
  }

  async getArticles() {
    return this.notConnected();
  }

  async getMediaAsset() {
    return this.notConnected();
  }

  async getMediaAssets() {
    return this.notConnected();
  }

  async getLandingPage() {
    return this.notConnected();
  }

  async getPageContent() {
    return this.notConnected();
  }

  async getProjectBySlug() {
    return this.notConnected();
  }

  async getProjects() {
    return this.notConnected();
  }

  async getRegionBySlug() {
    return this.notConnected();
  }

  async getRegions() {
    return this.notConnected();
  }

  async getSources() {
    return this.notConnected();
  }
}
