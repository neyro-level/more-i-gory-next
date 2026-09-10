import Link from "next/link";
import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { Card, CardContent } from "@/components/ui/card";
import { ScenarioTable } from "@/components/marketing/scenario-table";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
    <main>
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
        proof="Полная методика публикуется после human gate; текущий экран фиксирует структуру и ограничения."
      />

      <SectionShell
        eyebrow="Каркас проверки"
        title="Что проверяется до инвестиционного вывода"
      >
        <div className="grid gap-4 md:grid-cols-5">
          {checks.map((item, index) => (
            <Card key={item} className="rounded-[1.5rem] bg-white">
              <CardContent className="space-y-4 p-5">
                <span className="grid size-9 place-items-center rounded-full bg-brand-coral text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm font-semibold leading-6">{item}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
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

      <SectionShell className="pt-0">
        <Link href="/podbor/" className={cn(buttonVariants({ size: "lg" }), "rounded-full bg-brand-navy px-6 text-white hover:bg-brand-navy/90")}>
          Получить разбор по методике
        </Link>
      </SectionShell>

      <SectionShell className="pt-0">
        <LeadFormSection title="Разобрать объект по методике" />
      </SectionShell>
    </main>
  );
}
