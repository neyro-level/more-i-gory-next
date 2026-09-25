import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata, buildPageMetadata } from "@/seo/metadata";
import { sourceFromArticle } from "@/seo/page-metadata";
import { getSeoEntry } from "@/seo/registry";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { RiskBlock } from "@/components/marketing/risk-block";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { ActionLink } from "@/components/navigation/action-link";
import { articles, getArticleBySlug } from "@/content/articles/articles";
import { resolveRuntimeContour } from "@/project/runtime-contour";
import { analyticsDataAttributes } from "@/core/analytics/dimensions";
import { articleStructuredData } from "@/seo/structured-data";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return articles.filter((article) => article.status !== "archived").map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return buildMetadata(getSeoEntry("PAGE-017"));
  }

  return buildPageMetadata(sourceFromArticle({
    canonical: article.path,
    contentGate: "missing",
    description: article.description,
    registry: getSeoEntry("PAGE-017"),
    runtimeContour: resolveRuntimeContour(),
    status: article.status,
    title: article.title,
  }));
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article || article.status === "archived") {
    notFound();
  }
  const structuredData = articleStructuredData(article);

  return (
    <main {...analyticsDataAttributes({ page_key: "article", source_surface: "article" })}>
      {structuredData ? (
        <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />
      ) : null}
      <PageHero
        eyebrow="Аналитический материал"
        title={article.title.replace(" | Море и Горы", "")}
        lead={article.description}
        primaryCta={{ href: "/podbor/", label: "Разобрать задачу" }}
        secondaryCta={{ href: "/analitika/", label: "Все материалы" }}
        image={{
          alt: "Панорамный вид курортного побережья для сайта Море и Горы",
          height: 1524,
          src: "/images/og/default.webp",
          width: 2560,
        }}
        proof={`Primary query: ${article.primaryQuery}. Статус: ${article.status}; noindex до editorial gate.`}
      />

      <SectionShell
        eyebrow="Первый экран статьи"
        title="Что будет раскрыто в полной версии"
        lead="Полный текст появится после источников и редакционной проверки. Сейчас страница фиксирует интент, коммерческую связку и первый смысловой экран."
      >
        <RiskBlock
          title="Почему статья пока не в индексе"
          text="Без полного текста, источников и проверки экспертных утверждений статья остаётся draft/noindex и не попадает в sitemap."
        />
      </SectionShell>

      <SectionShell
        rhythm="sm"
        eyebrow="Коммерческая связка"
        title="Перейти от материала к проверке рынка"
        lead="Материал ведёт к одному основному коммерческому маршруту и к проверочной методике, не ссылаясь на скрытые региональные страницы."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <ActionLink href="/novostroyki/" variant="outline">Каталог новостроек</ActionLink>
          <ActionLink href="/metodika/" variant="outline">Методика</ActionLink>
          <ActionLink href="/podbor/" variant="outline">Подбор</ActionLink>
        </div>
      </SectionShell>

      <SectionShell rhythm="sm">
        <LeadFormSection title="Задать вопрос по теме статьи" />
      </SectionShell>
    </main>
  );
}
