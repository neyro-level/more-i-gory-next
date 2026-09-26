import { PageHero } from "@/components/marketing/page-hero";
import type { HomePageDTO } from "@/core/dto";
import { AnalyticsSection } from "./analytics-section";
import { CapitalTasksSection } from "./capital-tasks-section";
import { DecisionSupportSection } from "./decision-support-section";
import { MethodologySection } from "./methodology-section";
import { ProjectAdmissionSection } from "./project-admission-section";
import { ProjectPassportSection } from "./project-passport-section";
import { RegionsSection } from "./regions-section";
import { ResponsibilitySection } from "./responsibility-section";

export function HomePageContent({ articles, regions }: Readonly<HomePageDTO>) {
  return (
    <>
      <PageHero
        eyebrow="Инвестиционное бюро курортной недвижимости"
        image={{ alt: "Панорамный вид курортного побережья для сайта Море и Горы", height: 1524, src: "/images/og/default.webp", width: 2560 }}
        lead="Сравниваем Сочи, Крым, Архыз и Алтай, чтобы до сделки было видно: зачем заходить в проект, где ограничения и какой сценарий выхода реалистичен."
        primaryCta={{ href: "/podbor/", label: "Получить инвестиционный разбор" }}
        proof="Без обещаний гарантированной доходности: сначала факты, риски, экономика и сценарий выхода."
        secondaryCta={{ href: "/investicionnaya-nedvizhimost/", label: "Сравнить регионы" }}
        title="Курортная недвижимость для инвестиций — с понятной экономикой и рисками"
      />
      <CapitalTasksSection />
      <DecisionSupportSection />
      <MethodologySection />
      <RegionsSection regions={regions} />
      <ProjectAdmissionSection />
      <ProjectPassportSection />
      <AnalyticsSection articles={articles} />
      <ResponsibilitySection />
    </>
  );
}
