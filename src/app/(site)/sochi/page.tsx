import { getRegionRouteMetadata, RegionRoutePage } from "@/app/(site)/_shared/region-route-page";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getRegionRouteMetadata("/sochi/");
}

export default function SochiPage() {
  return <RegionRoutePage path="/sochi/" />;
}
