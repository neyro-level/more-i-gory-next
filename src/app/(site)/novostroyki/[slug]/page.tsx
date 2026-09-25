import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { ActionLink } from "@/components/navigation/action-link";
import {
  getPublishedComplexBySlug,
  listActiveNewbuildInventoryByComplex,
} from "@/core/data-access/public";
import { buildPageMetadata } from "@/seo/metadata";
import { sourceFromCmsSeo } from "@/seo/page-metadata";
import { resolveRuntimeContour } from "@/project/runtime-contour";

type NewbuildComplexPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: NewbuildComplexPageProps): Promise<Metadata> {
  const { slug } = await params;
  const complex = await getPublishedComplexBySlug(slug);

  if (!complex) return {};

  return buildPageMetadata(sourceFromCmsSeo({
    canonical: complex.path,
    description: complex.seo.description,
    ogImagePath: complex.seo.ogImagePath,
    publicationStatus: "published",
    runtimeContour: resolveRuntimeContour(),
    seo: complex.seo,
  }));
}

export default async function NewbuildComplexPage({ params }: NewbuildComplexPageProps) {
  const { slug } = await params;
  const complex = await getPublishedComplexBySlug(slug);

  if (!complex) notFound();

  const inventory = await listActiveNewbuildInventoryByComplex(complex.id);

  return (
    <main>
      <PageHero
        eyebrow="Жилой комплекс"
        title={complex.title}
        lead={`${complex.regionLabel}. Застройщик: ${complex.developer.title}. Карточка показывает только активный feed inventory, без отдельных индексируемых URL для юнитов.`}
        primaryCta={{ href: "/podbor/", label: "Разобрать ЖК" }}
        secondaryCta={{ href: complex.developer.path, label: "Застройщик" }}
        image={complex.image}
        proof={complex.address ?? "Адрес уточняется в опубликованных данных ЖК."}
      />

      <SectionShell
        eyebrow="Доступный inventory"
        title={inventory.length > 0 ? "Активные предложения" : "Активные предложения не опубликованы"}
        lead="Юниты выводятся только как часть карточки ЖК и не получают собственного индексируемого URL."
      >
        {inventory.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inventory.map((item) => (
              <Card key={item.id} className="rounded-card bg-card">
                <CardHeader>
                  <CardTitle className="text-h3">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-body-sm text-muted-foreground">
                  {item.rooms != null ? <p>Комнат: {item.rooms}</p> : null}
                  {item.totalArea != null ? <p>Площадь: {item.totalArea} м²</p> : null}
                  {item.priceMinor != null ? <p>Бюджет: от {Math.round(item.priceMinor / 100).toLocaleString("ru-RU")} ₽</p> : null}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-large bg-card">
            <CardHeader>
              <CardTitle className="text-h3">Нет опубликованных активных предложений</CardTitle>
            </CardHeader>
            <CardContent className="text-body text-muted-foreground">
              Доступность появится после проверки фида и публикации активных записей.
            </CardContent>
          </Card>
        )}
      </SectionShell>

      <SectionShell
        rhythm="sm"
        eyebrow="Связанные разделы"
        title="Проверить ЖК в контексте рынка"
        lead="Карточка ЖК связана с застройщиком, общим каталогом, региональным сегментом и аналитикой по инвестиционным рискам."
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <ActionLink href="/novostroyki/" variant="outline">Все новостройки</ActionLink>
          <ActionLink href="/investicionnaya-nedvizhimost/" variant="outline">Сравнить рынки</ActionLink>
          <ActionLink href={complex.developer.path} variant="outline">Застройщик</ActionLink>
          <ActionLink href="/analitika/" variant="outline">Аналитика</ActionLink>
        </div>
      </SectionShell>

      <SectionShell rhythm="sm">
        <LeadFormSection title={`Получить разбор ${complex.title}`} />
      </SectionShell>
    </main>
  );
}
