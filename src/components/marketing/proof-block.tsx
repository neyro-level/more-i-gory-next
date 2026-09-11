import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type ProofBlockProps = {
  items: Array<{
    title: string;
    text: string;
  }>;
  title?: ReactNode;
};

export function ProofBlock({ items, title = "На чём держится вывод" }: ProofBlockProps) {
  return (
    <Card className="rounded-large bg-card">
      <CardContent className="flex flex-col gap-6 p-6 md:p-8">
        {title ? <h3 className="text-h3 font-semibold">{title}</h3> : null}
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="flex flex-col gap-3 rounded-card bg-muted p-5">
              <span aria-hidden="true" className="grid size-5 place-items-center rounded-full bg-action text-action-foreground"><Check /></span>
              <p className="font-semibold">{item.title}</p>
              <p className="text-body-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
