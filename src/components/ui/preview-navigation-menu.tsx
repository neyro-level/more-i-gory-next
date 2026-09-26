"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";

import type { EditorialPreviewNavigationGroup } from "@/core/dto";
import { Button } from "@/components/ui/button";

export function PreviewNavigationMenu({ groups }: Readonly<{ groups: readonly EditorialPreviewNavigationGroup[] }>) {
  const pathname = usePathname();
  const panelId = useId();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  return (
    <div onKeyDown={(event) => {
      if (event.key === "Escape") setOpenPath(null);
    }}>
      <Button
        aria-controls={panelId}
        aria-expanded={open}
        className="font-semibold text-action"
        onClick={() => setOpenPath(open ? null : pathname)}
        variant="ghost"
      >
        Все страницы
      </Button>
      {open ? (
        <div
          className="preview-navigation-panel fixed left-1/2 top-(--spacing-header) w-screen max-w-6xl -translate-x-1/2 overflow-y-auto rounded-b-large border border-border bg-card text-foreground shadow-surface"
          id={panelId}
        >
          <div className="border-b border-border bg-accent/10 px-6 py-3 text-body-sm font-semibold text-foreground">
            Preview-only: страницы для проверки наполнения, закрытые от индексации
          </div>
          <div className="grid gap-6 p-6 md:grid-cols-2 xl:grid-cols-4">
            {groups.map((group) => (
              <div className="grid content-start gap-2" key={group.label}>
                <p className="px-3 text-caption font-semibold uppercase tracking-eyebrow text-muted-foreground">{group.label}</p>
                {group.links.map((item) => (
                  <Link
                    className="rounded-control px-3 py-2 text-body-sm font-medium text-foreground transition-colors duration-150 ease-standard hover:bg-muted"
                    href={item.href}
                    key={item.href}
                    onClick={() => setOpenPath(null)}
                    rel={item.nofollow ? "nofollow" : undefined}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
