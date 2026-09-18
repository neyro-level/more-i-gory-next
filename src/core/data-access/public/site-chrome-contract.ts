import { z } from "zod";

const siteNavigationLinkSchema = z.object({
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

export const publicSiteSettingsSelect = {
  legalNotice: true,
  shortName: true,
  siteName: true,
  tagline: true,
} as const;

export const publicNavigationSelect = {
  footer: true,
  header: true,
  headerCta: true,
  legal: true,
} as const;

export const fallbackSiteChrome: SiteChrome = siteChromeSchema.parse({
  brand: {
    siteName: "Море и Горы",
    shortName: "МГ",
    tagline: "инвестиционное бюро",
  },
  legalNotice: "Материалы сайта не являются индивидуальной инвестиционной рекомендацией.",
  navigation: {
    footer: [
      { href: "/investicionnaya-nedvizhimost/", label: "Инвестиционная недвижимость", nofollow: false, openInNewTab: false },
      { href: "/obekty/", label: "Объекты", nofollow: false, openInNewTab: false },
      { href: "/metodika/", label: "Методика", nofollow: false, openInNewTab: false },
      { href: "/analitika/", label: "Аналитика", nofollow: false, openInNewTab: false },
      { href: "/podbor/", label: "Подбор", nofollow: false, openInNewTab: false },
    ],
    header: [
      { href: "/investicionnaya-nedvizhimost/", label: "Регионы", nofollow: false, openInNewTab: false },
      { href: "/obekty/", label: "Объекты", nofollow: false, openInNewTab: false },
      { href: "/metodika/", label: "Методика", nofollow: false, openInNewTab: false },
      { href: "/analitika/", label: "Аналитика", nofollow: false, openInNewTab: false },
      { href: "/o-kompanii/", label: "О компании", nofollow: false, openInNewTab: false },
      { href: "/kontakty/", label: "Контакты", nofollow: false, openInNewTab: false },
    ],
    headerCta: { href: "/podbor/", label: "Получить разбор", nofollow: false, openInNewTab: false },
    legal: [
      { href: "/o-kompanii/", label: "О компании", nofollow: false, openInNewTab: false },
      { href: "/kontakty/", label: "Контакты", nofollow: false, openInNewTab: false },
      { href: "/privacy/", label: "Политика конфиденциальности", nofollow: false, openInNewTab: false },
      { href: "/consent/", label: "Согласие на обработку данных", nofollow: false, openInNewTab: false },
    ],
  },
});

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function mapLinks(items: unknown): readonly SiteNavigationLink[] {
  if (!Array.isArray(items)) return [];

  return items.flatMap((item) => {
    const record = asRecord(item);
    if (!hasText(record.label) || !hasText(record.href)) return [];

    return [
      {
        href: record.href.trim(),
        label: record.label.trim(),
        nofollow: record.nofollow === true,
        openInNewTab: record.openInNewTab === true,
      },
    ];
  });
}

function firstNonEmpty<T>(items: readonly T[], fallback: readonly T[]): readonly T[] {
  return items.length > 0 ? items : fallback;
}

function mapHeaderCta(navigation: Record<string, unknown>): SiteNavigationLink {
  const cta = asRecord(navigation.headerCta);
  if (hasText(cta.label) && hasText(cta.href)) {
    return {
      href: cta.href.trim(),
      label: cta.label.trim(),
      nofollow: false,
      openInNewTab: false,
    };
  }

  return fallbackSiteChrome.navigation.headerCta;
}

export function mapSiteChrome(settings: unknown, navigation: unknown): SiteChrome {
  const settingsRecord = asRecord(settings);
  const navigationRecord = navigation && typeof navigation === "object" ? asRecord(navigation) : null;
  const header = firstNonEmpty(mapLinks(navigationRecord?.header), fallbackSiteChrome.navigation.header);
  const footer = firstNonEmpty(mapLinks(navigationRecord?.footer), fallbackSiteChrome.navigation.footer);
  const legal = firstNonEmpty(mapLinks(navigationRecord?.legal), fallbackSiteChrome.navigation.legal);

  return siteChromeSchema.parse({
    brand: {
      siteName: hasText(settingsRecord.siteName) ? settingsRecord.siteName.trim() : fallbackSiteChrome.brand.siteName,
      shortName: hasText(settingsRecord.shortName) ? settingsRecord.shortName.trim() : fallbackSiteChrome.brand.shortName,
      tagline: hasText(settingsRecord.tagline) ? settingsRecord.tagline.trim() : fallbackSiteChrome.brand.tagline,
    },
    legalNotice: hasText(settingsRecord.legalNotice) ? settingsRecord.legalNotice.trim() : fallbackSiteChrome.legalNotice,
    navigation: {
      footer,
      header,
      headerCta: navigationRecord ? mapHeaderCta(navigationRecord) : fallbackSiteChrome.navigation.headerCta,
      legal,
    },
  });
}
