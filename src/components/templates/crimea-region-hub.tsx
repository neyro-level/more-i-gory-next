import Link from "next/link";

import { SectionShell } from "@/components/layout/section-shell";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { ObjectCard } from "@/components/marketing/object-card";
import { PageHero } from "@/components/marketing/page-hero";
import { ActionLink } from "@/components/navigation/action-link";
import { StructuredBreadcrumbs } from "@/components/navigation/structured-breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicPropertyDTO, PublicRegionDTO } from "@/core/dto";
import { buildCrimeaHubModel } from "@/core/regions/crimea-hub";
import { analyticsDataAttributes } from "@/core/analytics/dimensions";
import { isDiscoverableGeoStatus } from "@/core/navigation/public-link-policy";

type CrimeaRegionHubProps = Readonly<{
  projects: readonly PublicPropertyDTO[];
  region: PublicRegionDTO;
  regions: readonly PublicRegionDTO[];
  title: string;
}>;

function formatVerifiedAt(value?: string): string {
  if (!value) return "Дата проверки не зафиксирована";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return `Проверено ${new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeZone: "Europe/Moscow" }).format(date)}`;
}

export function CrimeaRegionHub({ projects, region, regions, title }: CrimeaRegionHubProps) {
  const model = buildCrimeaHubModel(regions, projects);

  return (
    <main {...analyticsDataAttributes({ page_key: "region", region_slug: region.slug, source_surface: "region_hub" })}>
      <SectionShell rhythm="sm">
        <StructuredBreadcrumbs items={[
          { href: "/", label: "Главная" },
          { href: "/investicionnaya-nedvizhimost/", label: "Регионы" },
          { label: region.title },
        ]} />
      </SectionShell>
      <PageHero
        eyebrow="Региональный инвестиционный хаб"
        title={title}
        lead={region.lead}
        primaryCta={{ href: "/podbor/", label: "Получить подборку" }}
        secondaryCta={{ href: "/investicionnaya-nedvizhimost/", label: "Сравнить рынки" }}
        image={region.image}
        proof={model.gate.state === "pass"
          ? "Content Gate собран из проверенных городов и опубликованных инвестиционных паспортов."
          : "Страница остаётся вне индекса до завершения Content Gate; неподтверждённые факты не публикуются."}
      />

      <SectionShell
        eyebrow="Выбор локального рынка"
        title="Четыре города — один проверяемый контракт сравнения"
        lead="Каждый город раскрывается только после собственной проверки тезиса, рисков и даты актуальности. Черновой город не становится публичной SEO-страницей автоматически."
      >
        {model.cities.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {model.cities.map((city) => (
              <Card className="rounded-card bg-card" key={city.id}>
                <CardHeader>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={city.status === "published" ? "accent" : "secondary"}>
                      {city.status === "published" ? "Опубликован" : "Черновик"}
                    </Badge>
                    <Badge variant="secondary">{formatVerifiedAt(city.verifiedAt)}</Badge>
                  </div>
                  <CardTitle className="text-h3">
                    <Link href={city.path}>{city.title}</Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 text-body-sm text-muted-foreground">
                  <p>{city.investmentThesis}</p>
                  <p className="border-l-2 border-action pl-4 text-foreground">{city.riskSummary}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-card bg-card">
            <CardHeader><CardTitle className="text-h3">Городские рынки ещё не опубликованы</CardTitle></CardHeader>
            <CardContent className="text-body text-muted-foreground">
              Сравнение появится после независимой проверки минимум трёх городов. Пустые или шаблонные city pages не создаются.
            </CardContent>
          </Card>
        )}
      </SectionShell>

      <SectionShell
        eyebrow="Рамка сравнения"
        title="Что должно быть сопоставимо без перехода на другую страницу"
        lead="Хаб не подменяет факты рекламными обещаниями: незаполненная ось остаётся явным пробелом Content Gate."
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Форматы и бюджет", "Тип объекта, полный бюджет входа и обязательные расходы."],
            ["Спрос и сезонность", "Периоды спроса, ограничения выборки и дата проверки."],
            ["Управление", "Оператор, договорная модель и фактические расходы владельца."],
            ["Риски и выход", "Правовые ограничения, ликвидность и реалистичный сценарий выхода."],
          ].map(([heading, description]) => (
            <Card className="rounded-card bg-card" key={heading}>
              <CardHeader><CardTitle className="text-h3">{heading}</CardTitle></CardHeader>
              <CardContent className="text-body-sm text-muted-foreground">{description}</CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Curated shortlist"
        title="Проверенные инвестиционные паспорта Крыма"
        lead="Карточки ведут только на глобальные canonical URL `/obekty/<slug>/`; регион не становится вторым владельцем сущности."
        actions={<ActionLink href="/obekty/" variant="outline">Все объекты</ActionLink>}
      >
        {model.projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {model.projects.map((project) => (
              <ObjectCard
                budget={project.budgetNote}
                cityOrArea={project.geoContext.cityOrArea?.title}
                href={project.path}
                image={project.image}
                key={project.id}
                location={project.geoContext.region.title}
                locationHref={isDiscoverableGeoStatus(project.geoContext.region.status) ? project.geoContext.region.path : undefined}
                risk={project.riskSummary}
                status="проверен"
                thesis={project.verdict}
                title={project.title}
                verifiedAt={project.verifiedAt}
              />
            ))}
          </div>
        ) : (
          <Card className="rounded-card bg-card">
            <CardHeader><CardTitle className="text-h3">Публичный shortlist пока не собран</CardTitle></CardHeader>
            <CardContent className="text-body text-muted-foreground">
              До четырёх полных паспортов хаб не заявляет наличие готовой подборки и остаётся вне sitemap.
            </CardContent>
          </Card>
        )}
      </SectionShell>

      <SectionShell eyebrow="Content Gate" title={model.gate.state === "pass" ? "Минимальный порог выполнен" : "Индексирование пока закрыто"} rhythm="sm">
        <Card className="rounded-card bg-card">
          <CardContent className="flex flex-col gap-4 pt-6 text-body text-muted-foreground">
            <p>Проверенные города: {model.gate.cityCount}/3. Опубликованные паспорта: {model.gate.projectCount}/4.</p>
            {model.gate.reasons.map((reason) => <p key={reason}>{reason}</p>)}
            <div className="flex flex-wrap gap-3">
              <ActionLink href="/analitika/" variant="outline">Аналитика</ActionLink>
              <ActionLink href="/metodika/" variant="outline">Методика отбора</ActionLink>
              <ActionLink href="/podbor/" variant="outline">Персональный разбор</ActionLink>
            </div>
          </CardContent>
        </Card>
      </SectionShell>

      <SectionShell rhythm="sm">
        <LeadFormSection title="Получить разбор рынка Крыма" />
      </SectionShell>
    </main>
  );
}
