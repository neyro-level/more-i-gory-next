import { getRegionRouteMetadata, RegionRoutePage } from "@/app/(site)/_shared/region-route-page";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getRegionRouteMetadata("/krym/sevastopol/");
}

export default function SevastopolPage() {
  return <RegionRoutePage path="/krym/sevastopol/" />;
}
