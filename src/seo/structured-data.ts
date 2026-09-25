import { getSiteUrl } from "./site-url.ts";
import { LEGAL_DETAILS } from "../project/legal-details.ts";

export function siteStructuredData(source: NodeJS.ProcessEnv = process.env) {
  const siteUrl = getSiteUrl(source);
  return [
    {
      "@context": "https://schema.org",
      "@id": `${siteUrl}/#organization`,
      "@type": "Organization",
      email: LEGAL_DETAILS.email,
      legalName: LEGAL_DETAILS.legalName,
      name: LEGAL_DETAILS.publicName,
      telephone: LEGAL_DETAILS.telephone,
      url: siteUrl,
    },
    {
      "@context": "https://schema.org",
      "@id": `${siteUrl}/#website`,
      "@type": "WebSite",
      inLanguage: "ru-RU",
      name: LEGAL_DETAILS.publicName,
      publisher: { "@id": `${siteUrl}/#organization` },
      url: siteUrl,
    },
  ] as const;
}

export function articleStructuredData(article: Readonly<{
  description: string;
  path: string;
  status: "draft" | "review" | "published" | "archived";
  title: string;
}>) {
  if (article.status !== "published") return null;
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    description: article.description,
    headline: article.title.replace(/\s*\|\s*Море и Горы$/u, ""),
    inLanguage: "ru-RU",
    mainEntityOfPage: new URL(article.path, siteUrl).toString(),
    publisher: { "@id": `${siteUrl}/#organization` },
  } as const;
}
