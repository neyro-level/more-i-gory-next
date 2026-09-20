import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PreviewTemplateScaffold } from "@/components/preview/preview-template-scaffold";
import { isEditorialPreviewEnabled } from "@/core/data-access/preview/editorial-preview";

export const metadata: Metadata = {
  title: "Шаблон застройщика — технический preview | Море и Горы",
  robots: { index: false, follow: false },
};

export default function PreviewDeveloperPage() {
  if (!isEditorialPreviewEnabled()) notFound();

  return (
    <PreviewTemplateScaffold
      eyebrow="Шаблон страницы застройщика"
      title="Профиль застройщика для последующего наполнения"
      lead="Здесь будет профиль реального застройщика после проверки юридического лица, опыта, проектов, документов и связанных рисков."
      plannedBlocks={["Юридические сведения", "Опыт и проекты", "Строящиеся ЖК", "Документы", "Риски", "Источники и дата проверки"]}
      backHref="/novostroyki/"
      backLabel="Вернуться к новостройкам"
    />
  );
}
