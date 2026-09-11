import ExportedImage from "next-image-export-optimizer";
import type { ReactNode } from "react";
import { Container } from "@/components/layout/container";
import { ActionLink } from "@/components/navigation/action-link";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  lead: string;
  primaryCta: { href: string; label: string };
  secondaryCta?: { href: string; label: string };
  image?: {
    alt: string;
    height: number;
    src: string;
    width: number;
  };
  proof?: ReactNode;
};

export function PageHero({ eyebrow, image, lead, primaryCta, proof, secondaryCta, title }: PageHeroProps) {
  return (
    <section className="bg-brand-navy py-10 text-white md:py-16">
      <Container>
        <div className="grid min-w-0 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="flex min-w-0 flex-col justify-center rounded-hero bg-card p-7 text-foreground shadow-surface md:p-10">
            <span className="mb-6 w-fit rounded-full bg-action/10 px-3 py-1 text-caption font-medium text-action">
              {eyebrow}
            </span>
            <h1 className="max-w-4xl text-page-title font-semibold text-balance md:text-page-title-lg">{title}</h1>
            <p className="mt-6 max-w-2xl text-lead text-muted-foreground">{lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ActionLink href={primaryCta.href} variant="accent" showArrow>
                {primaryCta.label}
              </ActionLink>
              {secondaryCta ? (
                <ActionLink href={secondaryCta.href} variant="outline">
                  {secondaryCta.label}
                </ActionLink>
              ) : null}
            </div>
            {proof ? <div className="mt-8 border-t pt-6 text-sm text-muted-foreground">{proof}</div> : null}
          </div>

          {image ? (
            <div className="relative min-h-80 min-w-0 overflow-hidden rounded-hero bg-white/10 md:min-h-[420px]">
              <ExportedImage src={image.src} alt={image.alt} fill priority sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/35 to-transparent" />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
