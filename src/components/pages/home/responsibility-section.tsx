import { SectionShell } from "@/components/layout/section-shell";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import { SourceList } from "@/components/marketing/source-list";
import { responsibilitySources } from "@/content/home/home-content";

export function ResponsibilitySection() {
  return (
    <>
      <SectionShell eyebrow="Ответственность" title="Мы не обещаем результат. Мы показываем, на чём держится решение">
        <SourceList items={[...responsibilitySources]} />
      </SectionShell>
      <SectionShell rhythm="sm"><LeadFormSection /></SectionShell>
    </>
  );
}
