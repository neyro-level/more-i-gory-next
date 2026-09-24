import type { ArticleDTO, PublicPropertyDTO } from "../dto/index.ts";

const maximumRelatedItems = 3;

function boundedLimit(limit: number): number {
  if (!Number.isFinite(limit)) return maximumRelatedItems;
  return Math.max(0, Math.min(maximumRelatedItems, Math.trunc(limit)));
}

function projectRelationScore(property: PublicPropertyDTO, candidate: PublicPropertyDTO): number {
  let score = 0;
  if (candidate.geoContext.region.id === property.geoContext.region.id) score += 4;
  if (candidate.geoContext.cityOrArea?.id && candidate.geoContext.cityOrArea.id === property.geoContext.cityOrArea?.id) score += 8;
  if (candidate.category && candidate.category === property.category) score += 2;
  if (candidate.market && candidate.market === property.market) score += 1;
  return score;
}

export function selectRelatedProjects(
  property: PublicPropertyDTO,
  candidates: readonly PublicPropertyDTO[],
  limit = maximumRelatedItems,
): readonly PublicPropertyDTO[] {
  return candidates
    .filter((candidate) => candidate.id !== property.id && candidate.status === "active")
    .map((candidate) => ({ candidate, score: projectRelationScore(property, candidate) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) =>
      right.score - left.score ||
      right.candidate.verifiedAt.localeCompare(left.candidate.verifiedAt) ||
      left.candidate.title.localeCompare(right.candidate.title, "ru-RU"),
    )
    .slice(0, boundedLimit(limit))
    .map(({ candidate }) => candidate);
}

export function selectRelatedArticles(
  property: PublicPropertyDTO,
  candidates: readonly ArticleDTO[],
  limit = maximumRelatedItems,
): readonly ArticleDTO[] {
  const projectKeys = new Set([property.id, `project-${property.slug}`]);
  const regionKeys = new Set([property.geoContext.region.id, `region-${property.geoContext.region.slug}`]);

  return candidates
    .filter((article) => article.status === "published")
    .map((article) => ({
      article,
      direct: article.relatedProjectIds.some((id) => projectKeys.has(id)),
      regional: article.relatedRegionIds.some((id) => regionKeys.has(id)),
    }))
    .filter(({ direct, regional }) => direct || regional)
    .sort((left, right) =>
      Number(right.direct) - Number(left.direct) ||
      (right.article.reviewedAt ?? "").localeCompare(left.article.reviewedAt ?? "") ||
      left.article.title.localeCompare(right.article.title, "ru-RU"),
    )
    .slice(0, boundedLimit(limit))
    .map(({ article }) => article);
}
