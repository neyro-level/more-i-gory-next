import { getStaticMetadata } from "@/seo/metadata";
import { RegionLanding } from "../_components/region-landing";

export const metadata = getStaticMetadata("PAGE-013");

export default function AltayPage() {
  return (
    <RegionLanding
      pageId="PAGE-013"
      regionSlug="altay"
      primaryCta="Разобрать Алтай"
      secondaryCta="Сравнить с другими регионами"
    />
  );
}
