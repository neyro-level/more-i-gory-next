import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadForm } from "@/ui/interactive/lead-form";

export const metadata = getStaticMetadata("PAGE-021");

export default function ContactsPage() {
  const seo = getSeoEntry("PAGE-021");

  return (
    <main>
      <PageHero
        eyebrow="Контакты"
        title={seo.h1}
        lead="Связь с бюро должна быть понятной: что отправить, куда попадёт заявка и какой следующий шаг. Боевые контакты и карта добавляются после проверки."
        primaryCta={{ href: "#form", label: "Написать о задаче" }}
        secondaryCta={{ href: "/podbor/", label: "Перейти к подбору" }}
        image={{
          alt: "Панорамный вид курортного побережья для сайта Море и Горы",
          height: 1524,
          src: "/images/og/default.webp",
          width: 2560,
        }}
        proof="Яндекс iframe-карта появится только после подтверждения адреса; до клика карта не будет грузить JS."
      />

      <SectionShell eyebrow="Каналы" title="Что нужно подтвердить перед публикацией">
        <div className="grid gap-5 md:grid-cols-3">
          {["телефон и мессенджер", "email и ответственный", "адрес и карта"].map((item) => (
            <Card key={item} className="rounded-surface bg-white">
              <CardHeader>
                <CardTitle className="text-2xl">{item}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-7 text-muted-foreground">
                TODO после human gate: подтвердить актуальность, SLA ответа и соответствие юридическим текстам.
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>

      <SectionShell id="form" className="pt-0" eyebrow="Обращение" title="Опишите задачу">
        <LeadForm />
      </SectionShell>
    </main>
  );
}
