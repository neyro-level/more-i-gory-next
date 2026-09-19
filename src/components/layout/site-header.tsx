import { Menu } from "lucide-react";
import Link from "next/link";
import { ActionLink } from "@/components/navigation/action-link";
import type { SiteChrome, SiteNavigationLink } from "@/core/dto";
import { Container } from "./container";

type SiteHeaderProps = Readonly<{
  brand: SiteChrome["brand"];
  cta: SiteNavigationLink;
  navigation: readonly SiteNavigationLink[];
}>;

function linkRel(item: SiteNavigationLink): string | undefined {
  return item.nofollow ? "nofollow" : undefined;
}

function linkTarget(item: SiteNavigationLink): string | undefined {
  return item.openInNewTab ? "_blank" : undefined;
}

export function SiteHeader({ brand, cta, navigation }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-surface-dark-foreground/10 bg-surface-dark/95 text-surface-dark-foreground backdrop-blur">
      <Container className="flex h-20 items-center justify-between gap-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-surface-dark-foreground text-label font-bold text-surface-dark">{brand.shortName}</span>
          <span className="leading-tight">
            <span className="block text-body font-semibold">{brand.siteName}</span>
            <span className="block text-caption text-surface-dark-foreground/60">{brand.tagline}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-label text-surface-dark-foreground/75 xl:flex" aria-label="Основная навигация">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} rel={linkRel(item)} target={linkTarget(item)} className="transition-colors duration-150 ease-standard hover:text-surface-dark-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <Link href="/kontakty/" className="text-label text-surface-dark-foreground/70 transition-colors duration-150 ease-standard hover:text-surface-dark-foreground">
            Связаться
          </Link>
          <ActionLink href={cta.href} variant="accent" showArrow>
            {cta.label}
          </ActionLink>
        </div>

        <details className="group relative xl:hidden">
          <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-full border border-surface-dark-foreground/20 bg-surface-dark-foreground/10 text-surface-dark-foreground [&::-webkit-details-marker]:hidden">
            <Menu aria-hidden="true" />
            <span className="sr-only">Открыть меню</span>
          </summary>
          <nav className="absolute right-0 top-14 z-50 grid min-w-64 gap-2 rounded-card bg-card p-3 text-surface-dark shadow-surface" aria-label="Мобильная навигация">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} rel={linkRel(item)} target={linkTarget(item)} className="rounded-control px-4 py-3 text-label font-semibold transition-colors duration-150 ease-standard hover:bg-muted">
                {item.label}
              </Link>
            ))}
            <ActionLink href={cta.href} variant="accent" className="mt-1">
              {cta.label}
            </ActionLink>
          </nav>
        </details>
      </Container>
    </header>
  );
}
