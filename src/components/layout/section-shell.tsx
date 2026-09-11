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
    <div className="flex min-w-0 flex-col gap-10">
      {(eyebrow || title || lead || actions) && (
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 max-w-3xl flex-col gap-4">
            {eyebrow ? <p className={cn("text-caption font-semibold uppercase tracking-[0.18em]", tone === "dark" ? "text-brand-coral-light" : "text-action")}>{eyebrow}</p> : null}
            {title ? <Heading className={cn("text-section-title font-semibold md:text-section-title-lg", tone === "dark" ? "text-white" : "text-foreground")}>{title}</Heading> : null}
            {lead ? <p className={cn("text-lead", tone === "dark" ? "text-white/75" : "text-muted-foreground")}>{lead}</p> : null}
          </div>
          {actions ? <div className="w-full shrink-0 lg:w-auto">{actions}</div> : null}
        </div>
      )}
      {children}
    </div>
  );

  return (
    <section className={cn("py-section md:py-section-lg", className)} {...props}>
      {contained ? <Container>{content}</Container> : content}
    </section>
  );
}
