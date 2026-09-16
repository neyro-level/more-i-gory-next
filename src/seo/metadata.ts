import type { Metadata } from "next";
import { getSeoEntry, type SeoEntry } from "./registry";
import { buildPageMetadata, sourceFromSeoEntry } from "./page-metadata.ts";
import { siteUrl } from "./site-url.ts";

export { siteUrl };
export { buildPageMetadata };

export function buildMetadata(entry: SeoEntry): Metadata {
  return buildPageMetadata(sourceFromSeoEntry(entry));
}

export function getStaticMetadata(pageId: string): Metadata {
  return buildMetadata(getSeoEntry(pageId));
}
