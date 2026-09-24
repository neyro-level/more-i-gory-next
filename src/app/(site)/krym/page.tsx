import { getRegionRouteMetadata, RegionRoutePage } from "@/app/(site)/_shared/region-route-page";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getRegionRouteMetadata("/krym/");
}

export default function CrimeaPage() {
  return <RegionRoutePage path="/krym/" />;
}
