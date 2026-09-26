import Link from "next/link";
import { ActionLink } from "@/components/navigation/action-link";
import type { EditorialPreviewNavigationGroup, SiteChrome, SiteNavigationLink } from "@/core/dto";
import { PreviewNavigationMenu } from "@/components/ui/preview-navigation-menu";
import { Container } from "./container";
import { MobileMenu } from "./mobile-menu";

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

export function SiteHeader({ brand, cta, navigation, previewNavigation = [] }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-surface-dark-foreground/10 bg-surface-dark/95 text-surface-dark-foreground backdrop-blur">
      <Container className="flex h-(--spacing-header) items-center justify-between gap-6">
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
            <PreviewNavigationMenu groups={previewNavigation} />
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

        <div className="xl:hidden">
          <MobileMenu cta={cta} navigation={navigation} previewNavigation={previewNavigation} />
        </div>
      </Container>
    </header>
  );
}
