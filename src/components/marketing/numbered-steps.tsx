import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type NumberedStepsProps = {
  columns?: 3 | 4 | 5;
  items: Array<{
    title: string;
  }>;
};

const columnClasses = {
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
  5: "md:grid-cols-2 lg:grid-cols-5",
} as const;

export function NumberedSteps({ columns = 3, items }: NumberedStepsProps) {
  return (
    <div className={cn("grid gap-4", columnClasses[columns])}>
      {items.map((item, index) => (
        <Card key={item.title} radius="card" className="bg-card">
          <CardHeader className="gap-4 p-5">
            <Badge variant="accent" className="size-9 justify-center rounded-full p-0 text-label">
              {index + 1}
            </Badge>
            <CardTitle className="text-body font-semibold">{item.title}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
