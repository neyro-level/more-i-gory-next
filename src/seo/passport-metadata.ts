import { buildPageMetadata, type PageMetadataSource } from "./page-metadata.ts";
import { resolveRuntimeContour } from "../project/runtime-contour.ts";
import { resolveSeoState } from "./seo-state.ts";
import { siteUrl } from "./site-url.ts";

export type PassportMetadataFacts = Readonly<{
  description?: string;
  facts: readonly Readonly<{ label: string; value: string }>[];
  image?: Readonly<{ src: string }> | null;
  path: string;
  status: "active" | "archived";
  title: string;
  verdict: string;
  verifiedAt?: string;
}>;

function passportDescription(property: PassportMetadataFacts): string {
  if (property.status === "archived") {
    return `${property.title}: объект больше не актуален.`;
  }
  return property.description ?? property.verdict;
}

export function passportMetadataSource(property: PassportMetadataFacts): PageMetadataSource {
  const state = resolveSeoState({
    canonical: property.path,
    lifecycle: property.status,
    publicationStatus: property.status,
    runtimeContour: resolveRuntimeContour(),
  });
  return {
    canonical: state.canonical,
    description: passportDescription(property),
    ogImagePath: property.image?.src ?? null,
    robots: state.index ? "index-follow" : "noindex-follow",
    title: property.title,
  };
}

export function buildPassportPageMetadata(property: PassportMetadataFacts) {
  return buildPageMetadata(passportMetadataSource(property));
}

export function passportStructuredData(property: PassportMetadataFacts): Readonly<Record<string, unknown>> {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    description: passportDescription(property),
    name: property.title,
    url: new URL(property.path, siteUrl).toString(),
  };

  if (property.image?.src) {
    data.image = new URL(property.image.src, siteUrl).toString();
  }

  if (property.verifiedAt) {
    data.dateModified = property.verifiedAt;
  }

  if (property.facts.length > 0) {
    data.additionalProperty = property.facts.map((fact) => ({
      "@type": "PropertyValue",
      name: fact.label,
      value: fact.value,
    }));
  }

  return data;
}
