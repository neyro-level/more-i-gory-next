import { SectionShell } from "@/components/layout/section-shell";
import { RiskBlock } from "@/components/marketing/risk-block";
import { ScenarioTable } from "@/components/marketing/scenario-table";
import { passportScenarios } from "@/content/home/home-content";

export function ProjectPassportSection() {
  return (
    <SectionShell
      eyebrow="Паспорт проекта"
      lead="Паспорт проекта должен отвечать не только «сколько стоит», но и «почему это может подойти именно под эту инвестиционную задачу»."
      title="Один проект — один проверяемый вывод"
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <RiskBlock
          text="Нужны факты, бюджет, риски, источники, дата проверки и понятный сценарий выхода. Иначе объект не публикуется на сайте."
          title="Без полного паспорта проект не публикуется"
        />
        <ScenarioTable rows={[...passportScenarios]} />
      </div>
    </SectionShell>
  );
}
