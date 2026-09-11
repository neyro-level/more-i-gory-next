import type { Metadata } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";
import { cn } from "@/lib/utils";
import { siteUrl } from "@/seo/metadata";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

const montserrat = Montserrat({
  display: "swap",
  subsets: ["cyrillic"],
  variable: "--font-sans",
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
  return (
    <html lang="ru" className={cn("font-sans", montserrat.variable)}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
