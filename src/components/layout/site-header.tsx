import { StaticLink } from "@/components/navigation/static-link";
import { ActionLink } from "@/components/navigation/action-link";
import { Container } from "./container";

const navigation = [
  { href: "/investicionnaya-nedvizhimost/", label: "Регионы" },
  { href: "/obekty/", label: "Объекты" },
  { href: "/metodika/", label: "Методика" },
  { href: "/analitika/", label: "Аналитика" },
  { href: "/o-kompanii/", label: "О компании" },
  { href: "/kontakty/", label: "Контакты" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand-navy/95 text-white backdrop-blur">
      <Container className="flex h-20 items-center justify-between gap-6">
        <StaticLink href="/" className="group flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-white text-sm font-bold text-brand-navy">МГ</span>
          <span className="leading-tight">
            <span className="block text-base font-semibold">Море и Горы</span>
            <span className="block text-xs text-white/60">инвестиционное бюро</span>
          </span>
        </StaticLink>

        <nav className="hidden items-center gap-6 text-sm text-white/74 xl:flex" aria-label="Основная навигация">
          {navigation.map((item) => (
            <StaticLink key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </StaticLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 xl:flex">
          <StaticLink href="/kontakty/" className="text-sm text-white/70 transition hover:text-white">
            Связаться
          </StaticLink>
          <ActionLink href="/podbor/" variant="accent" showArrow>
            Получить разбор
          </ActionLink>
        </div>

        <details className="group relative xl:hidden">
          <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-full border border-white/20 bg-white/10 text-white [&::-webkit-details-marker]:hidden">
            <span aria-hidden="true" className="text-xl leading-none">☰</span>
            <span className="sr-only">Открыть меню</span>
          </summary>
          <nav className="absolute right-0 top-14 z-50 grid min-w-64 gap-2 rounded-surface bg-card p-3 text-brand-navy shadow-surface" aria-label="Мобильная навигация">
            {navigation.map((item) => (
              <StaticLink key={item.href} href={item.href} className="rounded-2xl px-4 py-3 text-sm font-semibold hover:bg-muted">
                {item.label}
              </StaticLink>
            ))}
            <ActionLink href="/podbor/" variant="accent" className="mt-1">
              Получить разбор
            </ActionLink>
          </nav>
        </details>
      </Container>
    </header>
  );
}
