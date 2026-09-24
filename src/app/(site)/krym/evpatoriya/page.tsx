import { getRegionRouteMetadata, RegionRoutePage } from "@/app/(site)/_shared/region-route-page";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getRegionRouteMetadata("/krym/evpatoriya/");
}

export default function EvpatoriyaPage() {
  return <RegionRoutePage path="/krym/evpatoriya/" />;
}
