import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { fallbackSiteChrome, getSiteChromeOrFallback } from "@/core/data-access/public";
import { getSiteUrl } from "@/seo/metadata";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getEditorialPreviewNavigation, resolveEditorialPreviewMode } from "@/core/data-access/preview/editorial-preview";
import { montserrat } from "@/app/fonts";
import { siteStructuredData } from "@/seo/structured-data";

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: "Недвижимость для инвестиций — курортные проекты | Море и Горы",
      template: "%s | Море и Горы",
    },
    icons: { icon: "/favicon.svg" },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const previewNavigation = await getEditorialPreviewNavigation();
  const siteChromePromise = previewNavigation.length > 0 && resolveEditorialPreviewMode() === "seed"
    ? Promise.resolve(fallbackSiteChrome)
    : getSiteChromeOrFallback();

  return (
    <html lang="ru" className={cn("font-sans", montserrat.variable)}>
      <body>
        <a
          className="sr-only z-50 rounded-control bg-card px-4 py-3 text-label font-semibold text-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          href="#main"
        >
          Перейти к содержимому
        </a>
        {siteStructuredData().map((entry) => (
          <script
            dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
            key={entry["@id"]}
            type="application/ld+json"
          />
        ))}
        <SiteChromeLayout previewNavigation={previewNavigation} siteChromePromise={siteChromePromise}>{children}</SiteChromeLayout>
      </body>
    </html>
  );
}

async function SiteChromeLayout({
  children,
  previewNavigation,
  siteChromePromise,
}: Readonly<{
  children: React.ReactNode;
  previewNavigation: Awaited<ReturnType<typeof getEditorialPreviewNavigation>>;
  siteChromePromise: ReturnType<typeof getSiteChromeOrFallback>;
}>) {
  const siteChrome = await siteChromePromise;

  return (
    <>
      <SiteHeader
        brand={siteChrome.brand}
        cta={siteChrome.navigation.headerCta}
        navigation={siteChrome.navigation.header}
        previewNavigation={previewNavigation}
      />
        {children}
      <SiteFooter brand={siteChrome.brand} legal={siteChrome.navigation.legal} legalNotice={siteChrome.legalNotice} navigation={siteChrome.navigation.footer} />
    </>
  );
}
