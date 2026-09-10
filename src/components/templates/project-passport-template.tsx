import { PageHero } from "@/components/marketing/page-hero";
import { SectionShell } from "@/components/layout/section-shell";
import { RiskBlock } from "@/components/marketing/risk-block";
import { SourceList } from "@/components/marketing/source-list";
import { LeadFormSection } from "@/components/marketing/lead-form-section";
import type { MediaAssetDTO, ProjectDTO } from "@/content/domain/types";

type ProjectPassportTemplateProps = {
  media: MediaAssetDTO | null;
  project: ProjectDTO;
};

export function ProjectPassportTemplate({ media, project }: ProjectPassportTemplateProps) {
  return (
    <main>
      <PageHero
        eyebrow="Инвестиционный паспорт проекта"
        title={`${project.title} — инвестиционный паспорт`}
        lead={project.verdict}
        primaryCta={{ href: "/podbor/", label: "Обсудить проект" }}
        secondaryCta={{ href: "/obekty/", label: "Вернуться к объектам" }}
        image={{
          alt: media?.alt ?? project.title,
          height: media?.height ?? 1000,
          src: media?.src ?? "/images/projects/sample-resort/cover.webp",
          width: media?.width ?? 1478,
        }}
        proof={`Проверено: ${project.verifiedAt}`}
      />

      <SectionShell eyebrow="Факты" title="Что подтверждено в паспорте">
        <SourceList items={project.facts.map((fact) => ({ title: fact }))} />
      </SectionShell>

      <SectionShell className="pt-0">
        <RiskBlock title="Ключевой риск" text={project.riskSummary} />
      </SectionShell>

      <SectionShell className="pt-0">
        <LeadFormSection title="Получить разбор этого проекта" />
      </SectionShell>
    </main>
  );
}
