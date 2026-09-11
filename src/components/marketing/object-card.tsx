import ExportedImage from "next-image-export-optimizer";
import { StaticLink } from "@/components/navigation/static-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ObjectCardProps = {
  href: string;
  image: {
    alt: string;
    height: number;
    src: string;
    width: number;
  };
  location: string;
  risk: string;
  status: string;
  thesis: string;
  title: string;
};

export function ObjectCard({ href, image, location, risk, status, thesis, title }: ObjectCardProps) {
  return (
    <Card className="rounded-surface bg-card">
      <div className="relative aspect-[16/10]">
        <ExportedImage src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
      </div>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{location}</Badge>
          <Badge variant="accent">{status}</Badge>
        </div>
        <CardTitle className="text-card-title">
          <StaticLink href={href}>{title}</StaticLink>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm leading-7 text-muted-foreground">
        <p>{thesis}</p>
        <p className="border-l-2 border-action pl-4 text-foreground">{risk}</p>
      </CardContent>
    </Card>
  );
}
