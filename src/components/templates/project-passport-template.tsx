import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { RiskBlock } from "@/components/marketing/risk-block";
import { SourceList } from "@/components/marketing/source-list";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import type { PublicPropertyDTO } from "@/core/dto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ObjectCard } from "@/components/marketing/object-card";

type ProjectPassportTemplateProps = {
  alternatives?: readonly PublicPropertyDTO[];
  property: PublicPropertyDTO;
};

export function ProjectPassportTemplate({ alternatives = [], property }: ProjectPassportTemplateProps) {
  const isArchived = property.status === "archived";

  return (
    <main>
      <PageHero
        eyebrow={isArchived ? "Архивный инвестиционный паспорт" : "Инвестиционный паспорт проекта"}
        title={`${property.title} — инвестиционный паспорт`}
        lead={isArchived ? "Объект больше не актуален для покупки или инвестиционного разбора. Паспорт сохранён только как архивная справка." : property.verdict}
        primaryCta={{ href: "/podbor/", label: "Обсудить проект" }}
        secondaryCta={{ href: "/obekty/", label: "Вернуться к объектам" }}
        image={property.image}
        proof={isArchived ? "Статус: не актуально; страница закрыта от индексации." : property.verifiedAt ? `Проверено: ${property.verifiedAt}` : `Опубликовано: ${property.publishedAt}`}
      />

      {isArchived ? (
        <SectionShell
          eyebrow="Не актуально"
          title="Этот объект снят с публичной подборки"
          lead="Мы не маскируем архивный паспорт под доступный объект. Для сравнения можно перейти к актуальным альтернативам или запросить ручной shortlist."
        >
          {alternatives.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {alternatives.map((candidate) => (
                <ObjectCard
                  key={candidate.id}
                  href={candidate.path}
                  image={candidate.image}
                  location={candidate.regionLabel}
                  risk={candidate.riskSummary}
                  status="published"
                  thesis={candidate.verdict}
                  title={candidate.title}
                />
              ))}
            </div>
          ) : (
            <Card className="rounded-card bg-card">
              <CardHeader>
                <CardTitle className="text-h3">Альтернативы подбираются вручную</CardTitle>
              </CardHeader>
              <CardContent className="text-body text-muted-foreground">
                Открытых замен пока нет в каталоге. Можно оставить задачу, и мы соберём релевантную подборку без вывода архивного объекта в индекс.
              </CardContent>
            </Card>
          )}
        </SectionShell>
      ) : null}

      <SectionShell eyebrow="Факты" title="Что подтверждено в паспорте">
        <SourceList items={property.facts.map((fact) => ({ title: fact.label, description: fact.value }))} />
      </SectionShell>

      <SectionShell className="pt-0">
        <RiskBlock title="Ключевой риск" text={property.riskSummary} />
      </SectionShell>

      <SectionShell className="pt-0">
        <LeadFormSection title="Получить разбор этого проекта" />
      </SectionShell>
    </main>
  );
}
