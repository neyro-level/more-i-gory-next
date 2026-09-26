import type { Metadata } from "next";

import "./(site)/globals.css";
import { SectionShell } from "@/components/layout/section-shell";
import { ActionLink } from "@/components/navigation/action-link";
import { cn } from "@/lib/utils";
import { montserrat } from "@/app/fonts";

export const metadata: Metadata = {
  robots: { follow: true, index: false },
  title: "Страница не найдена | Море и Горы",
};

export default function GlobalNotFound() {
  return (
    <html lang="ru" className={cn("font-sans", montserrat.variable)}>
      <body>
        <main id="main">
          <SectionShell rhythm="lg" className="text-center">
            <p className="text-caption font-semibold uppercase tracking-eyebrow text-action">Ошибка 404</p>
            <h1 className="mt-4 text-h1 font-semibold text-surface-dark">Такой страницы нет</h1>
            <p className="mx-auto mt-6 max-w-narrow text-body text-muted-foreground">
              Адрес мог измениться или быть введён с ошибкой. Вернитесь на главную или перейдите к сравнению регионов.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ActionLink href="/">На главную</ActionLink>
              <ActionLink href="/investicionnaya-nedvizhimost/" variant="outline">
                Сравнить регионы
              </ActionLink>
            </div>
          </SectionShell>
        </main>
      </body>
    </html>
  );
}
