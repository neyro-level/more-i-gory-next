import { ActionLink } from "@/components/navigation/action-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { ObjectCard } from "@/components/marketing/object-card";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { listPublishedComplexes } from "@/core/data-access/public";
import { getStaticMetadata } from "@/seo/metadata";

export const metadata = getStaticMetadata("PAGE-026");

export default async function NewbuildCatalogPage() {
  const complexes = await listPublishedComplexes();

  return (
    <main>
      <PageHero
        eyebrow="Каталог новостроек"
        title="Новостройки Крыма для инвестиционного разбора"
        lead="В каталог попадают только опубликованные жилые комплексы с проверенным застройщиком, регионом и публичной карточкой. Пустые фиды и скрытые проекты не создают витрину."
        primaryCta={{ href: "/podbor/", label: "Получить shortlist" }}
        secondaryCta={{ href: "/investicionnaya-nedvizhimost/krym/novostroyki/", label: "Сегмент Крым" }}
        image={{
          alt: "Новостройка у моря для инвестиционного разбора",
          height: 1000,
          src: "/images/projects/sample-resort/cover.webp",
          width: 1478,
        }}
        proof="/obekty/ остаётся ручной витриной инвестиционных паспортов; feed inventory выводится только в контуре новостроек."
      />

      <SectionShell
        eyebrow="Жилые комплексы"
        title={complexes.length > 0 ? "Опубликованные ЖК" : "ЖК готовятся к публикации"}
        lead={
          complexes.length > 0
            ? "Каждая карточка ведёт на страницу ЖК с застройщиком, локацией и доступным inventory."
            : "После подключения и проверки фида здесь появятся только опубликованные комплексы. Тестовые или скрытые записи не выводятся."
        }
      >
        {complexes.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {complexes.map((complex) => (
              <ObjectCard
                key={complex.id}
                href={complex.path}
                image={complex.image}
                location={complex.regionLabel}
                risk={`Застройщик: ${complex.developer.title}`}
                status="published"
                thesis={complex.address ?? "Адрес и корпусность уточняются в карточке ЖК."}
                title={complex.title}
              />
            ))}
          </div>
        ) : (
          <Card className="rounded-large bg-card">
            <CardHeader>
              <CardTitle className="text-h3">Каталог не имитирует выбор</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 text-body text-muted-foreground">
              <p>
                До появления опубликованных ЖК страница остаётся точкой входа в персональный подбор,
                а не SEO-списком без фактических данных.
              </p>
              <ActionLink href="/podbor/">Запросить подборку вручную</ActionLink>
            </CardContent>
          </Card>
        )}
      </SectionShell>

      <SectionShell
        rhythm="sm"
        eyebrow="Связанные разделы"
        title="От рынка к конкретному ЖК"
        lead="Региональный сегмент объясняет спрос и риски Крыма, аналитика помогает проверить экономику, а карточки ЖК ведут к застройщику и активным предложениям."
        actions={<ActionLink href="/investicionnaya-nedvizhimost/krym/novostroyki/" variant="outline">Сегмент Крым</ActionLink>}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-card bg-card">
            <CardHeader>
              <CardTitle className="text-h3">Аналитика перед выбором</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-body-sm text-muted-foreground">
              <p>Материалы помогают оценить доходность, риски апартаментов, ликвидность и сценарий выхода.</p>
              <ActionLink href="/analitika/" variant="link" className="w-fit p-0">Читать аналитику</ActionLink>
            </CardContent>
          </Card>
          <Card className="rounded-card bg-card">
            <CardHeader>
              <CardTitle className="text-h3">Методика отбора</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-body-sm text-muted-foreground">
              <p>Перед публикацией ЖК проверяются документы, застройщик, формат права, расходы и ограничения ликвидности.</p>
              <ActionLink href="/metodika/" variant="link" className="w-fit p-0">Как проверяем</ActionLink>
            </CardContent>
          </Card>
        </div>
      </SectionShell>

      <SectionShell rhythm="sm">
        <LeadFormSection title="Получить shortlist новостроек под задачу" />
      </SectionShell>
    </main>
  );
}
