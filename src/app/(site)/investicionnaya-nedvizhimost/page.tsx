import { ActionLink } from "@/components/navigation/action-link";
import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { RegionCard } from "@/components/marketing/region-card";
import { ProofBlock } from "@/components/marketing/proof-block";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { listPublicHubRegions } from "@/core/data-access/public";
import { listEditorialPreviewRegions } from "@/core/data-access/preview/editorial-preview";
import { analyticsDataAttributes } from "@/core/analytics/dimensions";

export const metadata = getStaticMetadata("PAGE-002");

export default async function FederalInvestmentHubPage() {
  const seo = getSeoEntry("PAGE-002");
  const previewRegions = await listEditorialPreviewRegions();
  const regions = previewRegions.length > 0 ? previewRegions : await listPublicHubRegions();

  return (
    <main {...analyticsDataAttributes({ page_key: "federal_hub", source_surface: "federal_hub" })}>
      <PageHero
        eyebrow="Федеральный инвестиционный хаб"
        title={seo.h1}
        lead="Сравниваем Сочи, Крым, Архыз и Алтай по одной логике: бюджет входа, спрос, управление, риски, ограничения и сценарий выхода."
        primaryCta={{ href: "/podbor/", label: "Получить разбор задачи" }}
        secondaryCta={{ href: "/obekty/", label: "Посмотреть объекты" }}
        image={{
          alt: "Панорамный вид курортного побережья для сайта Море и Горы",
          height: 1524,
          src: "/images/og/default.webp",
          width: 2560,
        }}
        proof="Регион не выбирается по красивому фото: сначала задача капитала, затем рынок, проект, экономика и риски."
      />

      <SectionShell
        eyebrow="Сравнение рынков"
        title="Карта регионов и сегментов для проверки"
        lead={previewRegions.length > 0
          ? "В техническом preview показываем весь запланированный regions-контур, чтобы владелец видел страницы и мог последовательно их наполнить. Все черновики остаются noindex."
          : "Показываем только опубликованные направления, прошедшие content gate."}
        actions={
          <ActionLink href="/metodika/" variant="outline">
            Как мы сравниваем
          </ActionLink>
        }
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {regions.map((region) => (
            <RegionCard
              key={region.id}
              href={region.path}
              image={region.image}
              risk={region.riskSummary}
              thesis={region.investmentThesis}
              title={region.title}
            />
          ))}
        </div>
      </SectionShell>

      <SectionShell rhythm="sm">
        <ProofBlock
          title="Что будет в полном хабе после content gate"
          items={[
            {
              title: "Единая методология",
              text: "Бюджет, сезонность, управление, юридические ограничения и ликвидность сравниваются в одинаковой структуре.",
            },
            {
              title: "Реальные паспорта",
              text: "Проекты попадают в блоки только после проверки фактов, источников и даты актуальности.",
            },
            {
              title: "Внутренняя перелинковка",
              text: "Хаб связывает регионы, объекты, методику и статьи, не создавая лишних тонких URL.",
            },
          ]}
        />
      </SectionShell>

      <SectionShell rhythm="sm">
        <LeadFormSection title="Сравнить регионы под вашу задачу" />
      </SectionShell>
    </main>
  );
}
