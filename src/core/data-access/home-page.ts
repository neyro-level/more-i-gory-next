import { articles } from "@/content/articles/articles";
import type { HomePageDTO } from "@/core/dto";
import { isEditorialPreviewEnabled, listEditorialPreviewRegions } from "@/core/data-access/preview/editorial-preview";
import { listPublicHubRegions } from "@/core/data-access/public";

export async function getHomePageModel(): Promise<HomePageDTO> {
  const editorialPreview = isEditorialPreviewEnabled();
  const sourceRegions = (editorialPreview ? await listEditorialPreviewRegions() : await listPublicHubRegions())
    .filter((region) => region.kind === "region");
  const regions = sourceRegions.map((region) => ({
    href: region.path,
    id: region.slug,
    image: region.image,
    risk: region.riskSummary,
    thesis: region.investmentThesis,
    title: region.title,
  }));
  const visibleArticles = editorialPreview ? articles : articles.filter((article) => article.status === "published");

  return {
    articles: visibleArticles.map((article) => ({ description: article.description, href: article.path, id: article.id, title: article.title })),
    regions,
  };
}
