"use client";

import { SectionShell } from "@/components/layout/section-shell";
import { Button } from "@/components/ui/button";

export default function SiteError({ reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <main>
      <SectionShell
        className="text-center"
        eyebrow="Ошибка загрузки"
        lead="Обновите раздел ещё раз. Если ошибка повторится, вернитесь на главную и попробуйте позже."
        rhythm="lg"
        title="Не удалось показать страницу"
      >
        <Button onClick={reset}>Повторить</Button>
      </SectionShell>
    </main>
  );
}
