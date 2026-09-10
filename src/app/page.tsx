import { getStaticMetadata } from "@/seo/metadata";
import Link from "next/link";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { RegionCard } from "@/components/marketing/region-card";
import { ProofBlock } from "@/components/marketing/proof-block";
import { RiskBlock } from "@/components/marketing/risk-block";
import { ScenarioTable } from "@/components/marketing/scenario-table";
import { SourceList } from "@/components/marketing/source-list";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { cn } from "@/lib/utils";
import { contentService } from "@/content/service";

export const metadata = getStaticMetadata("PAGE-001");

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

export default async function HomePage() {
  const regions = await contentService.listRegions();
  const regionCards = await Promise.all(
    regions.map(async (region) => {
      const media = await contentService.getMediaAsset(region.heroMediaId);
      return { media, region };
    }),
  );

  return (
    <main className="overflow-hidden">
      <PageHero
        eyebrow="Инвестиционное бюро курортной недвижимости"
        title="Курортная недвижимость для инвестиций — с понятной экономикой и рисками"
        lead="Сравниваем Сочи, Крым, Архыз и Алтай, чтобы до сделки было видно: зачем заходить в проект, где ограничения и какой сценарий выхода реалистичен."
        primaryCta={{ href: "/podbor/", label: "Получить инвестиционный разбор" }}
        secondaryCta={{ href: "/investicionnaya-nedvizhimost/", label: "Сравнить регионы" }}
        image={{
          alt: "Панорамный вид курортного побережья для сайта Море и Горы",
          height: 1524,
          src: "/images/og/default.webp",
          width: 2560,
        }}
        proof="Без обещаний гарантированной доходности: сначала факты, риски, экономика и сценарий выхода."
      />

      <SectionShell
        eyebrow="Задачи капитала"
        title="Не всем нужен один и тот же объект"
        lead="Инвестиционная недвижимость начинается не с района и цены, а с задачи: сохранить капитал, получать доход, пользоваться объектом самому или выйти через несколько лет."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {capitalTasks.map((task) => (
            <Card key={task.title} className="rounded-[1.5rem] bg-white">
              <CardHeader>
                <CardTitle className="text-2xl">{task.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">{task.text}</CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="bg-white" contained={false}>
        <div className="mx-auto grid max-w-[1200px] gap-8 px-5 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div className="rounded-[2rem] bg-brand-navy p-8 text-white md:p-10">
            <Badge className="rounded-full bg-white/10 text-white">Почему не каталог</Badge>
            <h2 className="mt-6 text-3xl font-semibold md:text-5xl">Каталог показывает выбор. Инвестору нужно основание для решения.</h2>
          </div>
          <div className="grid gap-4">
            {[
              "Одинаковая цена может означать разные юридические риски, расходы и ликвидность.",
              "Рекламная доходность не показывает сезонность, комиссии, простои и налоги.",
              "Красивое фото не отвечает на вопрос, кто управляет объектом и как из него выйти.",
            ].map((item) => (
              <div key={item} className="rounded-[1.5rem] bg-background p-6 text-lg leading-8">
                {item}
              </div>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Методика"
        title="Пять ступеней инвестиционного решения"
        lead="Эта логика потом раскладывается в региональные страницы, паспорта проектов и аналитические материалы."
        actions={
          <Link href="/metodika/" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}>
            Смотреть методику
          </Link>
        }
      >
        <div className="grid gap-4 lg:grid-cols-5">
          {decisionSteps.map((step, index) => (
            <Card key={step} className="rounded-[1.5rem] bg-white">
              <CardContent className="space-y-5 p-6">
                <span className="grid size-10 place-items-center rounded-full bg-brand-coral text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-base font-semibold leading-7">{step}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell className="pt-0">
        <ProofBlock
          items={[
            {
              title: "Факты отдельно от прогнозов",
              text: "Цены, документы, оператор и ограничения фиксируются как факты; будущая доходность описывается только как сценарий.",
            },
            {
              title: "Риски видны до CTA",
              text: "Юридические, управленческие и ликвидные ограничения не прячутся внизу страницы.",
            },
            {
              title: "Дата проверки обязательна",
              text: "Паспорта и материалы должны иметь verifiedAt или оставаться в draft/review.",
            },
          ]}
        />
      </SectionShell>

      <SectionShell
        eyebrow="Регионы"
        title="Сравниваем море и горы как разные инвестиционные рынки"
        lead="На старте фокус — Сочи, Крым, Архыз и Алтай. Расширение регионов пойдёт только после отдельного SEO и content gate."
        actions={
          <Link href="/investicionnaya-nedvizhimost/" className={cn(buttonVariants({ size: "lg" }), "rounded-full bg-brand-navy px-6 text-white hover:bg-brand-navy/90")}>
            Сравнить регионы
          </Link>
        }
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {regionCards.map(({ media, region }) => (
            <RegionCard
              key={region.id}
              href={region.path}
              image={{
                alt: media?.alt ?? region.title,
                height: media?.height ?? 1524,
                src: media?.src ?? "/images/og/default.webp",
                width: media?.width ?? 2560,
              }}
              risk={region.riskSummary}
              thesis={region.investmentThesis}
              title={region.title}
            />
          ))}
        </div>
      </SectionShell>

      <SectionShell
        className="bg-brand-navy text-white"
        eyebrow="Отбор проектов"
        title="Проекты появляются на сайте только после инвестиционного паспорта"
        lead="Мы не выводим выдуманные карточки ради объёма. Пока реальные паспорта не согласованы, сайт честно показывает критерии допуска."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {["Документы и формат права", "Экономика владения", "Управление и выход"].map((title) => (
            <Card key={title} className="rounded-[1.5rem] bg-white/10 text-white ring-white/15">
              <CardHeader>
                <CardTitle className="text-2xl">{title}</CardTitle>
                <CardDescription className="text-white/65">Обязательный критерий перед публикацией проекта.</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Паспорт проекта"
        title="Один проект — один проверяемый вывод"
        lead="Паспорт проекта должен отвечать не только “сколько стоит”, но и “почему это может подойти именно под эту инвестиционную задачу”."
      >
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <RiskBlock
            title="Без полного паспорта проект остаётся draft"
            text="Нужны факты, бюджет, риски, источники, verifiedAt и понятный сценарий выхода. Иначе объект не попадает в sitemap и не получает коммерческий SEO-трафик."
          />
          <ScenarioTable
            rows={[
              {
                scenario: "Консервативный",
                assumption: "Спрос ниже ожиданий, расходы выше базового сценария.",
                investorQuestion: "Сохраняется ли смысл владения объектом?",
              },
              {
                scenario: "Базовый",
                assumption: "Управление и сезонность соответствуют подтверждённым данным.",
                investorQuestion: "Понятна ли чистая экономика после расходов?",
              },
              {
                scenario: "Оптимистичный",
                assumption: "Рынок и оператор дают лучший сценарий, но без гарантии результата.",
                investorQuestion: "Не переплачиваем ли за ожидание роста?",
              },
            ]}
          />
        </div>
      </SectionShell>

      <SectionShell
        className="bg-white"
        eyebrow="Аналитика"
        title="Статьи добирают информационный спрос и ведут к коммерческим страницам"
        lead="Блог нужен не как новостная лента, а как слой объяснения: сравнение регионов, расчёт доходности, риски апартаментов, операторы и ликвидность."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {analytics.map((item) => (
            <Card key={item.href} className="rounded-[1.5rem]">
              <CardHeader>
                <CardTitle className="text-2xl">
                  <Link href={item.href}>{item.title}</Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 text-sm leading-7 text-muted-foreground">
                <p>{item.text}</p>
                <p className="text-xs uppercase tracking-[0.18em] text-brand-coral">draft / noindex до редакционной проверки</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        eyebrow="Ответственность"
        title="Мы не обещаем результат. Мы показываем, на чём держится решение"
      >
        <SourceList
          items={[
            {
              title: "Методика отбора",
              description: "Фиксирует, какие данные нужны до публикации региона, проекта или статьи.",
            },
            {
              title: "Content gate",
              description: "Не позволяет выводить в индекс тонкие страницы, юридические черновики и непроверенные проекты.",
            },
            {
              title: "Human gate",
              description: "Сильные заявления о компании, команда, реальные проекты, SLA и legal-тексты подтверждаются отдельно.",
            },
          ]}
        />
      </SectionShell>

      <SectionShell className="pt-0">
        <LeadFormSection />
      </SectionShell>
    </main>
  );
}
