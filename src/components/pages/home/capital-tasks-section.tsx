import { SectionShell } from "@/components/layout/section-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { capitalTasks } from "@/content/home/home-content";

export function CapitalTasksSection() {
  return (
    <SectionShell
      eyebrow="Задачи капитала"
      title="Не всем нужен один и тот же объект"
      lead="Инвестиционная недвижимость начинается не с района и цены, а с задачи: сохранить капитал, получать доход, пользоваться объектом самому или выйти через несколько лет."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {capitalTasks.map((task) => (
          <Card className="bg-card" key={task.title} radius="card">
            <CardHeader><CardTitle className="text-h3">{task.title}</CardTitle></CardHeader>
            <CardContent className="text-body-sm text-muted-foreground">{task.text}</CardContent>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}
