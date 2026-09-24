import type { Metadata } from "next";
import type { CmsPageDTO } from "@/core/dto";
import { resolveRuntimeContour } from "@/project/runtime-contour";
import { getSeoEntry, type SeoEntry } from "./registry";
import { buildPageMetadata, sourceFromCmsSeo, sourceFromSeoEntry } from "./page-metadata.ts";
import { isSupportedCmsPageCanonical } from "./sitemap-source-contract.ts";
import { siteUrl } from "./site-url.ts";

export { siteUrl };
export { buildPageMetadata };

export function buildMetadata(entry: SeoEntry): Metadata {
  return buildPageMetadata(sourceFromSeoEntry(entry, resolveRuntimeContour()));
}

export function getStaticMetadata(pageId: string): Metadata {
  return buildMetadata(getSeoEntry(pageId));
}

export function buildCmsPageMetadata(page: CmsPageDTO): Metadata {
  if (!page.seo.title || !page.seo.description) return {};
  return buildPageMetadata(sourceFromCmsSeo({
    canonical: page.path,
    description: page.seo.description,
    ogImagePath: page.seo.ogImagePath,
    publicationStatus: page.status,
    routeSupported: isSupportedCmsPageCanonical(page.path, page.seo.canonicalOverride),
    runtimeContour: resolveRuntimeContour(),
    seo: { ...page.seo, title: page.seo.title },
  }));
}
