import { ActionLink } from "@/components/navigation/action-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LeadFormSectionProps = {
  title?: string;
  text?: string;
};

export function LeadFormSection({
  text = "Опишите задачу капитала, регион и желаемый горизонт. Мы вернёмся с понятным следующим шагом после согласования реального процесса и Leads API.",
  title = "Получить инвестиционный разбор",
}: LeadFormSectionProps) {
  return (
    <Card className="rounded-large bg-surface-dark text-surface-dark-foreground">
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
        <CardHeader className="gap-4 p-8 md:p-10">
          <CardTitle className="text-h2 text-surface-dark-foreground">{title}</CardTitle>
          <p className="max-w-narrow text-body text-surface-dark-foreground/70">{text}</p>
        </CardHeader>
        <CardContent className="px-8 pb-8 md:p-10 md:pl-0">
          <ActionLink href="/podbor/" variant="accent">
          Перейти к подбору
          </ActionLink>
        </CardContent>
      </div>
    </Card>
  );
}
