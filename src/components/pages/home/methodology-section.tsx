import { SectionShell } from "@/components/layout/section-shell";
import { NumberedSteps } from "@/components/marketing/numbered-steps";
import { ProofBlock } from "@/components/marketing/proof-block";
import { ActionLink } from "@/components/navigation/action-link";
import { decisionSteps } from "@/content/home/home-content";

export function MethodologySection() {
  return (
    <>
      <SectionShell
        actions={<ActionLink href="/metodika/" variant="outline">Смотреть методику</ActionLink>}
        eyebrow="Методика"
        lead="Эта логика раскладывается в региональные обзоры, паспорта проектов и аналитические материалы."
        title="Пять ступеней инвестиционного решения"
      >
        <NumberedSteps columns={5} items={decisionSteps.map((title) => ({ title }))} />
      </SectionShell>
      <SectionShell rhythm="sm">
        <ProofBlock items={[
          { title: "Факты отдельно от прогнозов", text: "Цены, документы, оператор и ограничения фиксируются как факты; будущая доходность описывается только как сценарий." },
          { title: "Риски видны до обращения", text: "Юридические, управленческие и ликвидные ограничения не прячутся внизу страницы." },
          { title: "Актуальность обязательна", text: "Паспорта и материалы содержат дату проверки или не публикуются как готовые рекомендации." },
        ]} />
      </SectionShell>
    </>
  );
}
