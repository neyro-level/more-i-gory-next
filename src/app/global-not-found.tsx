import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./(site)/globals.css";
import { Container } from "@/components/layout/container";
import { ActionLink } from "@/components/navigation/action-link";
import { cn } from "@/lib/utils";

const montserrat = Montserrat({
  display: "swap",
  fallback: ["Arial", "sans-serif"],
  subsets: ["cyrillic"],
  style: "normal",
  variable: "--font-montserrat",
  weight: "variable",
});

export const metadata: Metadata = {
  robots: { follow: true, index: false },
  title: "Страница не найдена | Море и Горы",
};

export default function GlobalNotFound() {
  return (
    <html lang="ru" className={cn("font-sans", montserrat.variable)}>
      <body>
        <main className="py-24">
          <Container size="narrow" className="text-center">
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
          </Container>
        </main>
      </body>
    </html>
  );
}
