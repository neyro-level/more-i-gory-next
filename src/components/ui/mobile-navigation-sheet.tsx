"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { EditorialPreviewNavigationGroup, SiteNavigationLink } from "@/core/dto";

const MobileNavigationSheetPanel = dynamic(
  () => import("@/components/ui/mobile-navigation-sheet-panel").then((module) => module.MobileNavigationSheetPanel),
  { ssr: false },
);

type MobileNavigationSheetProps = Readonly<{
  cta: SiteNavigationLink;
  navigation: readonly SiteNavigationLink[];
  previewNavigation?: readonly EditorialPreviewNavigationGroup[];
}>;

export function MobileNavigationSheet({ cta, navigation, previewNavigation = [] }: MobileNavigationSheetProps) {
  const pathname = usePathname();
  const openedPath = useRef(pathname);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && pathname !== openedPath.current) setOpen(false);
  }, [open, pathname]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <Button
        aria-label="Открыть меню"
        className="grid size-11 place-items-center rounded-full border border-surface-dark-foreground/20 bg-surface-dark-foreground/10 text-surface-dark-foreground transition-colors hover:bg-surface-dark-foreground/15"
        onClick={() => {
          openedPath.current = pathname;
          setOpen(true);
        }}
        ref={triggerRef}
        size="icon"
        type="button"
        variant="ghost"
      >
        <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        </svg>
      </Button>
      {open ? (
        <MobileNavigationSheetPanel
          cta={cta}
          navigation={navigation}
          onOpenChange={handleOpenChange}
          open={open}
          previewNavigation={previewNavigation}
        />
      ) : null}
    </>
  );
}
