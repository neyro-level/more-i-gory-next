import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { ActionLink } from "@/components/navigation/action-link";

export const metadata: Metadata = {
  robots: { follow: true, index: false },
  title: "Страница не найдена | Море и Горы",
};

export default function NotFound() {
  return (
    <main className="py-24">
      <Container className="max-w-3xl text-center">
        <p className="text-caption font-semibold uppercase tracking-eyebrow text-action">Ошибка 404</p>
        <h1 className="mt-4 text-h1 font-semibold text-surface-dark">
          Такой страницы нет
        </h1>
        <p className="mx-auto mt-6 max-w-narrow text-body text-muted-foreground">
          Адрес мог измениться или быть введён с ошибкой. Вернитесь на главную или перейдите к сравнению регионов.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ActionLink href="/">На главную</ActionLink>
          <ActionLink href="/investicionnaya-nedvizhimost/" variant="outline">Сравнить регионы</ActionLink>
        </div>
      </Container>
    </main>
  );
}
