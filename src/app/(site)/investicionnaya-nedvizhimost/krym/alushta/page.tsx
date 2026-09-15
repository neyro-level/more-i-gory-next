import { getStaticMetadata } from "@/seo/metadata";
import { SegmentLanding } from "../../_components/segment-landing";

export const metadata = getStaticMetadata("PAGE-011");

export default function AlushtaPage() {
  return <SegmentLanding pageId="PAGE-011" />;
}
