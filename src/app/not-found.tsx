import type { Metadata } from "next";
import { Container } from "@/components/layout/container";
import { StaticLink } from "@/components/navigation/static-link";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  robots: { follow: true, index: false },
  title: "Страница не найдена | Море и Горы",
};

export default function NotFound() {
  return (
    <main className="py-24">
      <Container className="max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-coral">Ошибка 404</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-brand-navy md:text-6xl">
          Такой страницы нет
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-muted-foreground">
          Адрес мог измениться или быть введён с ошибкой. Вернитесь на главную или перейдите к сравнению регионов.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <StaticLink href="/" className={cn(buttonVariants({ size: "lg" }), "rounded-full")}>На главную</StaticLink>
          <StaticLink href="/investicionnaya-nedvizhimost/" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "rounded-full")}>Сравнить регионы</StaticLink>
        </div>
      </Container>
    </main>
  );
}
