import Link from "next/link";
import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ObjectCard } from "@/components/marketing/object-card";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { contentService } from "@/content/service";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const projects = await contentService.listPublishedProjects();

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
        <div className="grid gap-4 md:grid-cols-5">
          {criteria.map((item, index) => (
            <Card key={item} className="rounded-[1.5rem] bg-white">
              <CardContent className="space-y-4 p-5">
                <span className="grid size-9 place-items-center rounded-full bg-brand-coral text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm font-semibold leading-6">{item}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        className="pt-0"
        eyebrow="Первые карточки"
        title={projects.length > 0 ? "Опубликованные инвестиционные паспорта" : "Паспорта готовятся к публикации"}
        lead={
          projects.length > 0
            ? "Каждая карточка ведёт на полный паспорт проекта."
            : "Сейчас в коде есть draft-шаблон, но он не выходит в public build и sitemap до проверки фактов."
        }
      >
        {projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {await Promise.all(
              projects.map(async (project) => {
                const media = await contentService.getMediaAsset(project.coverMediaId);
                return (
                  <ObjectCard
                    key={project.id}
                    href={project.path}
                    image={{
                      alt: media?.alt ?? project.title,
                      height: media?.height ?? 1000,
                      src: media?.src ?? "/images/projects/sample-resort/cover.webp",
                      width: media?.width ?? 1478,
                    }}
                    location={project.regionId}
                    risk={project.riskSummary}
                    status="published"
                    thesis={project.verdict}
                    title={project.title}
                  />
                );
              }),
            )}
          </div>
        ) : (
          <Card className="rounded-[1.75rem] bg-white">
            <CardHeader>
              <CardTitle className="text-2xl">Почему здесь нет фальшивых объектов</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 text-base leading-8 text-muted-foreground">
              <p>
                Объект без цены, источников, риска, verifiedAt и инвестиционного вывода не публикуется.
                Это защищает SEO от thin content и пользователя от рекламной имитации выбора.
              </p>
              <Link prefetch={false} href="/podbor/" className={cn(buttonVariants({ size: "lg" }), "rounded-full bg-brand-navy px-6 text-white hover:bg-brand-navy/90")}>
                Запросить подборку вручную
              </Link>
            </CardContent>
          </Card>
        )}
      </SectionShell>

      <SectionShell className="pt-0">
        <LeadFormSection title="Получить подборку объектов под задачу" />
      </SectionShell>
    </main>
  );
}
