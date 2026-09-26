import { ActionLink } from "@/components/navigation/action-link";
import { isDiscoverableGeoStatus } from "@/core/navigation/public-link-policy";
import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ObjectCard } from "@/components/marketing/object-card";
import { CatalogFilters } from "@/components/marketing/catalog-filters";
import { NumberedSteps } from "@/components/marketing/numbered-steps";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { listEditorialPreviewManualProperties, listPublishedManualProperties } from "@/core/data-access/public";
import { isEditorialPreviewEnabled } from "@/core/data-access/preview/editorial-preview";
import {
  buildCatalogFilterGroups,
  filterCatalogProperties,
  getPropertyFormatLabel,
  hasCatalogQueryState,
  minimumFilterableCatalogSize,
  parseCatalogFilterQuery,
} from "@/core/catalog/public-catalog";

export const dynamic = "force-dynamic";

type ObjectsPageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

export async function generateMetadata({ searchParams }: ObjectsPageProps) {
  return getStaticMetadata("PAGE-014", { technical: hasCatalogQueryState(await searchParams) });
}

const criteria = [
  "понятный формат права и документов",
  "объяснимая экономика владения",
  "проверяемый оператор или модель управления",
  "явные ограничения и риски",
  "сценарий выхода до сделки",
];

export default async function ObjectsPage({ searchParams }: ObjectsPageProps) {
  const seo = getSeoEntry("PAGE-014");
  const editorialPreview = isEditorialPreviewEnabled();
  const properties = editorialPreview
    ? await listEditorialPreviewManualProperties()
    : await listPublishedManualProperties();
  const query = parseCatalogFilterQuery(await searchParams);
  const filterGroups = buildCatalogFilterGroups(properties);
  const visibleProperties = filterCatalogProperties(properties, query, filterGroups);
  const compactCatalog = properties.length < minimumFilterableCatalogSize;

  return (
    <main id="main">
      <PageHero
        eyebrow="Каталог инвестиционных паспортов"
        title={seo.h1}
        lead="Не массовая витрина квартир, а курируемый список проектов с инвестиционным выводом, фактами, рисками и источниками."
        primaryCta={{ href: "/podbor/", label: "Получить shortlist" }}
        secondaryCta={{ href: "/metodika/", label: "Как мы отбираем" }}
        image={{
          alt: "Черновая обложка инвестиционного паспорта курортного проекта",
          height: 1000,
          src: "/images/projects/sample-resort/cover.webp",
          width: 1478,
        }}
        proof="Актуальность каждого паспорта подтверждается датой последней проверки. Фильтры не создают индексируемых страниц."
      />

      <SectionShell
        eyebrow="Критерий допуска"
        title="Проект появляется здесь только после полного паспорта"
        lead="До подтверждения проектов каталог работает как объяснение отбора и точка входа в персональный разбор."
      >
        <NumberedSteps columns={5} items={criteria.map((title) => ({ title }))} />
      </SectionShell>

      {filterGroups.length > 0 ? (
        <SectionShell
          rhythm="sm"
          eyebrow="Фильтры"
          title="Сравнить опубликованные паспорта"
          lead="Параметры работают внутри каталога. Любое query-состояние закрыто от индексации и канонизируется на чистый /obekty/."
        >
          <CatalogFilters groups={filterGroups} query={query} />
        </SectionShell>
      ) : null}

      <SectionShell
        rhythm="sm"
        eyebrow="Первые карточки"
        title={properties.length > 0 ? "Опубликованные инвестиционные паспорта" : "Паспорта готовятся к публикации"}
        lead={
          properties.length > 0
            ? compactCatalog
              ? "Пока это компактная курируемая витрина без искусственных фильтров и счётчиков. Каждая карточка ведёт на полный паспорт."
              : "Каждая карточка ведёт на полный паспорт проекта."
            : "Пока подходящих паспортов нет: новые объекты появятся после проверки фактов и инвестиционной логики."
        }
      >
        {visibleProperties.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleProperties.map((property) => (
              <ObjectCard
                budget={property.budgetNote}
                cityOrArea={property.geoContext.cityOrArea?.title}
                format={getPropertyFormatLabel(property)}
                key={property.id}
                href={property.path}
                image={property.image}
                location={property.geoContext.region.title}
                locationHref={isDiscoverableGeoStatus(property.geoContext.region.status) ? property.geoContext.region.path : undefined}
                risk={property.riskSummary}
                status="проверен"
                thesis={property.verdict}
                title={property.title}
                verifiedAt={property.verifiedAt}
              />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <Card radius="large" className="bg-card">
            <CardHeader>
              <CardTitle className="text-h3">По выбранным параметрам паспортов нет</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 text-body text-muted-foreground">
              <p>Сбросьте фильтры или оставьте задачу на ручной shortlist — неподтверждённые объекты не добавляются ради количества.</p>
              <ActionLink href="/obekty/" variant="outline">Сбросить фильтры</ActionLink>
            </CardContent>
          </Card>
        ) : (
          <Card radius="large" className="bg-card">
            <CardHeader>
              <CardTitle className="text-h3">Почему здесь нет фальшивых объектов</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 text-body text-muted-foreground">
              <p>
                Объект без подтверждённых характеристик, источников, оценки рисков и инвестиционного вывода не публикуется.
                Это защищает пользователя от рекламной имитации выбора.
              </p>
              <ActionLink href="/podbor/">
                Запросить подборку вручную
              </ActionLink>
              {editorialPreview ? (
                <ActionLink href="/obekty/preview-project/" variant="outline">
                  Открыть шаблон паспорта
                </ActionLink>
              ) : null}
            </CardContent>
          </Card>
        )}
      </SectionShell>

      <SectionShell rhythm="sm">
        <LeadFormSection title="Получить подборку объектов под задачу" />
      </SectionShell>
    </main>
  );
}
