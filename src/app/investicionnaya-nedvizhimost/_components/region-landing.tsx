import { notFound } from "next/navigation";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { RiskBlock } from "@/components/marketing/risk-block";
import { contentService } from "@/content/service";
import { getSeoEntry } from "@/seo/registry";

type RegionLandingProps = {
  pageId: string;
  regionSlug: string;
  primaryCta: string;
  secondaryCta: string;
};

export async function RegionLanding({ pageId, primaryCta, regionSlug, secondaryCta }: RegionLandingProps) {
  const seo = getSeoEntry(pageId);
  const region = await contentService.getRegion(regionSlug);

  if (!region) {
    notFound();
  }

  const media = await contentService.getMediaAsset(region.heroMediaId);

  return (
    <main>
      <PageHero
        eyebrow="Региональный инвестиционный хаб"
        title={seo.h1}
        lead={region.lead}
        primaryCta={{ href: "/podbor/", label: primaryCta }}
        secondaryCta={{ href: "/investicionnaya-nedvizhimost/", label: secondaryCta }}
        image={{
          alt: media?.alt ?? region.title,
          height: media?.height ?? 1524,
          src: media?.src ?? "/images/og/default.webp",
          width: media?.width ?? 2560,
        }}
        proof={`Основной SEO-запрос: ${seo.primaryQuery}. Публикация в индекс — только после content gate.`}
      />

      <SectionShell
        eyebrow="Первый экран"
        title="Что важно проверить до выбора проекта"
        lead="Эта страница сейчас собирает крепкий первый экран и инвестиционную рамку. Полный SEO-текст, shortlist и паспорта добавляются после подтверждения фактов."
      >
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <RiskBlock title="Ключевое ограничение" text={region.riskSummary} />
          <Card className="rounded-feature bg-card">
            <CardHeader>
              <CardTitle className="text-card-title">Инвестиционный тезис</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 text-body text-muted-foreground">
              <p>{region.investmentThesis}</p>
              <p>
                Следующий слой страницы: районы, форматы, бюджет входа, управление, риски,
                проекты и сценарии выхода — только на подтверждённых данных.
              </p>
            </CardContent>
          </Card>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <LeadFormSection title={`Получить разбор: ${region.title}`} />
      </SectionShell>
    </main>
  );
}
