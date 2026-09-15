import { getStaticMetadata } from "@/seo/metadata";
import { SegmentLanding } from "../../_components/segment-landing";

export const metadata = getStaticMetadata("PAGE-008");

export default function YaltaPage() {
  return <SegmentLanding pageId="PAGE-008" />;
}
