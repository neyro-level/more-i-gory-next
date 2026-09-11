import type { ReactNode } from "react";
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
    <Card className="rounded-feature bg-white">
      <CardContent className="flex flex-col gap-6 p-6 md:p-8">
        <h3 className="text-2xl font-semibold">{title}</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="flex flex-col gap-3 rounded-2xl bg-muted p-5">
              <span aria-hidden="true" className="grid size-5 place-items-center rounded-full bg-brand-coral text-xs text-white">✓</span>
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm leading-7 text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
