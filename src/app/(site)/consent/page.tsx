import type { Metadata } from "next";
import { buildPageMetadata, getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { SectionShell } from "@/components/layout/section-shell";
import { Card, CardContent } from "@/components/ui/card";
import { CmsPage } from "@/components/page-blocks/cms-page";
import { getCmsPageByPath } from "@/core/data-access/public";

const pagePath = "/consent/";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getCmsPageByPath(pagePath);
  if (page?.seo?.title && page.seo.description) {
    return buildPageMetadata({
      canonical: page.seo.canonicalOverride || page.path,
      description: page.seo.description,
      ogImagePath: page.seo.ogImagePath,
      robots: page.seo.robots,
      title: page.seo.title,
    });
  }

  return getStaticMetadata("PAGE-023");
}

export default async function ConsentPage() {
  const page = await getCmsPageByPath(pagePath);
  if (page) return <CmsPage page={page} />;

  const seo = getSeoEntry("PAGE-023");

  return (
    <main>
      <SectionShell containerSize="narrow" headingLevel={1} eyebrow="Юридический документ" title={seo.h1} lead="Текст согласия не опубликован до юридического согласования. Эта страница закрыта от индексации и не заменяет согласие пользователя.">
        <Card className="rounded-large bg-card">
          <CardContent className="p-6 text-body-sm text-muted-foreground md:p-8">
            Human gate: оператор данных, перечень данных, цели, действия с данными, срок согласия, порядок отзыва и версия согласия.
          </CardContent>
        </Card>
      </SectionShell>
    </main>
  );
}
