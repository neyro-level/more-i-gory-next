type SourceListProps = {
  items: Array<{
    title: string;
    description?: string;
  }>;
};

export function SourceList({ items }: SourceListProps) {
  return (
    <Card className="rounded-surface bg-card">
      <CardHeader>
        <CardTitle className="text-card-title">Источники и проверка</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-4 text-sm leading-7 text-muted-foreground">
        {items.map((item) => (
          <li key={item.title} className="border-l-2 border-action pl-4">
            <span className="block font-semibold text-foreground">{item.title}</span>
            {item.description ? <span>{item.description}</span> : null}
          </li>
        ))}
        </ul>
      </CardContent>
    </Card>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
