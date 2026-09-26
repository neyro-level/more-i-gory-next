import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { RiskBlock } from "@/components/marketing/risk-block";
import { SourceList } from "@/components/marketing/source-list";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import type { ArticleDTO, PublicPropertyDTO } from "@/core/dto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ObjectCard } from "@/components/marketing/object-card";
import { ArticleCard } from "@/components/marketing/article-card";
import { ActionLink } from "@/components/navigation/action-link";
import { StructuredBreadcrumbs } from "@/components/navigation/structured-breadcrumbs";
import { analyticsDataAttributes } from "@/core/analytics/dimensions";
import { isDiscoverableGeoStatus } from "@/core/navigation/public-link-policy";

type ProjectPassportTemplateProps = {
  property: PublicPropertyDTO;
  relatedArticles?: readonly ArticleDTO[];
  relatedProjects?: readonly PublicPropertyDTO[];
};

function formatCheckedAt(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Moscow" }).format(date);
}

function safeSourceHref(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function ProjectPassportTemplate({ property, relatedArticles = [], relatedProjects = [] }: ProjectPassportTemplateProps) {
  const isArchived = property.status === "archived";
  const checkedAt = formatCheckedAt(property.verifiedAt);

  return (
    <main id="main" {...analyticsDataAttributes({ page_key: "investment_project", project_slug: property.slug, region_slug: property.geoContext.region.slug, city_slug: property.geoContext.cityOrArea?.slug, source_surface: "project_passport" })}>
      <SectionShell rhythm="sm">
        <StructuredBreadcrumbs items={[
          { href: "/", label: "Главная" },
          { href: "/obekty/", label: "Объекты" },
          { label: property.title },
        ]} />
      </SectionShell>

      <PageHero
        eyebrow={isArchived ? "Архивный инвестиционный паспорт" : "Инвестиционный паспорт проекта"}
        title={`${property.title} — инвестиционный паспорт`}
        lead={isArchived ? "Объект больше не актуален для покупки или инвестиционного разбора. Паспорт сохранён только как архивная справка." : property.verdict}
        primaryCta={{ href: "/podbor/", label: "Обсудить проект" }}
        secondaryCta={{ href: "/obekty/", label: "Вернуться к объектам" }}
        image={property.image}
        proof={isArchived ? "Статус: не актуально; страница закрыта от индексации." : `Проверено: ${checkedAt}`}
      />

      {isArchived ? (
        <SectionShell
          eyebrow="Не актуально"
          title="Этот объект снят с публичной подборки"
          lead="Мы не маскируем архивный паспорт под доступный объект. Для сравнения можно перейти к актуальным альтернативам или запросить ручной shortlist."
        >
          {relatedProjects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((candidate) => (
                <ObjectCard
                  budget={candidate.budgetNote}
                  cityOrArea={candidate.geoContext.cityOrArea?.title}
                  key={candidate.id}
                  href={candidate.path}
                  image={candidate.image}
                  location={candidate.geoContext.region.title}
                  locationHref={isDiscoverableGeoStatus(candidate.geoContext.region.status) ? candidate.geoContext.region.path : undefined}
                  risk={candidate.riskSummary}
                  status="проверен"
                  thesis={candidate.verdict}
                  title={candidate.title}
                  verifiedAt={candidate.verifiedAt}
                />
              ))}
            </div>
          ) : (
            <Card radius="card" className="bg-card">
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
        <SourceList title="Факты и допущения" items={property.facts.map((fact) => ({ title: fact.label, description: fact.value }))} />
      </SectionShell>

      <SectionShell rhythm="sm" eyebrow="География" title="Контекст проекта">
        <div className="flex flex-wrap gap-3">
          {isDiscoverableGeoStatus(property.geoContext.region.status) ? (
            <ActionLink href={property.geoContext.region.path} variant="outline">{property.geoContext.region.title}</ActionLink>
          ) : null}
          {property.geoContext.cityOrArea && isDiscoverableGeoStatus(property.geoContext.cityOrArea.status) ? (
            <ActionLink href={property.geoContext.cityOrArea.path} variant="outline">{property.geoContext.cityOrArea.title}</ActionLink>
          ) : null}
          <ActionLink href="/metodika/" variant="outline">Методика отбора</ActionLink>
          <ActionLink href="/analitika/" variant="outline">Аналитика</ActionLink>
          <ActionLink href="/podbor/" variant="outline">Персональный подбор</ActionLink>
        </div>
      </SectionShell>

      <SectionShell rhythm="sm" eyebrow="Доказательства" title="Источники и дата проверки">
        <SourceList
          title="Источники паспорта"
          items={property.sources.map((source) => ({
            title: source.label,
            description: `Проверено ${checkedAt}`,
            href: safeSourceHref(source.url),
          }))}
        />
      </SectionShell>

      <SectionShell rhythm="sm">
        <RiskBlock title="Ключевой риск" text={property.riskSummary} />
      </SectionShell>

      {relatedProjects.length > 0 && !isArchived ? (
        <SectionShell rhythm="sm" eyebrow="Сравнение" title="Похожие проверенные проекты">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedProjects.map((candidate) => (
              <ObjectCard
                budget={candidate.budgetNote}
                cityOrArea={candidate.geoContext.cityOrArea?.title}
                key={candidate.id}
                href={candidate.path}
                image={candidate.image}
                location={candidate.geoContext.region.title}
                locationHref={isDiscoverableGeoStatus(candidate.geoContext.region.status) ? candidate.geoContext.region.path : undefined}
                risk={candidate.riskSummary}
                status="проверен"
                thesis={candidate.verdict}
                title={candidate.title}
                verifiedAt={candidate.verifiedAt}
              />
            ))}
          </div>
        </SectionShell>
      ) : null}

      {relatedArticles.length > 0 ? (
        <SectionShell rhythm="sm" eyebrow="Аналитика" title="Материалы по контексту проекта">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.map((article) => (
              <ArticleCard
                description={article.description}
                href={article.path}
                key={article.id}
                title={article.title}
              />
            ))}
          </div>
        </SectionShell>
      ) : null}

      <SectionShell rhythm="sm">
        <LeadFormSection title="Получить разбор этого проекта" />
      </SectionShell>
    </main>
  );
}
