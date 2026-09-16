import type { Metadata } from "next";

import type { SeoEntry } from "./registry";
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

export function sourceFromSeoEntry(entry: SeoEntry): PageMetadataSource {
  return {
    canonical: entry.canonical,
    description: entry.description,
    robots: entry.index === "yes" ? "index-follow" : "noindex-follow",
    title: entry.title,
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
