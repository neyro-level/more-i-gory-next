import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type RegionCardProps = {
  href: string;
  image: {
    alt: string;
    height: number;
    src: string;
    width: number;
  };
  risk: string;
  thesis: string;
  title: string;
};

export function RegionCard({ href, image, risk, thesis, title }: RegionCardProps) {
  return (
    <Card className="relative overflow-hidden rounded-card bg-card">
      <div className="relative aspect-card">
        <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 25vw, 100vw" className="object-cover" />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-4 text-h3">
          <Link href={href} className="after:absolute after:inset-0">
            {title}
          </Link>
          <ArrowUpRight aria-hidden="true" className="text-action" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-body-sm text-muted-foreground">
        <p>{thesis}</p>
        <p className="rounded-card bg-muted p-4 text-foreground">
          <span className="font-semibold">Риск: </span>
          {risk}
        </p>
      </CardContent>
    </Card>
  );
}
