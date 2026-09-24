type SourceListProps = {
  items: Array<{
    title: string;
    description?: string;
    href?: string;
  }>;
  title?: string;
};

export function SourceList({ items, title = "Источники и проверка" }: SourceListProps) {
  return (
    <Card className="rounded-card bg-card">
      <CardHeader>
        <CardTitle className="text-h3">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-4 text-body-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item.title} className="border-l-2 border-action pl-4">
            {item.href ? (
              <a className="block font-semibold text-foreground underline-offset-4 hover:underline" href={item.href} rel="noreferrer" target="_blank">
                {item.title}
              </a>
            ) : (
              <span className="block font-semibold text-foreground">{item.title}</span>
            )}
            {item.description ? <span>{item.description}</span> : null}
          </li>
        ))}
        </ul>
      </CardContent>
    </Card>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
