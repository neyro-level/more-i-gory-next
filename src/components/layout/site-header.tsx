import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Container } from "./container";
import { MobileMenu } from "@/ui/interactive/mobile-menu";

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
        <Link href="/" className="group flex items-center gap-3" aria-label="Море и Горы — на главную">
          <span className="grid size-11 place-items-center rounded-full bg-white text-sm font-bold text-brand-navy">МГ</span>
          <span className="leading-tight">
            <span className="block text-base font-semibold">Море и Горы</span>
            <span className="block text-xs text-white/60">инвестиционное бюро</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-white/74 lg:flex" aria-label="Основная навигация">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/kontakty/" className="text-sm text-white/70 transition hover:text-white">
            Связаться
          </Link>
          <Link
            href="/podbor/"
            className={cn(
              buttonVariants({ size: "lg" }),
              "rounded-full bg-brand-coral px-5 text-white hover:bg-brand-coral/90",
            )}
          >
            Получить разбор
            <ArrowUpRight aria-hidden="true" className="ml-1 size-4" />
          </Link>
        </div>

        <div className="lg:hidden">
          <MobileMenu navigation={navigation} />
        </div>
      </Container>
    </header>
  );
}
