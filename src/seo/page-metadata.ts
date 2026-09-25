import type { Metadata } from "next";

import type { SeoEntry } from "./registry";
import {
  resolveSeoState,
  type CmsSeoPolicy,
  type SeoPublicationStatus,
  type SeoRuntimeContour,
} from "./seo-state.ts";
import { getSiteUrl } from "./site-url.ts";

export const DEFAULT_OG_IMAGE = {
  alt: "Панорамный вид курортного побережья для сайта Море и Горы",
  height: 1524,
  url: "/images/og/default.webp",
  width: 2560,
} as const;

export type PageMetadataSource = Readonly<{
  canonical: string;
  description: string;
  ogImagePath?: string | null;
  robots: "index-follow" | "noindex-follow";
  title: string;
}>;

function buildRobots(source: PageMetadataSource): Metadata["robots"] {
  return source.robots === "index-follow"
    ? { follow: true, index: true }
    : { follow: true, index: false };
}

function normalizeCanonical(canonical: string): string {
  return canonical.startsWith("/") ? canonical : `/${canonical}`;
}

export function sourceFromSeoEntry(
  entry: SeoEntry,
  runtimeContour?: SeoRuntimeContour,
  options: Readonly<{ technical?: boolean }> = {},
): PageMetadataSource {
  const state = resolveSeoState({
    canonical: entry.canonical,
    registry: entry,
    runtimeContour,
    technical: options.technical,
  });
  return {
    canonical: state.canonical,
    description: entry.description,
    ogImagePath: entry.ogImage,
    robots: state.index ? "index-follow" : "noindex-follow",
    title: entry.title,
  };
}

export function sourceFromCmsSeo(input: Readonly<{
  canonical: string;
  description: string;
  ogImagePath?: string | null;
  publicationStatus: SeoPublicationStatus;
  routeSupported?: boolean;
  runtimeContour?: SeoRuntimeContour;
  seo: CmsSeoPolicy & Readonly<{ title: string }>;
}>): PageMetadataSource {
  const state = resolveSeoState({
    canonical: input.canonical,
    cmsSeo: input.seo,
    publicationStatus: input.publicationStatus,
    routeSupported: input.routeSupported,
    runtimeContour: input.runtimeContour,
  });
  return {
    canonical: state.canonical,
    description: input.description,
    ogImagePath: input.ogImagePath,
    robots: state.index ? "index-follow" : "noindex-follow",
    title: input.seo.title,
  };
}

export function sourceFromArticle(input: Readonly<{
  canonical: string;
  contentGate: "pass" | "fail" | "missing";
  description: string;
  registry: SeoEntry;
  status: "draft" | "review" | "published" | "archived";
  title: string;
  runtimeContour?: SeoRuntimeContour;
}>): PageMetadataSource {
  const state = resolveSeoState({
    canonical: input.canonical,
    contentGate: input.contentGate,
    lifecycle: input.status === "archived" ? "archived" : "active",
    publicationStatus: input.status,
    registry: input.registry,
    runtimeContour: input.runtimeContour,
  });
  return {
    canonical: state.canonical,
    description: input.description,
    robots: state.index ? "index-follow" : "noindex-follow",
    title: input.title,
  };
}

export function buildPageMetadata(source: PageMetadataSource): Metadata {
  const siteUrl = getSiteUrl();
  const canonical = normalizeCanonical(source.canonical);
  const absoluteUrl = new URL(canonical, siteUrl).toString();
  const title = source.title.replace(/\s*\|\s*Море и Горы$/u, "");
  const imageUrl = new URL(source.ogImagePath ?? DEFAULT_OG_IMAGE.url, siteUrl).toString();
  const images = [{
    alt: DEFAULT_OG_IMAGE.alt,
    height: DEFAULT_OG_IMAGE.height,
    url: imageUrl,
    width: DEFAULT_OG_IMAGE.width,
  }];

  return {
    alternates: {
      canonical,
    },
    description: source.description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      description: source.description,
      images,
      locale: "ru_RU",
      siteName: "Море и Горы",
      title,
      type: "website",
      url: absoluteUrl,
    },
    robots: buildRobots(source),
    title,
    twitter: {
      card: "summary_large_image",
      description: source.description,
      images: [imageUrl],
      title,
    },
  };
}
