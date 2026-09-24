import "server-only";

import { articles } from "../../../content/articles/articles.ts";
import { getMediaAsset } from "../../../content/media/media-assets.ts";
import { regionSeedContent } from "../../../content/regions/region-seed-content.ts";
import {
  getRegionRelatedLinks,
  getRegionRoutePlan,
  type RegionInternalLink,
} from "../../../content/regions/region-route-plan.ts";
import { resolveRuntimeContour } from "../../../project/runtime-contour.ts";
import { publicRegionSchema, type PublicRegionDTO } from "../../dto/region.ts";
import { isRegionPreviewRoute } from "../../regions/activation.ts";
import type { EditorialPreviewNavigationGroup, SiteNavigationLink } from "../../dto/site-chrome.ts";
import { CANONICAL_MISSING_IMAGE, publicMediaOrFallback } from "../public/missing-image.ts";

function previewLink(label: string, href: string): SiteNavigationLink {
  return { href, label, nofollow: true, openInNewTab: false };
}

export function isEditorialPreviewEnabled(source: NodeJS.ProcessEnv = process.env): boolean {
  if (resolveRuntimeContour(source) === "staging") return true;
  return source.NODE_ENV !== "production";
}

function buildPreviewRegions(): readonly PublicRegionDTO[] {
  const plan = getRegionRoutePlan();
  const byKey = new Map(plan.map((entry) => [entry.key, entry]));

  return plan.map((entry) => {
    const content = regionSeedContent[entry.key];
    const parent = entry.parentKey ? byKey.get(entry.parentKey) : undefined;

    return publicRegionSchema.parse({
      id: `editorial-preview:${entry.key}`,
      image: publicMediaOrFallback(getMediaAsset(content.mediaSourceLabel) ?? CANONICAL_MISSING_IMAGE),
      investmentThesis: content.investmentThesis,
      kind: content.kind,
      lead: content.lead,
      pageKey: entry.pageKey ?? undefined,
      pageId: entry.pageId,
      parentSlug: parent?.slug,
      path: entry.path,
      riskSummary: content.riskSummary,
      slug: entry.slug,
      status: content.status,
      title: content.title,
    });
  });
}

const previewRegions = buildPreviewRegions();

export function listEditorialPreviewRegions(source: NodeJS.ProcessEnv = process.env): readonly PublicRegionDTO[] {
  return isEditorialPreviewEnabled(source) ? previewRegions : [];
}

export function getEditorialPreviewRegionByPath(
  path: string,
  source: NodeJS.ProcessEnv = process.env,
): PublicRegionDTO | null {
  return listEditorialPreviewRegions(source).find((region) => region.path === path) ?? null;
}

export function isEditorialPreviewRegion(region: PublicRegionDTO | null): region is PublicRegionDTO {
  return region?.id.startsWith("editorial-preview:") === true;
}

export function getEditorialPreviewRegionStaticParams(source: NodeJS.ProcessEnv = process.env) {
  return listEditorialPreviewRegions(source)
    .filter((region) => isRegionPreviewRoute(region.status))
    .map((region) => ({
      path: region.path.replace(/^\//, "").replace(/\/$/, "").split("/"),
    }));
}

export function getEditorialPreviewRegionRelatedLinks(region: PublicRegionDTO): RegionInternalLink[] {
  const plan = getRegionRoutePlan();
  const entry = plan.find((candidate) => candidate.path === region.path);
  if (!entry) return [];

  const titles = Object.fromEntries(
    plan.map((candidate) => [candidate.key, regionSeedContent[candidate.key].title]),
  );
  const includedKeys = new Set(
    plan
      .filter((candidate) => isRegionPreviewRoute(regionSeedContent[candidate.key].status))
      .map((candidate) => candidate.key),
  );
  return getRegionRelatedLinks(entry, titles, includedKeys);
}

export function getEditorialPreviewNavigation(
  source: NodeJS.ProcessEnv = process.env,
): readonly EditorialPreviewNavigationGroup[] {
  if (!isEditorialPreviewEnabled(source)) return [];

  return [
    {
      label: "Основные страницы",
      links: [
        previewLink("Главная", "/"),
        previewLink("Инвестиционная недвижимость", "/investicionnaya-nedvizhimost/"),
        previewLink("Объекты", "/obekty/"),
        previewLink("Новостройки", "/novostroyki/"),
        previewLink("Аналитика", "/analitika/"),
        previewLink("Методика", "/metodika/"),
        previewLink("Подбор", "/podbor/"),
        previewLink("О компании", "/o-kompanii/"),
        previewLink("Контакты", "/kontakty/"),
        previewLink("Политика конфиденциальности", "/privacy/"),
        previewLink("Согласие на обработку данных", "/consent/"),
      ],
    },
    {
      label: "Регионы и сегменты",
      links: previewRegions.map((region) => previewLink(region.title, region.path)),
    },
    {
      label: "Черновики аналитики",
      links: articles.map((article) => previewLink(article.title.replace(" | Море и Горы", ""), article.path)),
    },
    {
      label: "Технические шаблоны",
      links: [
        previewLink("Шаблон паспорта проекта", "/obekty/preview-project/"),
        previewLink("Шаблон карточки ЖК", "/novostroyki/preview-complex/"),
        previewLink("Шаблон застройщика", "/zastroyshchik/preview-developer/"),
      ],
    },
  ];
}
