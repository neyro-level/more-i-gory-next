import { StaticLink } from "@/components/navigation/static-link";
import { Container } from "./container";

const footerLinks = [
  { href: "/investicionnaya-nedvizhimost/", label: "Инвестиционная недвижимость" },
  { href: "/obekty/", label: "Объекты" },
  { href: "/metodika/", label: "Методика" },
  { href: "/analitika/", label: "Аналитика" },
  { href: "/podbor/", label: "Подбор" },
];

export function SiteFooter() {
  return (
    <footer className="bg-brand-navy py-12 text-white">
      <Container className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <p className="text-2xl font-semibold">Море и Горы</p>
          <p className="max-w-xl text-sm leading-7 text-white/65">
            Инвестиционное бюро курортной недвижимости. Помогаем сравнивать регионы, проекты,
            экономику, риски и сценарии выхода до сделки.
          </p>
          <p className="text-xs text-white/55">© Море и Горы. Материалы сайта не являются индивидуальной инвестиционной рекомендацией.</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <nav className="space-y-3 text-sm" aria-label="Навигация в подвале">
            {footerLinks.map((item) => (
              <StaticLink key={item.href} href={item.href} className="block text-white/70 transition hover:text-white">
                {item.label}
              </StaticLink>
            ))}
          </nav>
          <nav className="space-y-3 text-sm" aria-label="Юридическая навигация">
            <StaticLink href="/o-kompanii/" className="block text-white/70 transition hover:text-white">
              О компании
            </StaticLink>
            <StaticLink href="/kontakty/" className="block text-white/70 transition hover:text-white">
              Контакты
            </StaticLink>
            <StaticLink href="/privacy/" className="block text-white/70 transition hover:text-white">
              Политика конфиденциальности
            </StaticLink>
            <StaticLink href="/consent/" className="block text-white/70 transition hover:text-white">
              Согласие на обработку данных
            </StaticLink>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
