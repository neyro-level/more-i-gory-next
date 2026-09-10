import Link from "next/link";
import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { RegionCard } from "@/components/marketing/region-card";
import { ProofBlock } from "@/components/marketing/proof-block";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { contentService } from "@/content/service";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = getStaticMetadata("PAGE-002");

export default async function FederalInvestmentHubPage() {
  const seo = getSeoEntry("PAGE-002");
  const regions = await contentService.listRegions();
  const regionCards = await Promise.all(
    regions.map(async (region) => ({
      media: await contentService.getMediaAsset(region.heroMediaId),
      region,
    })),
  );

  return (
    <main>
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
        title="Четыре направления — разные причины для входа"
        lead="На старте не расширяем архитектуру без необходимости: эти рынки дают понятный костяк для SEO и будущего каталога."
        actions={
          <Link prefetch={false} href="/metodika/" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}>
            Как мы сравниваем
          </Link>
        }
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {regionCards.map(({ media, region }) => (
            <RegionCard
              key={region.id}
              href={region.path}
              image={{
                alt: media?.alt ?? region.title,
                height: media?.height ?? 1524,
                src: media?.src ?? "/images/og/default.webp",
                width: media?.width ?? 2560,
              }}
              risk={region.riskSummary}
              thesis={region.investmentThesis}
              title={region.title}
            />
          ))}
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
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

      <SectionShell className="pt-0">
        <LeadFormSection title="Сравнить регионы под вашу задачу" />
      </SectionShell>
    </main>
  );
}
