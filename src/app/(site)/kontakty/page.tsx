import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadForm } from "@/components/marketing/lead-form";

export const metadata = getStaticMetadata("PAGE-021");

export default function ContactsPage() {
  const seo = getSeoEntry("PAGE-021");

  return (
    <main>
      <PageHero
        eyebrow="Контакты"
        title={seo.h1}
        lead="Связаться с бюро можно по телефону, email или через форму. Опишите задачу, регион и удобный способ связи — без передачи паспортных, банковских и других избыточных данных."
        primaryCta={{ href: "#form", label: "Написать о задаче" }}
        secondaryCta={{ href: "/podbor/", label: "Перейти к подбору" }}
        image={{
          alt: "Панорамный вид курортного побережья для сайта Море и Горы",
          height: 1524,
          src: "/images/og/default.webp",
          width: 2560,
        }}
        proof="Публичные реквизиты сверены с юридическими данными оператора. Мессенджеры и гарантированный срок ответа пока не заявляются."
      />

      <SectionShell eyebrow="Каналы" title="Публичные контакты">
        <div className="grid gap-5 md:grid-cols-3">
          <Card className="rounded-card bg-card">
            <CardHeader>
              <CardTitle className="text-h3">Телефон</CardTitle>
            </CardHeader>
            <CardContent className="text-body-sm text-muted-foreground">
              <a className="text-link underline-offset-4 hover:underline" href="tel:+79646686681">
                +7 964 668-66-81
              </a>
            </CardContent>
          </Card>

          <Card className="rounded-card bg-card">
            <CardHeader>
              <CardTitle className="text-h3">Email</CardTitle>
            </CardHeader>
            <CardContent className="text-body-sm text-muted-foreground">
              <a className="text-link break-all underline-offset-4 hover:underline" href="mailto:moregory-info@yandex.com">
                moregory-info@yandex.com
              </a>
            </CardContent>
          </Card>

          <Card className="rounded-card bg-card">
            <CardHeader>
              <CardTitle className="text-h3">Офис и режим работы</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-body-sm text-muted-foreground">
              <p>Республика Крым, Ялта, Набережная им. В. И. Ленина, 13.</p>
              <p>Пн–Пт 9:00–18:00, Сб 9:00–14:00.</p>
            </CardContent>
          </Card>
        </div>
        <p className="mt-5 max-w-3xl text-body-sm text-muted-foreground">
          Визит в офис и срок первого ответа заранее не обещаются: сначала согласуйте удобное время по телефону, email или через форму.
        </p>
      </SectionShell>

      <SectionShell id="form" rhythm="sm" eyebrow="Обращение" title="Опишите задачу">
        <LeadForm sourcePath="/kontakty/" />
      </SectionShell>
    </main>
  );
}
