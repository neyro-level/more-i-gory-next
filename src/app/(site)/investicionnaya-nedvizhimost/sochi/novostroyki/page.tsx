import { getStaticMetadata } from "@/seo/metadata";
import { SegmentLanding } from "../../_components/segment-landing";

export const metadata = getStaticMetadata("PAGE-004");

export default function SochiNewBuildingsPage() {
  return <SegmentLanding pageId="PAGE-004" />;
}
