import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { buildPageMetadata } from "@/seo/metadata";

export const metadata = buildPageMetadata({
  canonical: "/investicionnaya-nedvizhimost/sochi/",
  description: "Регион Сочи находится в проработке. Можно оставить задачу для персонального инвестиционного разбора.",
  robots: "noindex-follow",
  title: "Недвижимость Сочи — регион в проработке | Море и Горы",
});

export default function SochiPage() {
  return (
    <main id="main">
      <PageHero
        eyebrow="Региональная заглушка"
        title="Недвижимость Сочи — регион в проработке"
        lead="Раздел о Сочи находится в проработке. Мы добавим его в основную навигацию после проверки структуры и содержания."
        primaryCta={{ href: "/podbor/", label: "Оставить задачу на подбор" }}
        secondaryCta={{ href: "/investicionnaya-nedvizhimost/", label: "Сравнить регионы" }}
        image={{
          alt: "Побережье Сочи как регион в проработке",
          height: 1877,
          src: "/images/regions/sochi-coast.webp",
          width: 1408,
        }}
        proof="Пока раздел не готов, используйте сравнение регионов или оставьте задачу для индивидуального разбора."
      />

      <SectionShell
        eyebrow="Статус"
        title="Почему здесь заглушка"
        lead="Сочи вернётся в публичную структуру только после отдельного контентного решения, проверки фактов и понятного шаблона. Пока безопасный путь — персональный разбор задачи."
      >
        <LeadFormSection
          title="Получить персональный подбор"
          text="Опишите бюджет, горизонт и желаемый формат. Мы не будем подменять подбор неподтверждёнными страницами и вернёмся с безопасным следующим шагом."
        />
      </SectionShell>
    </main>
  );
}
