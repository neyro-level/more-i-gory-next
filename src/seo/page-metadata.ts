import type { Metadata } from "next";

import type { SeoEntry } from "./registry";
import {
  resolveSeoState,
  type CmsSeoPolicy,
  type SeoPublicationStatus,
  type SeoRuntimeContour,
} from "./seo-state.ts";
import { siteUrl } from "./site-url.ts";

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

export function sourceFromSeoEntry(entry: SeoEntry, runtimeContour?: SeoRuntimeContour): PageMetadataSource {
  const state = resolveSeoState({ canonical: entry.canonical, registry: entry, runtimeContour });
  return {
    canonical: state.canonical,
    description: entry.description,
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
  const canonical = normalizeCanonical(source.canonical);
  const absoluteUrl = new URL(canonical, siteUrl).toString();
  const images = source.ogImagePath ? [new URL(source.ogImagePath, siteUrl).toString()] : undefined;

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
      title: source.title,
      type: "website",
      url: absoluteUrl,
    },
    robots: buildRobots(source),
    title: source.title,
  };
}
