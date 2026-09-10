import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL("https://moreigori.ru"),
  title: {
    default: "Недвижимость для инвестиций — курортные проекты | Море и Горы",
    template: "%s | Море и Горы",
  },
  description:
    "Недвижимость для инвестиций в Сочи, Крыму, Архызе и на Алтае: сравниваем проекты, экономику, риски и сценарии выхода.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={cn("font-sans", geist.variable)}>
      <body>{children}</body>
    </html>
  );
}
