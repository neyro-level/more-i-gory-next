import { Container } from "@/components/layout/container";
import { SectionShell } from "@/components/layout/section-shell";
import { ActionLink } from "@/components/navigation/action-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArticleCard } from "./article-card";
import { LeadFormSection } from "./lead-form-section";
import { NumberedSteps } from "./numbered-steps";
import { ProofBlock } from "./proof-block";
import { RegionCard } from "./region-card";
import { RiskBlock } from "./risk-block";
import { ScenarioTable } from "./scenario-table";
import { SourceList } from "./source-list";

export type HomeRegionCardModel = {
  href: string;
  id: string;
  image: {
    alt: string;
    height: number;
    src: string;
    width: number;
  };
  risk: string;
  thesis: string;
  title: string;
};

const capitalTasks = [
  {
    title: "Сохранить капитал",
    text: "Выбрать понятный рынок и объект, где риски владения, юридика и ликвидность не спрятаны за рекламным обещанием.",
  },
  {
    title: "Получать доход",
    text: "Смотреть не на красивую доходность в буклете, а на управление, расходы, сезонность, налоги и реалистичный чистый сценарий.",
  },
  {
    title: "Оставить возможность выхода",
    text: "До сделки понимать, кому и почему объект можно будет продать, какие ограничения есть у формата и локации.",
  },
];

const decisionSteps = [
  "Определить задачу капитала и горизонт.",
  "Сравнить регионы по спросу, бюджету и ограничениям.",
  "Отобрать проекты, где можно проверить факты.",
  "Разобрать экономику, риски и управление.",
  "Сформировать сценарий входа, владения и выхода.",
];

const analytics = [
  {
    href: "/analitika/sochi-ili-krym/",
    title: "Сочи или Крым для инвестиций",
    text: "Как отличаются рынки, ликвидность, сезонность и риски.",
  },
  {
    href: "/analitika/kak-schitat-chistuyu-dohodnost/",
    title: "Как считать чистую доходность",
    text: "Почему gross-доходность не равна деньгам инвестора.",
  },
  {
    href: "/analitika/riski-kurortnyh-apartamentov/",
    title: "Риски курортных апартаментов",
    text: "Оператор, договор, эксплуатация, личное проживание и выход.",
  },
];

export function CapitalTasksSection() {
  return (
    <SectionShell
      eyebrow="Задачи капитала"
      title="Не всем нужен один и тот же объект"
      lead="Инвестиционная недвижимость начинается не с района и цены, а с задачи: сохранить капитал, получать доход, пользоваться объектом самому или выйти через несколько лет."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {capitalTasks.map((task) => (
          <Card key={task.title} className="rounded-card bg-card">
            <CardHeader>
              <CardTitle className="text-h3">{task.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-body-sm text-muted-foreground">{task.text}</CardContent>
          </Card>
        ))}
      </div>
    </SectionShell>
  );
}

export function DecisionSupportSection() {
  const reasons = [
    "Одинаковая цена может означать разные юридические риски, расходы и ликвидность.",
    "Рекламная доходность не показывает сезонность, комиссии, простои и налоги.",
    "Красивое фото не отвечает на вопрос, кто управляет объектом и как из него выйти.",
  ];

  return (
    <SectionShell className="bg-card" contained={false}>
      <Container className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-large bg-surface-dark p-8 text-surface-dark-foreground md:p-10">
          <span className="w-fit rounded-full bg-surface-dark-foreground/10 px-3 py-1 text-caption font-medium text-surface-dark-foreground">
            Почему не каталог
          </span>
          <h2 className="mt-6 text-h2 font-semibold">
            Каталог показывает выбор. Инвестору нужно основание для решения.
          </h2>
        </div>
        <div className="grid gap-4">
          {reasons.map((item) => (
            <div key={item} className="rounded-card bg-background p-6 text-body-lg">
              {item}
            </div>
          ))}
        </div>
      </Container>
    </SectionShell>
  );
}

export function MethodologySection() {
  return (
    <>
      <SectionShell
        eyebrow="Методика"
        title="Пять ступеней инвестиционного решения"
        lead="Эта логика потом раскладывается в региональные страницы, паспорта проектов и аналитические материалы."
        actions={<ActionLink href="/metodika/" variant="outline">Смотреть методику</ActionLink>}
      >
        <NumberedSteps columns={5} items={decisionSteps.map((title) => ({ title }))} />
      </SectionShell>
      <SectionShell rhythm="sm">
        <ProofBlock
          items={[
            { title: "Факты отдельно от прогнозов", text: "Цены, документы, оператор и ограничения фиксируются как факты; будущая доходность описывается только как сценарий." },
            { title: "Риски видны до CTA", text: "Юридические, управленческие и ликвидные ограничения не прячутся внизу страницы." },
            { title: "Дата проверки обязательна", text: "Паспорта и материалы должны иметь verifiedAt или оставаться в draft/review." },
          ]}
        />
      </SectionShell>
    </>
  );
}

export function RegionsSection({ regions }: { regions: HomeRegionCardModel[] }) {
  return (
    <SectionShell
      rhythm="lg"
      eyebrow="Регионы"
      title="Сравниваем море и горы как разные инвестиционные рынки"
      lead="На старте фокус — Сочи, Крым, Архыз и Алтай. Расширение регионов пойдёт только после отдельного SEO и content gate."
      actions={<ActionLink href="/investicionnaya-nedvizhimost/">Сравнить регионы</ActionLink>}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {regions.map((region) => <RegionCard key={region.id} {...region} />)}
      </div>
    </SectionShell>
  );
}

export function ProjectAdmissionSection() {
  return (
    <SectionShell
      className="bg-surface-dark text-surface-dark-foreground"
      tone="dark"
      eyebrow="Отбор проектов"
      title="Проекты появляются на сайте только после инвестиционного паспорта"
      lead="Мы не выводим выдуманные карточки ради объёма. Пока реальные паспорта не согласованы, сайт честно показывает критерии допуска."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {["Документы и формат права", "Экономика владения", "Управление и выход"].map((title) => (
          <Card key={title} className="rounded-card bg-surface-dark-foreground/10 text-surface-dark-foreground ring-surface-dark-foreground/15">
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

export function ProjectPassportSection() {
  return (
    <SectionShell
      eyebrow="Паспорт проекта"
      title="Один проект — один проверяемый вывод"
      lead="Паспорт проекта должен отвечать не только “сколько стоит”, но и “почему это может подойти именно под эту инвестиционную задачу”."
    >
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <RiskBlock title="Без полного паспорта проект остаётся draft" text="Нужны факты, бюджет, риски, источники, verifiedAt и понятный сценарий выхода. Иначе объект не попадает в sitemap и не получает коммерческий SEO-трафик." />
        <ScenarioTable rows={[
          { scenario: "Консервативный", assumption: "Спрос ниже ожиданий, расходы выше базового сценария.", investorQuestion: "Сохраняется ли смысл владения объектом?" },
          { scenario: "Базовый", assumption: "Управление и сезонность соответствуют подтверждённым данным.", investorQuestion: "Понятна ли чистая экономика после расходов?" },
          { scenario: "Оптимистичный", assumption: "Рынок и оператор дают лучший сценарий, но без гарантии результата.", investorQuestion: "Не переплачиваем ли за ожидание роста?" },
        ]} />
      </div>
    </SectionShell>
  );
}

export function AnalyticsSection() {
  return (
    <SectionShell className="bg-card" eyebrow="Аналитика" title="Статьи добирают информационный спрос и ведут к коммерческим страницам" lead="Блог нужен не как новостная лента, а как слой объяснения: сравнение регионов, расчёт доходности, риски апартаментов, операторы и ликвидность.">
      <div className="grid gap-5 md:grid-cols-3">
        {analytics.map((item) => <ArticleCard key={item.href} description={item.text} href={item.href} status="draft / noindex до редакционной проверки" title={item.title} />)}
      </div>
    </SectionShell>
  );
}

export function ResponsibilitySection() {
  return (
    <>
      <SectionShell eyebrow="Ответственность" title="Мы не обещаем результат. Мы показываем, на чём держится решение">
        <SourceList items={[
          { title: "Методика отбора", description: "Фиксирует, какие данные нужны до публикации региона, проекта или статьи." },
          { title: "Content gate", description: "Не позволяет выводить в индекс тонкие страницы, юридические черновики и непроверенные проекты." },
          { title: "Human gate", description: "Сильные заявления о компании, команда, реальные проекты, SLA и legal-тексты подтверждаются отдельно." },
        ]} />
      </SectionShell>
      <SectionShell rhythm="sm"><LeadFormSection /></SectionShell>
    </>
  );
}
