import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { SectionShell } from "@/components/layout/section-shell";

export const metadata = getStaticMetadata("PAGE-023");

export default function ConsentPage() {
  const seo = getSeoEntry("PAGE-023");

  return (
    <main>
      <SectionShell eyebrow="Юридический документ" title={seo.h1} lead="Текст согласия не опубликован до юридического согласования. Эта страница закрыта от индексации и не заменяет согласие пользователя.">
        <div className="rounded-[1.75rem] bg-white p-6 text-sm leading-7 text-muted-foreground md:p-8">
          Human gate: оператор данных, перечень данных, цели, действия с данными, срок согласия, порядок отзыва и версия согласия.
        </div>
      </SectionShell>
    </main>
  );
}
