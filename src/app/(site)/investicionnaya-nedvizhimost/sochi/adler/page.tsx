import { getStaticMetadata } from "@/seo/metadata";
import { SegmentLanding } from "../../_components/segment-landing";

export const metadata = getStaticMetadata("PAGE-006");

export default function AdlerPage() {
  return <SegmentLanding pageId="PAGE-006" />;
}
