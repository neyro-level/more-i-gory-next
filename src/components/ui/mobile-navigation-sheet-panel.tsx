"use client";

import Link from "next/link";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { EditorialPreviewNavigationGroup, SiteNavigationLink } from "@/core/dto";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

type MobileNavigationSheetPanelProps = Readonly<{
  cta: SiteNavigationLink;
  navigation: readonly SiteNavigationLink[];
  onOpenChange: (open: boolean) => void;
  open: boolean;
  previewNavigation?: readonly EditorialPreviewNavigationGroup[];
}>;

function linkRel(item: SiteNavigationLink): string | undefined {
  return item.nofollow ? "nofollow" : undefined;
}

function linkTarget(item: SiteNavigationLink): string | undefined {
  return item.openInNewTab ? "_blank" : undefined;
}

export function MobileNavigationSheetPanel({
  cta,
  navigation,
  onOpenChange,
  open,
  previewNavigation = [],
}: MobileNavigationSheetPanelProps) {
  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent aria-label="Мобильная навигация" className="w-full max-w-sm overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle>Навигация</SheetTitle>
          <SheetDescription className="sr-only">Основные разделы сайта</SheetDescription>
        </SheetHeader>
        <nav className="grid gap-1 px-3 pb-4" aria-label="Мобильная навигация">
          {navigation.map((item) => (
            <Link
              key={item.href}
              className="rounded-control px-4 py-3 text-label font-semibold transition-colors duration-150 ease-standard hover:bg-muted"
              href={item.href}
              onClick={close}
              rel={linkRel(item)}
              target={linkTarget(item)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            className={cn(buttonVariants({ size: "cta", variant: "accent" }), "mt-2 w-full")}
            href={cta.href}
            onClick={close}
            rel={linkRel(cta)}
            target={linkTarget(cta)}
          >
            {cta.label}
          </Link>
          {previewNavigation.length > 0 ? (
            <div className="mt-3 grid gap-5 border-t border-border pt-4">
              <p className="px-4 text-caption font-semibold uppercase tracking-eyebrow text-muted-foreground">
                Все страницы · preview-only
              </p>
              {previewNavigation.map((group) => (
                <div className="grid gap-1" key={group.label}>
                  <p className="px-4 text-caption font-semibold text-muted-foreground">{group.label}</p>
                  {group.links.map((item) => (
                    <Link
                      className="rounded-control px-4 py-2 text-body-sm font-medium hover:bg-muted"
                      href={item.href}
                      key={item.href}
                      onClick={close}
                      rel={linkRel(item)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          ) : null}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
