import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { buildMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { RiskBlock } from "@/components/marketing/risk-block";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { articles, getArticleBySlug } from "@/content/articles/articles";

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

  return buildMetadata({
    ...getSeoEntry("PAGE-017"),
    canonical: article.path,
    description: article.description,
    h1: article.title.replace(" | Море и Горы", ""),
    primaryQuery: article.primaryQuery,
    secondaryQueries: article.secondaryQueries,
    title: article.title,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article || article.status === "archived") {
    notFound();
  }

  return (
    <main>
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

      <SectionShell className="pt-0">
        <LeadFormSection title="Задать вопрос по теме статьи" />
      </SectionShell>
    </main>
  );
}
