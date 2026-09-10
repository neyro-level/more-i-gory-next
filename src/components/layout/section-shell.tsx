import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./container";

type SectionShellProps = ComponentPropsWithoutRef<"section"> & {
  eyebrow?: string;
  title?: string;
  lead?: string;
  actions?: ReactNode;
  contained?: boolean;
};

export function SectionShell({
  actions,
  children,
  className,
  contained = true,
  eyebrow,
  lead,
  title,
  ...props
}: SectionShellProps) {
  const content = (
    <div className="space-y-10">
      {(eyebrow || title || lead || actions) && (
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-coral">{eyebrow}</p> : null}
            {title ? <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">{title}</h2> : null}
            {lead ? <p className="text-lg leading-8 text-muted-foreground">{lead}</p> : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      )}
      {children}
    </div>
  );

  return (
    <section className={cn("py-16 md:py-24", className)} {...props}>
      {contained ? <Container>{content}</Container> : content}
    </section>
  );
}
