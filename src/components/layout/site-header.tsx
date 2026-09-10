import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { Container } from "./container";

const navigation = [
  { href: "/investicionnaya-nedvizhimost/", label: "Регионы" },
  { href: "/obekty/", label: "Объекты" },
  { href: "/metodika/", label: "Методика" },
  { href: "/analitika/", label: "Аналитика" },
  { href: "/kontakty/", label: "Контакты" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-navy/95 text-white backdrop-blur">
      <Container className="flex h-20 items-center justify-between gap-6">
        <Link prefetch={false} href="/" className="group flex items-center gap-3" aria-label="Море и Горы — на главную">
          <span className="grid size-11 place-items-center rounded-full bg-white text-sm font-bold text-brand-navy">МГ</span>
          <span className="leading-tight">
            <span className="block text-base font-semibold">Море и Горы</span>
            <span className="block text-xs text-white/60">инвестиционное бюро</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-white/74 lg:flex" aria-label="Основная навигация">
          {navigation.map((item) => (
            <Link key={item.href} prefetch={false} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link prefetch={false} href="/kontakty/" className="text-sm text-white/70 transition hover:text-white">
            Связаться
          </Link>
          <Link
            prefetch={false}
            href="/podbor/"
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-full bg-brand-coral px-5 text-white hover:bg-brand-coral/90",
            )}
          >
            Получить разбор
            <span aria-hidden="true" className="ml-1 text-base leading-none">↗</span>
          </Link>
        </div>

        <details className="group relative lg:hidden">
          <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-full border border-white/20 bg-white/10 text-white [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true" className="text-xl leading-none">☰</span>
            <span className="sr-only">Открыть меню</span>
          </summary>
          <nav className="absolute right-0 top-14 z-50 grid min-w-64 gap-2 rounded-[1.5rem] bg-white p-3 text-brand-navy shadow-2xl" aria-label="Мобильная навигация">
            {navigation.map((item) => (
              <Link key={item.href} prefetch={false} href={item.href} className="rounded-2xl px-4 py-3 text-sm font-semibold hover:bg-muted">
                {item.label}
              </Link>
            ))}
            <Link prefetch={false} href="/podbor/" className="rounded-2xl bg-brand-coral px-4 py-3 text-sm font-semibold text-white">
              Получить разбор
            </Link>
          </nav>
        </details>
      </Container>
    </header>
  );
}
