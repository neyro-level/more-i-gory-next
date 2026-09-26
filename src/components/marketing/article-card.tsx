import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ArticleCardProps = {
  description: string;
  href: string;
  title: string;
};

export function ArticleCard({ description, href, title }: ArticleCardProps) {
  return (
    <Card radius="card" className="bg-card">
      <CardHeader>
        <CardTitle className="text-h3">
          <Link href={href}>{title}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-body-sm text-muted-foreground">
        <p>{description}</p>
      </CardContent>
    </Card>
  );
}
