import { getStaticMetadata } from "@/seo/metadata";
import { RegionLanding } from "../_components/region-landing";

export const metadata = getStaticMetadata("PAGE-012");

export default function ArkhyzPage() {
  return (
    <RegionLanding
      pageId="PAGE-012"
      regionSlug="arkhyz"
      primaryCta="Разобрать Архыз"
      secondaryCta="Сравнить с морскими рынками"
    />
  );
}
