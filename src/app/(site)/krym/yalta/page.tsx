import { getRegionRouteMetadata, RegionRoutePage } from "@/app/(site)/_shared/region-route-page";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getRegionRouteMetadata("/krym/yalta/");
}

export default function YaltaPage() {
  return <RegionRoutePage path="/krym/yalta/" />;
}
