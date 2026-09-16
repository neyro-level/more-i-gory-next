import { PageHero } from "@/components/marketing/page-hero";
import {
  AnalyticsSection,
  CapitalTasksSection,
  DecisionSupportSection,
  MethodologySection,
  ProjectAdmissionSection,
  ProjectPassportSection,
  RegionsSection,
  ResponsibilitySection,
  type HomeRegionCardModel,
} from "@/components/marketing/home-sections";
import { contentService } from "@/content/service";
import { getRegionHubPlan } from "@/content/regions/region-route-plan";
import { getStaticMetadata } from "@/seo/metadata";

export const metadata = getStaticMetadata("PAGE-001");

export default async function HomePage() {
  const regions = getRegionHubPlan().filter((region) => region.kind === "region");
  const regionCards: HomeRegionCardModel[] = await Promise.all(
    regions.map(async (region) => {
      const media = await contentService.getMediaAsset(region.mediaSourceLabel);
      return {
        href: region.path,
        id: region.key,
        image: {
          alt: media?.alt ?? region.title,
          height: media?.height ?? 1524,
          src: media?.src ?? "/images/og/default.webp",
          width: media?.width ?? 2560,
        },
        risk: region.riskSummary,
        thesis: region.investmentThesis,
        title: region.title,
      };
    }),
  );

  return (
    <main>
      <PageHero
        eyebrow="Инвестиционное бюро курортной недвижимости"
        title="Курортная недвижимость для инвестиций — с понятной экономикой и рисками"
        lead="Сравниваем Сочи, Крым, Архыз и Алтай, чтобы до сделки было видно: зачем заходить в проект, где ограничения и какой сценарий выхода реалистичен."
        primaryCta={{ href: "/podbor/", label: "Получить инвестиционный разбор" }}
        secondaryCta={{ href: "/investicionnaya-nedvizhimost/", label: "Сравнить регионы" }}
        image={{ alt: "Панорамный вид курортного побережья для сайта Море и Горы", height: 1524, src: "/images/og/default.webp", width: 2560 }}
        proof="Без обещаний гарантированной доходности: сначала факты, риски, экономика и сценарий выхода."
      />
      <CapitalTasksSection />
      <DecisionSupportSection />
      <MethodologySection />
      <RegionsSection regions={regionCards} />
      <ProjectAdmissionSection />
      <ProjectPassportSection />
      <AnalyticsSection />
      <ResponsibilitySection />
    </main>
  );
}
