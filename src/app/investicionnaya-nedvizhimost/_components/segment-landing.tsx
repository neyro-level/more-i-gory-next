import { notFound } from "next/navigation";
import { StaticLink } from "@/components/navigation/static-link";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskBlock } from "@/components/marketing/risk-block";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { contentService } from "@/content/service";
import { getSeoEntry } from "@/seo/registry";

type SegmentLandingProps = {
  pageId: string;
};

export async function SegmentLanding({ pageId }: SegmentLandingProps) {
  const seo = getSeoEntry(pageId);
  const landing = await contentService.getLandingPage(pageId);

  if (!landing) {
    notFound();
  }

  const media = await contentService.getMediaAsset(landing.mediaId);

  return (
    <main>
      <PageHero
        eyebrow={landing.eyebrow}
        title={seo.h1}
        lead={landing.lead}
        primaryCta={{ href: "/podbor/", label: landing.primaryCta }}
        secondaryCta={{ href: landing.parentLinks[0]?.href ?? "/investicionnaya-nedvizhimost/", label: landing.secondaryCta }}
        image={{
          alt: media?.alt ?? seo.h1,
          height: media?.height ?? 1524,
          src: media?.src ?? "/images/og/default.webp",
          width: media?.width ?? 2560,
        }}
        proof={`Title и H1 закреплены под запрос: ${seo.primaryQuery}.`}
      />

      <SectionShell
        eyebrow="Инвестиционная рамка"
        title="Что решает эта страница"
        lead="На старте здесь собран первый экран и смысловой каркас. Полный SEO-текст и shortlist появятся после подтверждения фактов и проектов."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <Card className="rounded-feature bg-card">
            <CardHeader>
              <CardTitle className="text-card-title">Коммерческое сообщение</CardTitle>
            </CardHeader>
            <CardContent className="text-body text-muted-foreground">
              {landing.investmentThesis}
            </CardContent>
          </Card>
          <RiskBlock title="Ограничение и риск" text={landing.riskSummary} />
        </div>
      </SectionShell>

      <SectionShell
        className="pt-0"
        eyebrow="Перелинковка"
        title="Куда вести пользователя дальше"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[...landing.parentLinks, ...landing.childLinks].map((link) => (
            <StaticLink key={link.href} href={link.href} className="min-h-11 rounded-xl bg-card p-5 text-body font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              {link.label}
            </StaticLink>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <LeadFormSection title={landing.primaryCta} />
      </SectionShell>
    </main>
  );
}
