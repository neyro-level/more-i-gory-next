import { getRegionRouteMetadata, RegionRoutePage } from "@/app/(site)/_shared/region-route-page";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getRegionRouteMetadata("/altay/");
}

export default function AltayPage() {
  return <RegionRoutePage path="/altay/" />;
}
