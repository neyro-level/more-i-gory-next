import ExportedImage from "next-image-export-optimizer";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Container } from "@/components/layout/container";

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
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="flex flex-col justify-center rounded-[2rem] bg-white p-7 text-foreground shadow-2xl shadow-black/10 md:p-10">
            <Badge className="mb-6 w-fit rounded-full bg-brand-coral/10 text-brand-coral">{eyebrow}</Badge>
            <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">{title}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{lead}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={primaryCta.href} className={cn(buttonVariants({ size: "lg" }), "rounded-full bg-brand-coral px-6 text-white hover:bg-brand-coral/90")}>
                {primaryCta.label}
                <ArrowRight aria-hidden="true" className="ml-2 size-4" />
              </Link>
              {secondaryCta ? (
                <Link href={secondaryCta.href} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-6")}>
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>
            {proof ? <div className="mt-8 border-t pt-6 text-sm text-muted-foreground">{proof}</div> : null}
          </div>

          {image ? (
            <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-white/10">
              <ExportedImage src={image.src} alt={image.alt} fill priority sizes="(min-width: 1024px) 46vw, 100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/35 to-transparent" />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
