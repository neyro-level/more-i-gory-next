import type { Navigation, SiteSetting } from "../../../payload-types.ts";

export type SiteNavigationLink = Readonly<{
  href: string;
  label: string;
  nofollow: boolean;
  openInNewTab: boolean;
}>;

export type SiteChrome = Readonly<{
  brand: {
    siteName: string;
    shortName: string;
    tagline: string;
  };
  legalNotice: string;
  navigation: {
    footer: readonly SiteNavigationLink[];
    header: readonly SiteNavigationLink[];
    headerCta: SiteNavigationLink;
    legal: readonly SiteNavigationLink[];
  };
}>;

export const fallbackSiteChrome: SiteChrome = {
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
};

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function mapLinks(items: Navigation["header"] | Navigation["footer"] | Navigation["legal"]): readonly SiteNavigationLink[] {
  return (items ?? [])
    .filter((item) => hasText(item.label) && hasText(item.href))
    .map((item) => ({
      href: item.href.trim(),
      label: item.label.trim(),
      nofollow: item.nofollow === true,
      openInNewTab: item.openInNewTab === true,
    }));
}

function firstNonEmpty<T>(items: readonly T[], fallback: readonly T[]): readonly T[] {
  return items.length > 0 ? items : fallback;
}

function mapHeaderCta(navigation: Navigation): SiteNavigationLink {
  if (hasText(navigation.headerCta?.label) && hasText(navigation.headerCta?.href)) {
    return {
      href: navigation.headerCta.href.trim(),
      label: navigation.headerCta.label.trim(),
      nofollow: false,
      openInNewTab: false,
    };
  }

  return fallbackSiteChrome.navigation.headerCta;
}

export function mapSiteChrome(settings: SiteSetting | null, navigation: Navigation | null): SiteChrome {
  const header = firstNonEmpty(mapLinks(navigation?.header), fallbackSiteChrome.navigation.header);
  const footer = firstNonEmpty(mapLinks(navigation?.footer), fallbackSiteChrome.navigation.footer);
  const legal = firstNonEmpty(mapLinks(navigation?.legal), fallbackSiteChrome.navigation.legal);

  return {
    brand: {
      siteName: hasText(settings?.siteName) ? settings.siteName.trim() : fallbackSiteChrome.brand.siteName,
      shortName: hasText(settings?.shortName) ? settings.shortName.trim() : fallbackSiteChrome.brand.shortName,
      tagline: hasText(settings?.tagline) ? settings.tagline.trim() : fallbackSiteChrome.brand.tagline,
    },
    legalNotice: hasText(settings?.legalNotice) ? settings.legalNotice.trim() : fallbackSiteChrome.legalNotice,
    navigation: {
      footer,
      header,
      headerCta: navigation ? mapHeaderCta(navigation) : fallbackSiteChrome.navigation.headerCta,
      legal,
    },
  };
}
