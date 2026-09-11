import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { contentService } from "@/content/service";
import { ArticleCard } from "@/components/marketing/article-card";

export const metadata = getStaticMetadata("PAGE-016");

export default async function AnalyticsPage() {
  const seo = getSeoEntry("PAGE-016");
  const articles = await contentService.listArticles();

  return (
    <main>
      <PageHero
        eyebrow="Аналитика и разборы"
        title={seo.h1}
        lead="Здесь собираются материалы, которые помогают понять экономику проектов, риски, операторов, ликвидность и различия курортных рынков."
        primaryCta={{ href: "/podbor/", label: "Задать инвестиционный вопрос" }}
        secondaryCta={{ href: "/metodika/", label: "Смотреть методику" }}
        image={{
          alt: "Панорамный вид курортного побережья для сайта Море и Горы",
          height: 1524,
          src: "/images/og/default.webp",
          width: 2560,
        }}
        proof="Материалы стартуют как draft/noindex и открываются для индекса после полного текста, источников и редакционной проверки."
      />

      <SectionShell
        eyebrow="Контентное ядро"
        title="Первые темы для SEO и продаж"
        lead="Каждая статья отвечает на отдельный информационно-коммерческий вопрос и должна вести к региону, объекту или подбору."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              description={article.description}
              href={article.path}
              status={`${article.status} / noindex до gate`}
              title={article.title}
            />
          ))}
        </div>
      </SectionShell>
    </main>
  );
}
