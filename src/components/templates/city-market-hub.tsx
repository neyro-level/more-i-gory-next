import { SectionShell } from "@/components/layout/section-shell";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { ObjectCard } from "@/components/marketing/object-card";
import { PageHero } from "@/components/marketing/page-hero";
import { RiskBlock } from "@/components/marketing/risk-block";
import { ActionLink } from "@/components/navigation/action-link";
import { StructuredBreadcrumbs } from "@/components/navigation/structured-breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicPropertyDTO, PublicRegionDTO } from "@/core/dto";
import { buildCityHubModel } from "@/core/regions/city-hub";
import { analyticsDataAttributes } from "@/core/analytics/dimensions";
import { isDiscoverableGeoStatus } from "@/core/navigation/public-link-policy";

type CityMarketHubProps = Readonly<{
  city: PublicRegionDTO;
  cityNameGenitive: string;
  cityNamePrepositional: string;
  projects: readonly PublicPropertyDTO[];
  regions: readonly PublicRegionDTO[];
  title: string;
}>;

function ProjectGrid({ projects }: Readonly<{ projects: readonly PublicPropertyDTO[] }>) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
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
  );
}

export function CityMarketHub({ city, cityNameGenitive, cityNamePrepositional, projects, regions, title }: CityMarketHubProps) {
  const model = buildCityHubModel(city, regions, projects);

  return (
    <main id="main" {...analyticsDataAttributes({ page_key: "city", region_slug: city.parentSlug, city_slug: city.slug, source_surface: "city_hub" })}>
      <SectionShell rhythm="sm">
        <StructuredBreadcrumbs items={[
          { href: "/", label: "Главная" },
          { href: "/investicionnaya-nedvizhimost/", label: "Регионы" },
          { href: "/krym/", label: "Крым" },
          { label: city.title },
        ]} />
      </SectionShell>
      <PageHero
        eyebrow="Локальный рынок Крыма"
        title={title}
        lead={city.lead}
        primaryCta={{ href: "/podbor/", label: "Получить подборку" }}
        secondaryCta={{ href: "/krym/", label: "Сравнить города Крыма" }}
        image={city.image}
        proof={model.gate.state === "pass"
          ? "По рынку подготовлена локальная аналитика и проверен как минимум один инвестиционный паспорт."
          : "Обзор дополняется локальной аналитикой и проверенными инвестиционными паспортами."}
      />

      <SectionShell eyebrow="Инвестиционный тезис" title={`Что проверяем в ${cityNamePrepositional}`}>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card radius="large" className="bg-card">
            <CardHeader><CardTitle className="text-h3">Локальная гипотеза</CardTitle></CardHeader>
            <CardContent className="text-body text-muted-foreground">{city.investmentThesis}</CardContent>
          </Card>
          <RiskBlock title="Ключевое ограничение" text={city.riskSummary} />
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Рамка рынка"
        title="Локации, форматы, бюджет и экономика"
        lead="Каждая ось опирается на проверяемые факты; отсутствие данных не заменяется среднерыночным обещанием."
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Зоны и локации", "Районы, транспорт и инфраструктура с датой проверки."],
            ["Форматы и бюджет", "Тип объекта, полный входной бюджет и обязательные расходы."],
            ["Спрос и сезонность", "Сценарий спроса, ограничения выборки и периоды простоя."],
            ["Управление и выход", "Оператор, договор, расходы и реалистичная ликвидность."],
          ].map(([heading, description]) => (
            <Card radius="card" className="bg-card" key={heading}>
              <CardHeader><CardTitle className="text-h3">{heading}</CardTitle></CardHeader>
              <CardContent className="text-body-sm text-muted-foreground">{description}</CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow={`Новостройки ${cityNameGenitive}`}
        title="Проверенные новостройки города"
        lead="Показываем проекты с подготовленным паспортом и подтверждённой привязкой к городскому рынку."
      >
        {model.newbuildProjects.length > 0 ? <ProjectGrid projects={model.newbuildProjects} /> : (
          <Card radius="card" className="bg-card">
            <CardHeader><CardTitle className="text-h3">Проверенных новостроек пока нет</CardTitle></CardHeader>
            <CardContent className="text-body text-muted-foreground">Раздел появится после проверки первого подходящего проекта.</CardContent>
          </Card>
        )}
      </SectionShell>

      <SectionShell
        eyebrow="Отобранные проекты"
        title={`Инвестиционные паспорта: ${city.title}`}
        actions={<ActionLink href="/obekty/" variant="outline">Глобальный каталог</ActionLink>}
      >
        {model.projects.length > 0 ? <ProjectGrid projects={model.projects} /> : (
          <Card radius="card" className="bg-card">
            <CardHeader><CardTitle className="text-h3">Публичный shortlist не готов</CardTitle></CardHeader>
            <CardContent className="text-body text-muted-foreground">Подборка появится после подготовки первого полного инвестиционного паспорта.</CardContent>
          </Card>
        )}
      </SectionShell>

      <SectionShell eyebrow="Сравнение" title="Крым и соседние городские рынки" rhythm="sm">
        <div className="flex flex-wrap gap-3">
          <ActionLink href="/krym/" variant="outline">Крым</ActionLink>
          {model.siblingCities.map((sibling) => (
            <ActionLink href={sibling.path} key={sibling.id} variant="outline">{sibling.title}</ActionLink>
          ))}
          <ActionLink href="/analitika/" variant="outline">Аналитика</ActionLink>
          <ActionLink href="/metodika/" variant="outline">Методика</ActionLink>
        </div>
      </SectionShell>

      <SectionShell eyebrow="Готовность обзора" title={model.gate.state === "pass" ? "Данных достаточно для сравнения" : "Обзор ещё дополняется"} rhythm="sm">
        <Card radius="card" className="bg-card">
          <CardContent className="flex flex-col gap-3 pt-6 text-body text-muted-foreground">
            <p>{model.gate.state === "pass"
              ? "Подготовлены локальная аналитика, дата проверки и как минимум один полный паспорт."
              : "Для полноценного сравнения нужны локальная аналитика, дата проверки и как минимум один полный паспорт."}</p>
          </CardContent>
        </Card>
      </SectionShell>

      <SectionShell rhythm="sm"><LeadFormSection title={`Получить разбор: ${city.title}`} /></SectionShell>
    </main>
  );
}
