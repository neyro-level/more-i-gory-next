import { getStaticMetadata } from "@/seo/metadata";
import { SegmentLanding } from "../../_components/segment-landing";

export const metadata = getStaticMetadata("PAGE-010");

export default function EvpatoriyaPage() {
  return <SegmentLanding pageId="PAGE-010" />;
}
