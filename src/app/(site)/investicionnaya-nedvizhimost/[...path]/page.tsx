import { notFound } from "next/navigation";

import { SectionShell } from "@/components/layout/section-shell";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { PageHero } from "@/components/marketing/page-hero";
import { RiskBlock } from "@/components/marketing/risk-block";
import { ActionLink } from "@/components/navigation/action-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getPublicRegionByPath,
  getPublicRegionRelatedLinks,
  getPublicRegionStaticParams,
  isGenericPublicRegion,
  listPublicHubRegions,
  listPublicRegions,
} from "@/core/data-access/public";
import {
  getEditorialPreviewRegionByPath,
  getEditorialPreviewRegionRelatedLinks,
  getEditorialPreviewRegionStaticParams,
  isEditorialPreviewRegion,
} from "@/core/data-access/preview/editorial-preview";
import { composeRegionPathFromSlugs } from "@/content/regions/region-path-policy";
import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";

type RegionRoutePageProps = {
  params: Promise<{ path?: string[] }>;
};

async function getRegionPageModel(params: RegionRoutePageProps["params"]) {
  const { path = [] } = await params;
  let href: string;
  try {
    href = composeRegionPathFromSlugs(path);
  } catch {
    notFound();
  }
  const region = getEditorialPreviewRegionByPath(href) ?? await getPublicRegionByPath(href);
  return { href, region };
}

export async function generateStaticParams() {
  const previewParams = getEditorialPreviewRegionStaticParams();
  const publicParams = previewParams.length > 0
    ? []
    : getPublicRegionStaticParams(await listPublicHubRegions());
  const params = [...publicParams, ...previewParams];
  return [...new Map(params.map((item) => [item.path.join("/"), item])).values()];
}

export async function generateMetadata({ params }: RegionRoutePageProps) {
  const { region } = await getRegionPageModel(params);
  if (!isGenericPublicRegion(region) && !isEditorialPreviewRegion(region)) return {};
  return getStaticMetadata(region.pageId);
}

export default async function RegionRoutePage({ params }: RegionRoutePageProps) {
  const { region } = await getRegionPageModel(params);
  if (!isGenericPublicRegion(region) && !isEditorialPreviewRegion(region)) notFound();

  const seo = getSeoEntry(region.pageId);
  const relatedLinks = isEditorialPreviewRegion(region)
    ? getEditorialPreviewRegionRelatedLinks(region)
    : getPublicRegionRelatedLinks(region, await listPublicRegions());

  return (
    <main>
      <PageHero
        eyebrow={region.kind === "segment" ? "Инвестиционный сегмент" : "Региональный инвестиционный хаб"}
        title={seo.h1}
        lead={region.lead}
        primaryCta={{ href: "/podbor/", label: "Получить подбор" }}
        secondaryCta={{ href: "/investicionnaya-nedvizhimost/", label: "Сравнить регионы" }}
        image={region.image}
        proof="Путь страницы собирается из reserved namespace, slug и parent relation в CMS."
      />

      <SectionShell
        eyebrow="Инвестиционная рамка"
        title="Что важно проверить до выбора проекта"
        lead="На этом этапе страница остаётся безопасным черновым каркасом: без обещаний доходности, без неподтверждённых объектов и без тонких URL."
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
                Следующий слой страницы: районы, форматы, бюджет входа, управление, риски,
                проекты и сценарии выхода — только на подтверждённых данных.
              </p>
            </CardContent>
          </Card>
        </div>
      </SectionShell>

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

      <SectionShell rhythm="sm">
        <LeadFormSection title={`Получить разбор: ${region.title}`} />
      </SectionShell>
    </main>
  );
}
