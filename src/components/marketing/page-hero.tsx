import Image from "next/image";
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
    <section className="bg-surface-dark py-section-hero text-surface-dark-foreground">
      <Container>
        <div className="grid min-w-0 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="flex min-w-0 flex-col justify-center rounded-large bg-card p-7 text-foreground shadow-surface md:p-10">
            <span className="mb-6 w-fit rounded-full bg-action/10 px-3 py-1 text-caption font-medium text-action">
              {eyebrow}
            </span>
            <h1 className="max-w-site text-h1 font-semibold text-balance">{title}</h1>
            <p className="mt-6 max-w-narrow text-body-lg text-muted-foreground">{lead}</p>
            <div className="mt-8 flex flex-col gap-3 xl:flex-row">
              <ActionLink className="sm:w-full xl:w-auto" href={primaryCta.href} variant="accent" showArrow>
                {primaryCta.label}
              </ActionLink>
              {secondaryCta ? (
                <ActionLink className="sm:w-full xl:w-auto" href={secondaryCta.href} variant="outline">
                  {secondaryCta.label}
                </ActionLink>
              ) : null}
            </div>
            {proof ? <div className="mt-8 border-t pt-6 text-body-sm text-muted-foreground">{proof}</div> : null}
          </div>

          {image ? (
            <div className="relative aspect-hero min-w-0 overflow-hidden rounded-large bg-surface-dark-foreground/10 lg:aspect-auto lg:min-h-hero-media-min">
              <Image src={image.src} alt={image.alt} fill preload sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-surface-dark/35 to-transparent" />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
