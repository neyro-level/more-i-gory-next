"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type MobileMenuProps = {
  navigation: Array<{
    href: string;
    label: string;
  }>;
};

export function MobileMenu({ navigation }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="icon-lg" className="border-white/20 bg-white/10 text-white hover:bg-white/20" aria-label="Открыть меню" />}>
        <Menu aria-hidden="true" className="size-5" />
      </SheetTrigger>
      <SheetContent className="bg-brand-navy text-white">
        <SheetHeader>
          <SheetTitle className="text-white">Море и Горы</SheetTitle>
        </SheetHeader>
        <nav className="mt-8 grid gap-4 text-lg" aria-label="Мобильная навигация">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-2xl bg-white/8 px-4 py-3">
              {item.label}
            </Link>
          ))}
          <Link href="/podbor/" className="rounded-2xl bg-brand-coral px-4 py-3 font-semibold text-white">
            Получить разбор
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
