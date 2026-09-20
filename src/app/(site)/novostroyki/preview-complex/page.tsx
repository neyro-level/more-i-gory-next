import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PreviewTemplateScaffold } from "@/components/preview/preview-template-scaffold";
import { isEditorialPreviewEnabled } from "@/core/data-access/preview/editorial-preview";

export const metadata: Metadata = {
  title: "Шаблон карточки ЖК — технический preview | Море и Горы",
  robots: { index: false, follow: false },
};

export default function PreviewComplexPage() {
  if (!isEditorialPreviewEnabled()) notFound();

  return (
    <PreviewTemplateScaffold
      eyebrow="Шаблон жилого комплекса"
      title="Страница ЖК для последующего наполнения"
      lead="Здесь появится карточка реального жилого комплекса после проверки застройщика, корпусов, документов, планировок и доступного inventory."
      plannedBlocks={["О комплексе", "Застройщик", "Корпуса", "Планировки", "Документы", "Риски и следующий шаг"]}
      backHref="/novostroyki/"
      backLabel="Вернуться к новостройкам"
    />
  );
}
