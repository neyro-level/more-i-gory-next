import { StaticLink } from "@/components/navigation/static-link";
import { buttonVariants } from "@/lib/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type LeadFormSectionProps = {
  title?: string;
  text?: string;
};

export function LeadFormSection({
  text = "Опишите задачу капитала, регион и желаемый горизонт. Мы вернёмся с понятным следующим шагом после согласования реального процесса и Leads API.",
  title = "Получить инвестиционный разбор",
}: LeadFormSectionProps) {
  return (
    <Card className="rounded-hero bg-brand-navy text-white">
      <CardContent className="grid gap-8 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-10">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-semibold">{title}</h2>
          <p className="max-w-2xl text-white/70">{text}</p>
        </div>
        <StaticLink href="/podbor/" className={cn(buttonVariants({ size: "lg" }), "rounded-full bg-brand-coral px-6 text-white hover:bg-brand-coral/90")}>
          Перейти к подбору
        </StaticLink>
      </CardContent>
    </Card>
  );
}
