import ExportedImage from "next-image-export-optimizer";
import { StaticLink } from "@/components/navigation/static-link";
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
    <Card className="overflow-hidden rounded-[1.5rem] bg-white">
      <div className="relative aspect-[4/3]">
        <ExportedImage src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 25vw, 100vw" className="object-cover" />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-4 text-2xl">
          <StaticLink href={href} className="after:absolute after:inset-0">
            {title}
          </StaticLink>
          <span aria-hidden="true" className="text-brand-coral">↗</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
        <p>{thesis}</p>
        <p className="rounded-2xl bg-muted p-4 text-foreground">
          <span className="font-semibold">Риск: </span>
          {risk}
        </p>
      </CardContent>
    </Card>
  );
}
