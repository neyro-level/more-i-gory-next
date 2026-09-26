import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { ProofBlock } from "@/components/marketing/proof-block";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = getStaticMetadata("PAGE-020");

export default function CompanyPage() {
  const seo = getSeoEntry("PAGE-020");

  return (
    <main id="main">
      <PageHero
        eyebrow="О компании"
        title={seo.h1}
        lead="«Море и Горы» позиционируется как инвестиционное бюро курортной недвижимости: фокус не на объёме каталога, а на объяснимом решении до сделки."
        primaryCta={{ href: "/podbor/", label: "Обсудить задачу" }}
        secondaryCta={{ href: "/metodika/", label: "Смотреть подход" }}
        image={{
          alt: "Панорамный вид курортного побережья для сайта Море и Горы",
          height: 1524,
          src: "/images/og/default.webp",
          width: 2560,
        }}
        proof="Подтверждены юридический оператор и имя основателя. Биографии, стаж, количество сделок, кейсы и показатели результата без источников не публикуются."
      />

      <SectionShell eyebrow="Подтверждённые сведения" title="Кто отвечает за работу бюро">
        <div className="grid gap-5 md:grid-cols-2">
          <Card radius="card" className="bg-card">
            <CardHeader>
              <CardTitle className="text-h3">Основатель и директор</CardTitle>
            </CardHeader>
            <CardContent className="text-body-sm text-muted-foreground">
              Колобова Ольга Викторовна. Профессиональная биография и количественные показатели опыта не публикуются без отдельного подтверждения.
            </CardContent>
          </Card>

          <Card radius="card" className="bg-card">
            <CardHeader>
              <CardTitle className="text-h3">Юридический оператор</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-body-sm text-muted-foreground">
              <p>Индивидуальный предприниматель Колобова Ольга Викторовна.</p>
              <p>ОГРНИП 326237500327180, ИНН 352816594112.</p>
            </CardContent>
          </Card>
        </div>
      </SectionShell>

      <SectionShell eyebrow="Принципы" title="На чём строится подход бюро">
        <ProofBlock
          title={null}
          items={[
            {
              title: "Без гарантированной доходности",
              text: "Будущие показатели описываются как сценарии, а не обещания результата.",
            },
            {
              title: "Риск до заявки",
              text: "Ограничения региона, формата и проекта выводятся до CTA, а не прячутся внизу страницы.",
            },
            {
              title: "Паспорта вместо витрины",
              text: "Проект публикуется только после проверки фактов, источников и инвестиционного вывода.",
            },
          ]}
        />
      </SectionShell>

      <SectionShell rhythm="sm">
        <LeadFormSection title="Понять, подходит ли наш подход" />
      </SectionShell>
    </main>
  );
}
