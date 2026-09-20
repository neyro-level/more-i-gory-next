import { z } from "zod";

export const siteNavigationLinkSchema = z.object({
  href: z.string().min(1),
  label: z.string().min(1),
  nofollow: z.boolean(),
  openInNewTab: z.boolean(),
});

export const siteChromeSchema = z.object({
  brand: z.object({
    shortName: z.string().min(1),
    siteName: z.string().min(1),
    tagline: z.string().min(1),
  }),
  legalNotice: z.string().min(1),
  navigation: z.object({
    footer: z.array(siteNavigationLinkSchema),
    header: z.array(siteNavigationLinkSchema),
    headerCta: siteNavigationLinkSchema,
    legal: z.array(siteNavigationLinkSchema),
  }),
});

export type SiteNavigationLink = z.infer<typeof siteNavigationLinkSchema>;
export type SiteChrome = z.infer<typeof siteChromeSchema>;
export type EditorialPreviewNavigationGroup = Readonly<{
  label: string;
  links: readonly SiteNavigationLink[];
}>;
