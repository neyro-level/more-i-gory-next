import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ObjectCardProps = {
  budget?: string;
  cityOrArea?: string;
  format?: string;
  href: string;
  image: {
    alt: string;
    height: number;
    src: string;
    width: number;
  };
  location: string;
  locationHref?: string;
  risk: string;
  status: string;
  thesis: string;
  title: string;
  verifiedAt?: string;
};

function formatVerifiedAt(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Moscow" }).format(date);
}

export function ObjectCard({ budget, cityOrArea, format, href, image, location, locationHref, risk, status, thesis, title, verifiedAt }: ObjectCardProps) {
  return (
    <Card className="rounded-card bg-card">
      <div className="relative aspect-object">
        <Image src={image.src} alt={image.alt} fill loading="lazy" sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
      </div>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {locationHref ? <Link href={locationHref}>{location}</Link> : location}
          </Badge>
          {cityOrArea ? <Badge variant="secondary">{cityOrArea}</Badge> : null}
          {format ? <Badge variant="secondary">{format}</Badge> : null}
          <Badge variant="accent">{status}</Badge>
        </div>
        <CardTitle className="text-h3">
          <Link href={href}>{title}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-body-sm text-muted-foreground">
        <p>{thesis}</p>
        {budget || verifiedAt ? (
          <dl className="grid gap-2 border-y border-border py-3 text-body-sm">
            {budget ? (
              <div className="flex justify-between gap-4">
                <dt>Бюджет</dt>
                <dd className="text-right text-foreground">{budget}</dd>
              </div>
            ) : null}
            {verifiedAt ? (
              <div className="flex justify-between gap-4">
                <dt>Проверено</dt>
                <dd className="text-right text-foreground">{formatVerifiedAt(verifiedAt)}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
        <p className="border-l-2 border-action pl-4 text-foreground">{risk}</p>
      </CardContent>
    </Card>
  );
}
