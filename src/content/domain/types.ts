export const contentStatuses = ["draft", "review", "published", "archived"] as const;

export type ContentStatus = (typeof contentStatuses)[number];

export type MediaAssetKind = "region" | "project" | "og" | "ui";

export type MediaAssetDTO = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  decorative: boolean;
  kind: MediaAssetKind;
  credit?: string;
};

export type SourceDTO = {
  id: string;
  title: string;
  url?: string;
  publisher?: string;
  accessedAt?: string;
};

export type RegionDTO = {
  id: string;
  slug: string;
  pageId: string;
  path: string;
  status: ContentStatus;
  title: string;
  primaryQuery: string;
  heroMediaId: string;
  lead: string;
  investmentThesis: string;
  riskSummary: string;
  parentPageId?: string;
  childPageIds: string[];
};

export type ProjectDTO = {
  id: string;
  slug: string;
  regionId: string;
  status: ContentStatus;
  title: string;
  path: string;
  coverMediaId: string;
  verdict: string;
  facts: string[];
  budgetNote: string;
  riskSummary: string;
  sourceIds: string[];
  verifiedAt?: string;
};

export type ArticleDTO = {
  id: string;
  slug: string;
  status: ContentStatus;
  title: string;
  description: string;
  primaryQuery: string;
  secondaryQueries: string[];
  targetPageId: string;
  relatedRegionIds: string[];
  relatedProjectIds: string[];
  sourceIds: string[];
  path: string;
  publishedAt?: string;
  reviewedAt?: string;
};

export type PageContent = {
  id: string;
  path: string;
  status: ContentStatus;
  title: string;
  lead: string;
  ctaPrimary: string;
  ctaSecondary?: string;
  mediaId?: string;
};

export type LandingPageDTO = {
  pageId: string;
  status: ContentStatus;
  eyebrow: string;
  lead: string;
  investmentThesis: string;
  riskSummary: string;
  primaryCta: string;
  secondaryCta: string;
  parentLinks: Array<{
    href: string;
    label: string;
  }>;
  childLinks: Array<{
    href: string;
    label: string;
  }>;
  mediaId: string;
};

export type PersonDTO = {
  id: string;
  name: string;
  role: string;
  status: ContentStatus;
  bio?: string;
};
