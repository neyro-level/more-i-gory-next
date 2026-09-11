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
    <footer className="bg-surface-dark py-section-sm text-surface-dark-foreground">
      <Container className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <div className="flex flex-col gap-4">
          <p className="text-h3 font-semibold">Море и Горы</p>
          <p className="max-w-narrow text-body-sm text-surface-dark-foreground/65">
            Инвестиционное бюро курортной недвижимости. Помогаем сравнивать регионы, проекты,
            экономику, риски и сценарии выхода до сделки.
          </p>
          <p className="text-caption text-surface-dark-foreground/55">© Море и Горы. Материалы сайта не являются индивидуальной инвестиционной рекомендацией.</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <nav className="flex flex-col gap-3 text-label" aria-label="Навигация в подвале">
            {footerLinks.map((item) => (
              <StaticLink key={item.href} href={item.href} className="block text-surface-dark-foreground/70 transition-colors duration-fast ease-standard hover:text-surface-dark-foreground">
                {item.label}
              </StaticLink>
            ))}
          </nav>
          <nav className="flex flex-col gap-3 text-label" aria-label="Юридическая навигация">
            <StaticLink href="/o-kompanii/" className="block text-surface-dark-foreground/70 transition-colors duration-fast ease-standard hover:text-surface-dark-foreground">
              О компании
            </StaticLink>
            <StaticLink href="/kontakty/" className="block text-surface-dark-foreground/70 transition-colors duration-fast ease-standard hover:text-surface-dark-foreground">
              Контакты
            </StaticLink>
            <StaticLink href="/privacy/" className="block text-surface-dark-foreground/70 transition-colors duration-fast ease-standard hover:text-surface-dark-foreground">
              Политика конфиденциальности
            </StaticLink>
            <StaticLink href="/consent/" className="block text-surface-dark-foreground/70 transition-colors duration-fast ease-standard hover:text-surface-dark-foreground">
              Согласие на обработку данных
            </StaticLink>
          </nav>
        </div>
      </Container>
    </footer>
  );
}
