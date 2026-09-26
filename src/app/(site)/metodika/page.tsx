import { ActionLink } from "@/components/navigation/action-link";
import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { ScenarioTable } from "@/components/marketing/scenario-table";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { NumberedSteps } from "@/components/marketing/numbered-steps";

export const metadata = getStaticMetadata("PAGE-018");

const checks = [
  "задача капитала и горизонт",
  "регион и ликвидность",
  "правовая модель и документы",
  "управление, расходы и оператор",
  "сценарий входа, владения и выхода",
];

export default function MethodPage() {
  const seo = getSeoEntry("PAGE-018");

  return (
    <main id="main">
      <PageHero
        eyebrow="Методика инвестиционного отбора"
        title={seo.h1}
        lead="Методика нужна, чтобы сравнивать проекты не по рекламным обещаниям, а по задаче капитала, фактам, рискам, экономике и сценарию выхода."
        primaryCta={{ href: "/podbor/", label: "Применить методику к задаче" }}
        secondaryCta={{ href: "/analitika/", label: "Читать аналитику" }}
        image={{
          alt: "Панорамный вид курортного побережья для сайта Море и Горы",
          height: 1524,
          src: "/images/og/default.webp",
          width: 2560,
        }}
        proof="Методика отделяет подтверждённые факты от предположений и помогает сравнивать варианты по единым критериям."
      />

      <SectionShell
        eyebrow="Каркас проверки"
        title="Что проверяется до инвестиционного вывода"
      >
        <NumberedSteps columns={5} items={checks.map((title) => ({ title }))} />
      </SectionShell>

      <SectionShell rhythm="sm">
        <ScenarioTable
          rows={[
            {
              scenario: "До выбора региона",
              assumption: "Есть задача капитала, но нет рынка.",
              investorQuestion: "Какой регион лучше соответствует горизонту и риску?",
            },
            {
              scenario: "До выбора проекта",
              assumption: "Регион выбран, но объекты несопоставимы.",
              investorQuestion: "Где экономика и документы проверяются лучше?",
            },
            {
              scenario: "До сделки",
              assumption: "Проект интересен, но решение ещё не принято.",
              investorQuestion: "Какие риски могут изменить решение?",
            },
          ]}
        />
      </SectionShell>

      <SectionShell rhythm="sm">
        <ActionLink href="/podbor/">
          Получить разбор по методике
        </ActionLink>
      </SectionShell>

      <SectionShell rhythm="sm">
        <LeadFormSection title="Разобрать объект по методике" />
      </SectionShell>
    </main>
  );
}
