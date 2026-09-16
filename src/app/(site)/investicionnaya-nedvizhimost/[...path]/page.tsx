import { notFound } from "next/navigation";

import { SectionShell } from "@/components/layout/section-shell";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { PageHero } from "@/components/marketing/page-hero";
import { RiskBlock } from "@/components/marketing/risk-block";
import { ActionLink } from "@/components/navigation/action-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMediaAsset } from "@/content/media/media-assets";
import { findRegionRouteBySegments, getRegionRelatedLinks, getRegionRoutePlan } from "@/content/regions/region-route-plan";
import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";

type RegionRoutePageProps = {
  params: Promise<{ path?: string[] }>;
};

async function getRouteEntry(params: RegionRoutePageProps["params"]) {
  const { path = [] } = await params;
  return findRegionRouteBySegments(path);
}

export function generateStaticParams() {
  return getRegionRoutePlan()
    .filter((entry) => entry.key !== "sochi")
    .map((entry) => ({
      path: entry.path
        .replace(/^\/investicionnaya-nedvizhimost\//, "")
        .replace(/\/$/, "")
        .split("/"),
    }));
}

export async function generateMetadata({ params }: RegionRoutePageProps) {
  const entry = await getRouteEntry(params);
  if (!entry) return {};

  return getStaticMetadata(entry.pageId);
}

export default async function RegionRoutePage({ params }: RegionRoutePageProps) {
  const entry = await getRouteEntry(params);
  if (!entry || entry.status === "stub") notFound();

  const seo = getSeoEntry(entry.pageId);
  const media = getMediaAsset(entry.mediaSourceLabel);
  const relatedLinks = getRegionRelatedLinks(entry);

  return (
    <main>
      <PageHero
        eyebrow={entry.kind === "segment" ? "Инвестиционный сегмент" : "Региональный инвестиционный хаб"}
        title={seo.h1}
        lead={entry.lead}
        primaryCta={{ href: "/podbor/", label: "Получить подбор" }}
        secondaryCta={{ href: "/investicionnaya-nedvizhimost/", label: "Сравнить регионы" }}
        image={{
          alt: media?.alt ?? entry.title,
          height: media?.height ?? 1524,
          src: media?.src ?? "/images/og/default.webp",
          width: media?.width ?? 2560,
        }}
        proof="Публикация в индекс — только после content gate. Путь страницы вычисляется из slug и parent chain."
      />

      <SectionShell
        eyebrow="Инвестиционная рамка"
        title="Что важно проверить до выбора проекта"
        lead="На этом этапе страница остаётся безопасным черновым каркасом: без обещаний доходности, без неподтверждённых объектов и без тонких URL."
      >
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <RiskBlock title="Ключевое ограничение" text={entry.riskSummary} />
          <Card className="rounded-large bg-card">
            <CardHeader>
              <CardTitle className="text-h3">Инвестиционный тезис</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 text-body text-muted-foreground">
              <p>{entry.investmentThesis}</p>
              <p>
                Следующий слой страницы: районы, форматы, бюджет входа, управление, риски,
                проекты и сценарии выхода — только на подтверждённых данных.
              </p>
            </CardContent>
          </Card>
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {relatedLinks.map((link) => (
            <Card key={`${link.relation}-${link.href}`} className="rounded-card bg-card">
              <CardHeader>
                <CardTitle className="text-h3">{link.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <ActionLink href={link.href} variant="outline">
                  Перейти
                </ActionLink>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <LeadFormSection title={`Получить разбор: ${entry.title}`} />
      </SectionShell>
    </main>
  );
}
