import { regionSeedContent } from "../../content/regions/region-seed-content.ts";
import { getRegionRoutePlan } from "../../content/regions/region-route-plan.ts";
import type { SiteNavigationLink } from "../dto/site-chrome.ts";
import { isRegionDiscoverable, resolveRegionActivation, type RegionActivationState } from "../regions/activation.ts";

const regionStateByPath = new Map(
  getRegionRoutePlan().map((entry) => [entry.path, resolveRegionActivation(regionSeedContent[entry.key].status)]),
);

export function getPlannedRegionNavigationState(path: string): RegionActivationState | undefined {
  return regionStateByPath.get(path);
}

export function isAllowedPublicNavigationHref(href: string): boolean {
  const state = getPlannedRegionNavigationState(href);
  return state === undefined || state === "ACTIVE";
}

export function filterPublicNavigationLinks(items: readonly SiteNavigationLink[]): readonly SiteNavigationLink[] {
  return items.filter((item) => isAllowedPublicNavigationHref(item.href));
}

export function isDiscoverableGeoStatus(status: "hidden" | "published" | "stub" | undefined): boolean {
  return status === "published" && isRegionDiscoverable(status);
}
