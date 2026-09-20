import { ActionLink } from "@/components/navigation/action-link";
import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ObjectCard } from "@/components/marketing/object-card";
import { NumberedSteps } from "@/components/marketing/numbered-steps";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { listPublishedManualProperties } from "@/core/data-access/public";
import { isEditorialPreviewEnabled } from "@/core/data-access/preview/editorial-preview";

export const metadata = getStaticMetadata("PAGE-014");

const criteria = [
  "понятный формат права и документов",
  "объяснимая экономика владения",
  "проверяемый оператор или модель управления",
  "явные ограничения и риски",
  "сценарий выхода до сделки",
];

export default async function ObjectsPage() {
  const seo = getSeoEntry("PAGE-014");
  const editorialPreview = isEditorialPreviewEnabled();
  const properties = editorialPreview ? [] : await listPublishedManualProperties();

  return (
    <main>
      <PageHero
        eyebrow="Каталог инвестиционных паспортов"
        title={seo.h1}
        lead="Здесь будут только объекты, по которым можно показать инвестиционный вывод, факты, бюджет, управление, риски и источники. Пустой каталог не маскируется под выбор."
        primaryCta={{ href: "/podbor/", label: "Получить shortlist" }}
        secondaryCta={{ href: "/metodika/", label: "Как мы отбираем" }}
        image={{
          alt: "Черновая обложка инвестиционного паспорта курортного проекта",
          height: 1000,
          src: "/images/projects/sample-resort/cover.webp",
          width: 1478,
        }}
        proof="Фильтры будут клиентским leaf-компонентом и не создадут индексируемых URL."
      />

      <SectionShell
        eyebrow="Критерий допуска"
        title="Проект появляется здесь только после полного паспорта"
        lead="До подтверждения проектов каталог работает как объяснение отбора и точка входа в персональный разбор."
      >
        <NumberedSteps columns={5} items={criteria.map((title) => ({ title }))} />
      </SectionShell>

      <SectionShell
        rhythm="sm"
        eyebrow="Первые карточки"
        title={properties.length > 0 ? "Опубликованные инвестиционные паспорта" : "Паспорта готовятся к публикации"}
        lead={
          properties.length > 0
            ? "Каждая карточка ведёт на полный паспорт проекта."
            : "Сейчас в коде есть draft-шаблон, но он не выходит в public build и sitemap до проверки фактов."
        }
      >
        {properties.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <ObjectCard
                key={property.id}
                href={property.path}
                image={property.image}
                location={property.regionLabel}
                risk={property.riskSummary}
                status="published"
                thesis={property.verdict}
                title={property.title}
              />
            ))}
          </div>
        ) : (
          <Card className="rounded-large bg-card">
            <CardHeader>
              <CardTitle className="text-h3">Почему здесь нет фальшивых объектов</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 text-body text-muted-foreground">
              <p>
                Объект без цены, источников, риска, verifiedAt и инвестиционного вывода не публикуется.
                Это защищает SEO от thin content и пользователя от рекламной имитации выбора.
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
