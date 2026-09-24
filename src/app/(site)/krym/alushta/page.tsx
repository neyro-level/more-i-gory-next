import { getRegionRouteMetadata, RegionRoutePage } from "@/app/(site)/_shared/region-route-page";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getRegionRouteMetadata("/krym/alushta/");
}

export default function AlushtaPage() {
  return <RegionRoutePage path="/krym/alushta/" />;
}
