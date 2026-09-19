import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadForm } from "@/components/marketing/lead-form";
import { NumberedSteps } from "@/components/marketing/numbered-steps";

export const metadata = getStaticMetadata("PAGE-019");

const steps = [
  "фиксируем задачу капитала",
  "сравниваем регионы и форматы",
  "отсекаем неподходящие сценарии",
  "готовим следующий список вопросов или shortlist",
];

export default function SelectionPage() {
  const seo = getSeoEntry("PAGE-019");

  return (
    <main>
      <PageHero
        eyebrow="Персональный инвестиционный разбор"
        title={seo.h1}
        lead="Подбор начинается с задачи: зачем вы входите в курортную недвижимость, какой горизонт рассматриваете и какой уровень риска допустим."
        primaryCta={{ href: "#form", label: "Описать задачу" }}
        secondaryCta={{ href: "/metodika/", label: "Посмотреть методику" }}
        image={{
          alt: "Панорамный вид курортного побережья для сайта Море и Горы",
          height: 1524,
          src: "/images/og/default.webp",
          width: 2560,
        }}
        proof="Реальный SLA, модель оплаты и Leads API включаются только после human gate."
      />

      <SectionShell eyebrow="Процесс" title="Что произойдёт после обращения">
        <NumberedSteps columns={4} items={steps.map((title) => ({ title }))} />
      </SectionShell>

      <SectionShell id="form" rhythm="sm" eyebrow="Форма" title="Опишите инвестиционную задачу" lead="Форма уже проверяет поля на клиенте, но реальная отправка отключена до согласования юридических текстов и production Leads API.">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="rounded-large bg-surface-dark text-surface-dark-foreground">
            <CardHeader>
              <CardTitle className="text-h3">Что лучше указать</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-body-sm text-surface-dark-foreground/70">
              <p>Регион или несколько регионов.</p>
              <p>Примерный бюджет и горизонт.</p>
              <p>Цель: доход, сохранение, личное использование, выход.</p>
              <p>Какие объекты уже смотрели и что вызывает сомнения.</p>
            </CardContent>
          </Card>
          <LeadForm sourcePath="/podbor/" />
        </div>
      </SectionShell>
    </main>
  );
}
