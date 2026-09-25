import "server-only";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { SectionShell } from "@/components/layout/section-shell";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { PageHero } from "@/components/marketing/page-hero";
import { RiskBlock } from "@/components/marketing/risk-block";
import { CityMarketHub } from "@/components/templates/city-market-hub";
import { CrimeaRegionHub } from "@/components/templates/crimea-region-hub";
import { ActionLink } from "@/components/navigation/action-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPublicRegionRelatedLinks,
  getRoutableRegionByPath,
  listPublishedManualProperties,
  listPublicRegions,
  type PublicRegionDTO,
} from "@/core/data-access/public";
import {
  getEditorialPreviewRegionByPath,
  getEditorialPreviewRegionRelatedLinks,
  isEditorialPreviewRegion,
  listEditorialPreviewRegions,
} from "@/core/data-access/preview/editorial-preview";
import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { isRegionPublicRoute } from "@/core/regions/activation";

const cityHubLabels: Readonly<Record<string, Readonly<{ genitive: string; prepositional: string }>>> = {
  "/krym/evpatoriya/": { genitive: "Евпатории", prepositional: "Евпатории" },
  "/krym/sevastopol/": { genitive: "Севастополя", prepositional: "Севастополе" },
  "/krym/yalta/": { genitive: "Ялты", prepositional: "Ялте" },
};

export const getRegionRouteModel = cache(async (path: string): Promise<PublicRegionDTO | null> =>
  getEditorialPreviewRegionByPath(path) ?? await getRoutableRegionByPath(path));

export function isVisibleRegionRoute(region: PublicRegionDTO | null): region is PublicRegionDTO {
  return region !== null
    && (region.id.startsWith("editorial-preview:") || isRegionPublicRoute(region.status));
}

export async function getRegionRouteMetadata(path: string): Promise<Metadata> {
  const region = await getRegionRouteModel(path);
  if (!isVisibleRegionRoute(region)) return {};
  return getStaticMetadata(region.pageId, { technical: region.status !== "published" });
}

export async function RegionRoutePage({ path }: Readonly<{ path: string }>) {
  const region = await getRegionRouteModel(path);
  if (!isVisibleRegionRoute(region)) notFound();

  const seo = getSeoEntry(region.pageId);
  const isPreview = isEditorialPreviewRegion(region);
  const regions = isPreview ? listEditorialPreviewRegions() : await listPublicRegions();

  if (region.path === "/krym/" && region.kind === "region") {
    const projects = isPreview ? [] : await listPublishedManualProperties();
    return <CrimeaRegionHub projects={projects} region={region} regions={regions} title={seo.h1} />;
  }

  const cityLabels = region.pageKey === "CITY" ? cityHubLabels[region.path] : undefined;
  if (cityLabels) {
    const projects = isPreview ? [] : await listPublishedManualProperties();
    return (
      <CityMarketHub
        city={region}
        cityNameGenitive={cityLabels.genitive}
        cityNamePrepositional={cityLabels.prepositional}
        projects={projects}
        regions={regions}
        title={seo.h1}
      />
    );
  }

  const relatedLinks = isPreview
    ? getEditorialPreviewRegionRelatedLinks(region)
    : getPublicRegionRelatedLinks(region, regions);

  return (
    <main>
      <PageHero
        eyebrow={region.kind === "segment" ? "Инвестиционный сегмент" : "Региональный инвестиционный хаб"}
        title={seo.h1}
        lead={region.lead}
        primaryCta={{ href: "/podbor/", label: "Получить подбор" }}
        secondaryCta={{ href: "/investicionnaya-nedvizhimost/", label: "Сравнить регионы" }}
        image={region.image}
        proof="Путь страницы собирается из slug и parent relation в CMS по единому URL-контракту."
      />

      <SectionShell
        eyebrow="Инвестиционная рамка"
        title="Что важно проверить до выбора проекта"
        lead="Страница публикует только разрешённое состояние региона: без обещаний доходности, неподтверждённых объектов и технических URL."
      >
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <RiskBlock title="Ключевое ограничение" text={region.riskSummary} />
          <Card className="rounded-large bg-card">
            <CardHeader>
              <CardTitle className="text-h3">Инвестиционный тезис</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5 text-body text-muted-foreground">
              <p>{region.investmentThesis}</p>
              <p>
                Районы, форматы, бюджет входа, управление, риски, проекты и сценарии
                выхода добавляются только на подтверждённых данных.
              </p>
            </CardContent>
          </Card>
        </div>
      </SectionShell>

      {relatedLinks.length > 0 ? (
        <SectionShell rhythm="sm">
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
      ) : null}

      <SectionShell rhythm="sm">
        <LeadFormSection title={`Получить разбор: ${region.title}`} />
      </SectionShell>
    </main>
  );
}
