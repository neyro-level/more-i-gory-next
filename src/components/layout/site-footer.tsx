import Link from "next/link";
import type { SiteChrome, SiteNavigationLink } from "@/core/data-access/public";
import { Container } from "./container";

type SiteFooterProps = Readonly<{
  brand: SiteChrome["brand"];
  legal: readonly SiteNavigationLink[];
  legalNotice: string;
  navigation: readonly SiteNavigationLink[];
}>;

function linkRel(item: SiteNavigationLink): string | undefined {
  return item.nofollow ? "nofollow" : undefined;
}

function linkTarget(item: SiteNavigationLink): string | undefined {
  return item.openInNewTab ? "_blank" : undefined;
}

export function SiteFooter({ brand, legal, legalNotice, navigation }: SiteFooterProps) {
  return (
    <footer className="bg-surface-dark py-section-sm text-surface-dark-foreground">
      <Container className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-4">
          <p className="text-h3 font-semibold">{brand.siteName}</p>
          <p className="max-w-narrow text-body-sm text-surface-dark-foreground/65">
            Инвестиционное бюро курортной недвижимости. Помогаем сравнивать регионы, проекты,
            экономику, риски и сценарии выхода до сделки.
          </p>
          <p className="text-caption text-surface-dark-foreground/55">© {brand.siteName}. {legalNotice}</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <nav className="flex flex-col gap-3 text-label" aria-label="Навигация в подвале">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} rel={linkRel(item)} target={linkTarget(item)} className="block text-surface-dark-foreground/70 transition-colors duration-fast ease-standard hover:text-surface-dark-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
          <nav className="flex flex-col gap-3 text-label" aria-label="Юридическая навигация">
            {legal.map((item) => (
              <Link key={item.href} href={item.href} rel={linkRel(item)} target={linkTarget(item)} className="block text-surface-dark-foreground/70 transition-colors duration-fast ease-standard hover:text-surface-dark-foreground">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
