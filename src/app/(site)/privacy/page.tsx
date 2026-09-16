import type { Metadata } from "next";
import { buildPageMetadata, getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { SectionShell } from "@/components/layout/section-shell";
import { Card, CardContent } from "@/components/ui/card";
import { CmsPage } from "@/components/page-blocks/cms-page";
import { getCmsPageByPath } from "@/core/data-access/public";

const pagePath = "/privacy/";

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

  return getStaticMetadata("PAGE-022");
}

export default async function PrivacyPage() {
  const page = await getCmsPageByPath(pagePath);
  if (page) return <CmsPage page={page} />;

  const seo = getSeoEntry("PAGE-022");

  return (
    <main>
      <SectionShell headingLevel={1} eyebrow="Юридический документ" title={seo.h1} lead="Юридический текст не опубликован до согласования. Эта страница закрыта от индексации и не заменяет политику конфиденциальности.">
        <Card className="rounded-large bg-card">
          <CardContent className="p-6 text-body-sm text-muted-foreground md:p-8">
            Human gate: оператор данных, фактические поля формы, цели обработки, системы хранения, аналитика, срок хранения и контакты для обращений.
          </CardContent>
        </Card>
      </SectionShell>
    </main>
  );
}
