import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { SectionShell } from "@/components/layout/section-shell";

export const metadata = getStaticMetadata("PAGE-022");

export default function PrivacyPage() {
  const seo = getSeoEntry("PAGE-022");

  return (
    <main>
      <SectionShell headingLevel={1} eyebrow="Юридический документ" title={seo.h1} lead="Юридический текст не опубликован до согласования. Эта страница закрыта от индексации и не заменяет политику конфиденциальности.">
        <div className="rounded-feature bg-white p-6 text-sm leading-7 text-muted-foreground md:p-8">
          Human gate: оператор данных, фактические поля формы, цели обработки, системы хранения, аналитика, срок хранения и контакты для обращений.
        </div>
      </SectionShell>
    </main>
  );
}
