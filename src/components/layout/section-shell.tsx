import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./container";

type SectionShellProps = ComponentPropsWithoutRef<"section"> & {
  eyebrow?: string;
  title?: string;
  lead?: string;
  actions?: ReactNode;
  contained?: boolean;
  headingLevel?: 1 | 2;
  tone?: "default" | "dark";
};

export function SectionShell({
  actions,
  children,
  className,
  contained = true,
  eyebrow,
  headingLevel = 2,
  lead,
  title,
  tone = "default",
  ...props
}: SectionShellProps) {
  const Heading = headingLevel === 1 ? "h1" : "h2";
  const content = (
    <div className="space-y-10">
      {(eyebrow || title || lead || actions) && (
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            {eyebrow ? <p className={cn("text-sm font-semibold uppercase tracking-[0.22em]", tone === "dark" ? "text-brand-coral-light" : "text-brand-coral")}>{eyebrow}</p> : null}
            {title ? <Heading className={cn("text-3xl font-semibold tracking-tight md:text-5xl", tone === "dark" ? "text-white" : "text-foreground")}>{title}</Heading> : null}
            {lead ? <p className={cn("text-lg leading-8", tone === "dark" ? "text-white/75" : "text-muted-foreground")}>{lead}</p> : null}
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
