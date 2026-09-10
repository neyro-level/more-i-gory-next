import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
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
    <Card className="rounded-[1.75rem] bg-white">
      <CardContent className="space-y-6 p-6 md:p-8">
        <h3 className="text-2xl font-semibold">{title}</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.title} className="space-y-3 rounded-2xl bg-muted p-5">
              <CheckCircle2 aria-hidden="true" className="size-5 text-brand-coral" />
              <p className="font-semibold">{item.title}</p>
              <p className="text-sm leading-7 text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
