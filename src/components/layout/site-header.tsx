import { Menu } from "lucide-react";
import Link from "next/link";
import { ActionLink } from "@/components/navigation/action-link";
import type { EditorialPreviewNavigationGroup, SiteChrome, SiteNavigationLink } from "@/core/dto";
import { Container } from "./container";

type SiteHeaderProps = Readonly<{
  brand: SiteChrome["brand"];
  cta: SiteNavigationLink;
  navigation: readonly SiteNavigationLink[];
  previewNavigation?: readonly EditorialPreviewNavigationGroup[];
}>;

function linkRel(item: SiteNavigationLink): string | undefined {
  return item.nofollow ? "nofollow" : undefined;
}

function linkTarget(item: SiteNavigationLink): string | undefined {
  return item.openInNewTab ? "_blank" : undefined;
}

function PreviewNavigation({ groups }: { groups: readonly EditorialPreviewNavigationGroup[] }) {
  return (
    <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-4">
      {groups.map((group) => (
        <div key={group.label} className="grid content-start gap-2">
          <p className="px-3 text-caption font-semibold uppercase tracking-wide text-muted-foreground">{group.label}</p>
          {group.links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              rel={linkRel(item)}
              className="rounded-control px-3 py-2 text-body-sm font-medium text-foreground transition-colors duration-150 ease-standard hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}

export function SiteHeader({ brand, cta, navigation, previewNavigation = [] }: SiteHeaderProps) {
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
          {previewNavigation.length > 0 ? (
            <details className="group">
              <summary className="cursor-pointer list-none font-semibold text-action [&::-webkit-details-marker]:hidden">
                Все страницы
              </summary>
              <div className="fixed left-1/2 top-20 max-h-screen w-screen max-w-6xl -translate-x-1/2 overflow-y-auto rounded-b-large border border-border bg-card text-foreground shadow-surface">
                <div className="border-b border-border bg-accent/10 px-6 py-3 text-body-sm font-semibold text-foreground">
                  Технический preview · страницы для наполнения · noindex
                </div>
                <PreviewNavigation groups={previewNavigation} />
              </div>
            </details>
          ) : null}
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
          <nav className="absolute right-0 top-14 z-50 grid max-h-screen min-w-72 overflow-y-auto rounded-card bg-card p-3 text-surface-dark shadow-surface" aria-label="Мобильная навигация">
            {navigation.map((item) => (
              <Link key={item.href} href={item.href} rel={linkRel(item)} target={linkTarget(item)} className="rounded-control px-4 py-3 text-label font-semibold transition-colors duration-150 ease-standard hover:bg-muted">
                {item.label}
              </Link>
            ))}
            <ActionLink href={cta.href} variant="accent" className="mt-1">
              {cta.label}
            </ActionLink>
            {previewNavigation.length > 0 ? (
              <div className="mt-3 border-t border-border pt-3">
                <p className="px-4 pb-2 text-caption font-semibold uppercase tracking-wide text-muted-foreground">Все страницы · preview</p>
                <PreviewNavigation groups={previewNavigation} />
              </div>
            ) : null}
          </nav>
        </details>
      </Container>
    </header>
  );
}
