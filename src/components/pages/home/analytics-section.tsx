import { SectionShell } from "@/components/layout/section-shell";
import { ArticleCard } from "@/components/marketing/article-card";
import type { HomeArticleDTO } from "@/core/dto";

export function AnalyticsSection({ articles: visibleArticles }: Readonly<{ articles: HomeArticleDTO[] }>) {
  if (visibleArticles.length === 0) return null;

  return (
    <SectionShell
      className="bg-card"
      eyebrow="Аналитика"
      lead="Сравниваем регионы, разбираем расчёт доходности, операторов, ограничения и ликвидность."
      title="Материалы для обоснованного инвестиционного решения"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {visibleArticles.slice(0, 3).map((article) => (
          <ArticleCard description={article.description} href={article.href} key={article.id} title={article.title} />
        ))}
      </div>
    </SectionShell>
  );
}
