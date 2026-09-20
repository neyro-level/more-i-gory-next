import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PreviewTemplateScaffold } from "@/components/preview/preview-template-scaffold";
import { isEditorialPreviewEnabled } from "@/core/data-access/preview/editorial-preview";

export const metadata: Metadata = {
  title: "Шаблон паспорта проекта — технический preview | Море и Горы",
  robots: { index: false, follow: false },
};

export default function PreviewProjectPage() {
  if (!isEditorialPreviewEnabled()) notFound();

  return (
    <PreviewTemplateScaffold
      eyebrow="Шаблон инвестиционного паспорта"
      title="Страница проекта для последующего наполнения"
      lead="Здесь будет паспорт реального проекта после получения документов, источников, актуальных условий и разрешённых изображений."
      plannedBlocks={["Инвестиционный вывод", "Факты и документы", "Экономика", "Риски", "Управление", "Источники и дата проверки"]}
      backHref="/obekty/"
      backLabel="Вернуться к объектам"
    />
  );
}
