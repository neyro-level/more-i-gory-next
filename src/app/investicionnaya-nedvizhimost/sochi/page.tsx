import { getStaticMetadata } from "@/seo/metadata";
import { RegionLanding } from "../_components/region-landing";

export const metadata = getStaticMetadata("PAGE-003");

export default function SochiPage() {
  return (
    <RegionLanding
      pageId="PAGE-003"
      regionSlug="sochi"
      primaryCta="Получить подборку по Сочи"
      secondaryCta="Сравнить с другими регионами"
    />
  );
}
