import { getStaticMetadata } from "@/seo/metadata";
import { SegmentLanding } from "../../_components/segment-landing";

export const metadata = getStaticMetadata("PAGE-009");

export default function SevastopolPage() {
  return <SegmentLanding pageId="PAGE-009" />;
}
