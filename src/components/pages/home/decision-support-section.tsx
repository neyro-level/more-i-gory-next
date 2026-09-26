import { Container } from "@/components/layout/container";
import { SectionShell } from "@/components/layout/section-shell";

const reasons = [
  "Одинаковая цена может означать разные юридические риски, расходы и ликвидность.",
  "Рекламная доходность не показывает сезонность, комиссии, простои и налоги.",
  "Красивое фото не отвечает на вопрос, кто управляет объектом и как из него выйти.",
] as const;

export function DecisionSupportSection() {
  return (
    <SectionShell className="bg-card" contained={false}>
      <Container className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-large bg-surface-dark p-8 text-surface-dark-foreground md:p-10">
          <span className="w-fit rounded-full bg-surface-dark-foreground/10 px-3 py-1 text-caption font-medium text-surface-dark-foreground">Почему не каталог</span>
          <h2 className="mt-6 text-h2 font-semibold">Каталог показывает выбор. Инвестору нужно основание для решения.</h2>
        </div>
        <div className="grid gap-4">
          {reasons.map((item) => <div className="rounded-card bg-background p-6 text-body-lg" key={item}>{item}</div>)}
        </div>
      </Container>
    </SectionShell>
  );
}
