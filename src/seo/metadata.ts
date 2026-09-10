import type { Metadata } from "next";
import { getSeoEntry, type SeoEntry } from "./registry";

export const siteUrl = "https://moreigori.ru";

function buildRobots(entry: SeoEntry): Metadata["robots"] {
  if (entry.index === "yes") {
    return { follow: true, index: true };
  }

  return {
    follow: true,
    index: false,
  };
}

export function buildMetadata(entry: SeoEntry): Metadata {
  const canonical = entry.canonical;
  const absoluteUrl = new URL(canonical, siteUrl).toString();

  return {
    alternates: {
      canonical,
    },
    description: entry.description,
    metadataBase: new URL(siteUrl),
    openGraph: {
      description: entry.description,
      locale: "ru_RU",
      siteName: "Море и Горы",
      title: entry.title,
      type: "website",
      url: absoluteUrl,
    },
    robots: buildRobots(entry),
    title: entry.title,
  };
}

export function getStaticMetadata(pageId: string): Metadata {
  return buildMetadata(getSeoEntry(pageId));
}
