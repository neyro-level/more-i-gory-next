export const regionActivationStates = ["ACTIVE", "STUB_NO_INDEX", "PREPARED_OFF"] as const;

export type RegionActivationState = (typeof regionActivationStates)[number];
export type RegionContentStatus = "hidden" | "published" | "stub";

export function resolveRegionActivation(status: RegionContentStatus): RegionActivationState {
  if (status === "published") return "ACTIVE";
  if (status === "stub") return "STUB_NO_INDEX";
  return "PREPARED_OFF";
}

export function isRegionPublicRoute(status: RegionContentStatus): boolean {
  return resolveRegionActivation(status) !== "PREPARED_OFF";
}

export function isRegionDiscoverable(status: RegionContentStatus): boolean {
  return resolveRegionActivation(status) === "ACTIVE";
}

export function isRegionPreviewRoute(status: RegionContentStatus): boolean {
  return resolveRegionActivation(status) !== "STUB_NO_INDEX";
}
