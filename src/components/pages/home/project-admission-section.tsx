import { SectionShell } from "@/components/layout/section-shell";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { projectAdmissionCriteria } from "@/content/home/home-content";

export function ProjectAdmissionSection() {
  return (
    <SectionShell
      className="bg-surface-dark text-surface-dark-foreground"
      eyebrow="Отбор проектов"
      lead="Мы не выводим выдуманные карточки ради объёма. Пока реальные паспорта не согласованы, сайт честно показывает критерии допуска."
      title="Проекты появляются на сайте только после инвестиционного паспорта"
      tone="dark"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {projectAdmissionCriteria.map((title) => (
          <Card className="bg-surface-dark-foreground/10 text-surface-dark-foreground ring-surface-dark-foreground/15" key={title} radius="card">
            <CardHeader>
              <CardTitle className="text-h3">{title}</CardTitle>
              <CardDescription className="text-surface-dark-foreground/65">Обязательный критерий перед публикацией проекта.</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}
