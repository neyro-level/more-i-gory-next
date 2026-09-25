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

export type EditorialPreviewMode = "payload" | "seed";

export function resolveEditorialPreviewMode(source: NodeJS.ProcessEnv = process.env): EditorialPreviewMode {
  const contour = resolveRuntimeContour(source);
  const explicit = source.AMS_EDITORIAL_PREVIEW?.trim();
  const mode = explicit === "payload" || explicit === "seed"
    ? explicit
    : contour === "staging" || source.DATABASE_URI
      ? "payload"
      : "seed";
  if (mode === "seed" && (contour === "production" || source.NODE_ENV === "production" || source.DATABASE_URI)) {
    throw new Error("Seed editorial preview is allowed only outside production and without a database.");
  }
  return mode;
}

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

export async function listEditorialPreviewRegions(source: NodeJS.ProcessEnv = process.env): Promise<readonly PublicRegionDTO[]> {
  if (!isEditorialPreviewEnabled(source)) return [];
  if (resolveEditorialPreviewMode(source) === "seed") return previewRegions;
  const { listEditorialPreviewRegionsFromPayload } = await import("../public/regions.ts");
  return listEditorialPreviewRegionsFromPayload();
}

export async function getEditorialPreviewRegionByPath(
  path: string,
  source: NodeJS.ProcessEnv = process.env,
): Promise<PublicRegionDTO | null> {
  return (await listEditorialPreviewRegions(source)).find((region) => region.path === path) ?? null;
}

export function isEditorialPreviewRegion(region: PublicRegionDTO | null): region is PublicRegionDTO {
  return region?.id.startsWith("editorial-preview:") === true;
}

export async function getEditorialPreviewRegionStaticParams(source: NodeJS.ProcessEnv = process.env) {
  return (await listEditorialPreviewRegions(source))
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

export async function getEditorialPreviewNavigation(
  source: NodeJS.ProcessEnv = process.env,
): Promise<readonly EditorialPreviewNavigationGroup[]> {
  if (!isEditorialPreviewEnabled(source)) return [];

  const mode = resolveEditorialPreviewMode(source);
  let regions = previewRegions;
  let properties = [] as Awaited<ReturnType<typeof import("../public/properties.ts").listEditorialPreviewManualProperties>>;
  let complexes = [] as Awaited<ReturnType<typeof import("../public/newbuilds.ts").listEditorialPreviewComplexes>>;
  let developers = [] as Awaited<ReturnType<typeof import("../public/newbuilds.ts").listEditorialPreviewDevelopers>>;
  if (mode === "payload") {
    const [regionGateway, propertyGateway, newbuildGateway] = await Promise.all([
      import("../public/regions.ts"),
      import("../public/properties.ts"),
      import("../public/newbuilds.ts"),
    ]);
    [regions, properties, complexes, developers] = await Promise.all([
      regionGateway.listEditorialPreviewRegionsFromPayload(),
      propertyGateway.listEditorialPreviewManualProperties(),
      newbuildGateway.listEditorialPreviewComplexes(),
      newbuildGateway.listEditorialPreviewDevelopers(),
    ]);
  }

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
      links: regions.map((region) => previewLink(region.title, region.path)),
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
        ...properties.map((property) => previewLink(property.title, property.path)),
        ...complexes.map((complex) => previewLink(complex.title, complex.path)),
        ...developers.map((developer) => previewLink(developer.title, developer.path)),
      ],
    },
  ];
}
