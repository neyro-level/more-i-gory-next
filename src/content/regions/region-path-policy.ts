import { routeGrammar } from "../../core/routing/grammar/index.ts";

export const LEGACY_REGION_RESERVED_NAMESPACE = "/investicionnaya-nedvizhimost";

export function composeRegionPathFromSlugs(slugs: readonly string[]): string {
  if (slugs.length === 1) {
    return routeGrammar.buildUrl({ pageKey: "REGION", regionSlug: slugs[0] ?? "" });
  }

  if (slugs.length === 2) {
    return routeGrammar.buildUrl({ pageKey: "CITY", regionSlug: slugs[0] ?? "", citySlug: slugs[1] ?? "" });
  }

  throw new Error("Geo path requires one region slug or one region plus city/area slug.");
}

export function composeLegacyRegionPathFromSlugs(slugs: readonly string[]): string {
  if (slugs.length === 0) throw new Error("Legacy region path requires at least one slug.");
  return `${LEGACY_REGION_RESERVED_NAMESPACE}/${slugs.join("/")}/`;
}
