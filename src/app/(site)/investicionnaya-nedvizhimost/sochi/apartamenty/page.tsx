import { getStaticMetadata } from "@/seo/metadata";
import { SegmentLanding } from "../../_components/segment-landing";

export const metadata = getStaticMetadata("PAGE-005");

export default function SochiApartmentsPage() {
  return <SegmentLanding pageId="PAGE-005" />;
}
