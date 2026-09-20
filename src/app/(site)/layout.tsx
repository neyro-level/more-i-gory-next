import type { Metadata } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import { fallbackSiteChrome, getSiteChrome } from "@/core/data-access/public";
import { siteUrl } from "@/seo/metadata";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getEditorialPreviewNavigation } from "@/core/data-access/preview/editorial-preview";

const montserrat = Montserrat({
  display: "swap",
  fallback: ["Arial", "sans-serif"],
  subsets: ["cyrillic"],
  style: "normal",
  variable: "--font-montserrat",
  weight: "variable",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Недвижимость для инвестиций — курортные проекты | Море и Горы",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const previewNavigation = getEditorialPreviewNavigation();
  const siteChromePromise = previewNavigation.length > 0
    ? Promise.resolve(fallbackSiteChrome)
    : getSiteChrome();

  return (
    <html lang="ru" className={cn("font-sans", montserrat.variable)}>
      <body>
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
  previewNavigation: ReturnType<typeof getEditorialPreviewNavigation>;
  siteChromePromise: ReturnType<typeof getSiteChrome>;
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
