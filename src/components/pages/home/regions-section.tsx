import { SectionShell } from "@/components/layout/section-shell";
import { RegionCard } from "@/components/marketing/region-card";
import { ActionLink } from "@/components/navigation/action-link";
import type { HomeRegionCardDTO } from "@/core/dto";

export function RegionsSection({ regions }: Readonly<{ regions: HomeRegionCardDTO[] }>) {
  return (
    <SectionShell
      actions={<ActionLink href="/investicionnaya-nedvizhimost/">Сравнить регионы</ActionLink>}
      eyebrow="Регионы"
      lead="На старте фокус — Сочи, Крым, Архыз и Алтай. Новые направления добавляются после отдельной проверки рынка и содержания."
      rhythm="lg"
      title="Сравниваем море и горы как разные инвестиционные рынки"
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {regions.map((region) => <RegionCard key={region.id} {...region} />)}
      </div>
    </SectionShell>
  );
}
