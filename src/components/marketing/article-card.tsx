import { StaticLink } from "@/components/navigation/static-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ArticleCardProps = {
  description: string;
  href: string;
  status: string;
  title: string;
};

export function ArticleCard({ description, href, status, title }: ArticleCardProps) {
  return (
    <Card className="rounded-card bg-card">
      <CardHeader>
        <CardTitle className="text-h3">
          <StaticLink href={href}>{title}</StaticLink>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-body-sm text-muted-foreground">
        <p>{description}</p>
        <p className="text-caption font-medium uppercase tracking-eyebrow text-action">
          {status}
        </p>
      </CardContent>
    </Card>
  );
}
