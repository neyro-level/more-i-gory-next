import { getStaticMetadata } from "@/seo/metadata";
import { RegionLanding } from "../_components/region-landing";

export const metadata = getStaticMetadata("PAGE-007");

export default function KrymPage() {
  return (
    <RegionLanding
      pageId="PAGE-007"
      regionSlug="krym"
      primaryCta="Получить подборку по Крыму"
      secondaryCta="Сравнить с Сочи"
    />
  );
}
