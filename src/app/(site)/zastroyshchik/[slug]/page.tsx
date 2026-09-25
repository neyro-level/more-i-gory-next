import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { ActionLink } from "@/components/navigation/action-link";
import {
  getPublishedDeveloperBySlug,
  getEditorialPreviewDeveloperBySlug,
} from "@/core/data-access/public";
import { buildPageMetadata } from "@/seo/metadata";
import { sourceFromCmsSeo } from "@/seo/page-metadata";
import { resolveRuntimeContour } from "@/project/runtime-contour";
import { isEditorialPreviewEnabled } from "@/core/data-access/preview/editorial-preview";

async function getVisibleDeveloper(slug: string) {
  return isEditorialPreviewEnabled()
    ? getEditorialPreviewDeveloperBySlug(slug)
    : getPublishedDeveloperBySlug(slug);
}

type DeveloperPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: DeveloperPageProps): Promise<Metadata> {
  const { slug } = await params;
  const developer = await getVisibleDeveloper(slug);

  if (!developer) return {};

  return buildPageMetadata(sourceFromCmsSeo({
    canonical: developer.path,
    description: developer.seo.description,
    ogImagePath: developer.seo.ogImagePath,
    publicationStatus: developer.status,
    runtimeContour: resolveRuntimeContour(),
    seo: developer.seo,
  }));
}

export default async function DeveloperPage({ params }: DeveloperPageProps) {
  const { slug } = await params;
  const developer = await getVisibleDeveloper(slug);

  if (!developer) notFound();

  return (
    <main>
      <PageHero
        eyebrow="Застройщик"
        title={developer.title}
        lead={developer.description ?? "Публичная карточка застройщика появляется только после публикации и проверки данных."}
        primaryCta={{ href: "/podbor/", label: "Запросить проверку" }}
        secondaryCta={{ href: "/novostroyki/", label: "Все новостройки" }}
        image={{
          alt: "Новостройка у моря для инвестиционного разбора",
          height: 1000,
          src: "/images/projects/sample-resort/cover.webp",
          width: 1478,
        }}
      />

      <SectionShell eyebrow="Проверка" title="Карточка не заменяет юридическую экспертизу" lead="Перед сделкой нужны документы, сроки, договор, статус земли, разрешения и сценарий выхода.">
        <Card className="rounded-large bg-card">
          <CardHeader>
            <CardTitle className="text-h3">Что проверяем по застройщику</CardTitle>
          </CardHeader>
          <CardContent className="text-body text-muted-foreground">
            Репутацию, проектную декларацию, сроки, предыдущие очереди, формат права, управляющую модель и ограничения ликвидности.
          </CardContent>
        </Card>
      </SectionShell>

      <SectionShell
        rhythm="sm"
        eyebrow="Связанные разделы"
        title="Смотреть застройщика в контексте каталога"
        lead="Карточка застройщика не живёт отдельно от проекта: сравните ЖК, региональный сегмент и материалы по рискам перед заявкой."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <ActionLink href="/novostroyki/" variant="outline">Все новостройки</ActionLink>
          <ActionLink href="/investicionnaya-nedvizhimost/" variant="outline">Сравнить рынки</ActionLink>
          <ActionLink href="/analitika/" variant="outline">Аналитика</ActionLink>
        </div>
      </SectionShell>

      <SectionShell rhythm="sm">
        <LeadFormSection title={`Проверить проекты ${developer.title}`} />
      </SectionShell>
    </main>
  );
}
