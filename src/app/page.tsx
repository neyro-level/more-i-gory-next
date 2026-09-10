import { getStaticMetadata } from "@/seo/metadata";
import { PageHero } from "@/components/marketing/page-hero";

export const metadata = getStaticMetadata("PAGE-001");

export default function HomePage() {
  return (
    <main>
      <PageHero
        eyebrow="Инвестиционное бюро курортной недвижимости"
        title="Курортная недвижимость для инвестиций — с понятной экономикой и рисками"
        lead="Сравниваем Сочи, Крым, Архыз и Алтай, чтобы до сделки было видно: зачем заходить в проект, где ограничения и какой сценарий выхода реалистичен."
        primaryCta={{ href: "/podbor/", label: "Получить инвестиционный разбор" }}
        secondaryCta={{ href: "/investicionnaya-nedvizhimost/", label: "Сравнить регионы" }}
        image={{
          alt: "Панорамный вид курортного побережья для сайта Море и Горы",
          height: 1524,
          src: "/images/og/default.webp",
          width: 2560,
        }}
        proof="Без обещаний гарантированной доходности: сначала факты, риски, экономика и сценарий выхода."
      />
    </main>
  );
}
