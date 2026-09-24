import { getRegionRouteMetadata, RegionRoutePage } from "@/app/(site)/_shared/region-route-page";

export const dynamic = "force-dynamic";

export function generateMetadata() {
  return getRegionRouteMetadata("/arkhyz/");
}

export default function ArkhyzPage() {
  return <RegionRoutePage path="/arkhyz/" />;
}
