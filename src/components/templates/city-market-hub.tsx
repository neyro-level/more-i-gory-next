import { SectionShell } from "@/components/layout/section-shell";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { ObjectCard } from "@/components/marketing/object-card";
import { PageHero } from "@/components/marketing/page-hero";
import { RiskBlock } from "@/components/marketing/risk-block";
import { ActionLink } from "@/components/navigation/action-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicPropertyDTO, PublicRegionDTO } from "@/core/dto";
import { buildCityHubModel } from "@/core/regions/city-hub";

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
          locationHref={project.geoContext.region.path}
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
    <main>
      <PageHero
        eyebrow="Локальный рынок Крыма"
        title={title}
        lead={city.lead}
        primaryCta={{ href: "/podbor/", label: "Получить подборку" }}
        secondaryCta={{ href: "/krym/", label: "Сравнить города Крыма" }}
        image={city.image}
        proof={model.gate.state === "pass"
          ? `Рынок проверен ${city.verifiedAt ?? ""}; Content Gate выполнен.`
          : "Страница остаётся вне индекса до полной локальной аналитики и первого проверенного паспорта."}
      />

      <SectionShell eyebrow="Инвестиционный тезис" title={`Что проверяем в ${cityNamePrepositional}`}>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-large bg-card">
            <CardHeader><CardTitle className="text-h3">Локальная гипотеза</CardTitle></CardHeader>
            <CardContent className="text-body text-muted-foreground">{city.investmentThesis}</CardContent>
          </Card>
          <RiskBlock title="Ключевое ограничение" text={city.riskSummary} />
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Рамка рынка"
        title="Локации, форматы, бюджет и экономика"
        lead="Каждая ось заполняется только source-backed фактами; отсутствие данных не заменяется среднерыночным обещанием."
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Зоны и локации", "Районы, транспорт и инфраструктура с датой проверки."],
            ["Форматы и бюджет", "Тип объекта, полный входной бюджет и обязательные расходы."],
            ["Спрос и сезонность", "Сценарий спроса, ограничения выборки и периоды простоя."],
            ["Управление и выход", "Оператор, договор, расходы и реалистичная ликвидность."],
          ].map(([heading, description]) => (
            <Card className="rounded-card bg-card" key={heading}>
              <CardHeader><CardTitle className="text-h3">{heading}</CardTitle></CardHeader>
              <CardContent className="text-body-sm text-muted-foreground">{description}</CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow={`Новостройки ${cityNameGenitive}`}
        title="Проверенные новостройки — секция, а не новый SEO URL"
        lead={`Маршрут /krym/${city.slug}/novostroyki/ не создаётся. Секция показывает только опубликованные паспорта с глобальными canonical URL.`}
      >
        {model.newbuildProjects.length > 0 ? <ProjectGrid projects={model.newbuildProjects} /> : (
          <Card className="rounded-card bg-card">
            <CardHeader><CardTitle className="text-h3">Проверенных новостроек пока нет</CardTitle></CardHeader>
            <CardContent className="text-body text-muted-foreground">Пустая выборка не превращается в отдельную индексируемую страницу.</CardContent>
          </Card>
        )}
      </SectionShell>

      <SectionShell
        eyebrow="Curated projects"
        title={`Инвестиционные паспорта: ${city.title}`}
        actions={<ActionLink href="/obekty/" variant="outline">Глобальный каталог</ActionLink>}
      >
        {model.projects.length > 0 ? <ProjectGrid projects={model.projects} /> : (
          <Card className="rounded-card bg-card">
            <CardHeader><CardTitle className="text-h3">Публичный shortlist не готов</CardTitle></CardHeader>
            <CardContent className="text-body text-muted-foreground">До первого полного паспорта Content Gate остаётся в состоянии MISSING.</CardContent>
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

      <SectionShell eyebrow="Content Gate" title={model.gate.state === "pass" ? "Кандидат на индексацию готов" : "Индексирование пока закрыто"} rhythm="sm">
        <Card className="rounded-card bg-card">
          <CardContent className="flex flex-col gap-3 pt-6 text-body text-muted-foreground">
            {model.gate.reasons.length > 0
              ? model.gate.reasons.map((reason) => <p key={reason}>{reason}</p>)
              : <p>Опубликованы самостоятельная локальная аналитика, дата проверки и минимум один полный паспорт.</p>}
          </CardContent>
        </Card>
      </SectionShell>

      <SectionShell rhythm="sm"><LeadFormSection title={`Получить разбор: ${city.title}`} /></SectionShell>
    </main>
  );
}
