import { getStaticMetadata } from "@/seo/metadata";

export const metadata = getStaticMetadata("PAGE-001");

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-6 px-6 py-20">
        <p className="text-sm uppercase tracking-wide text-muted-foreground">
          Инвестиционное бюро курортной недвижимости
        </p>
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight text-foreground md:text-6xl">
          Курортная недвижимость для инвестиций — с понятной экономикой и рисками
        </h1>
        <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
          Сравниваем Сочи, Крым, Архыз и Алтай, чтобы до сделки было видно:
          зачем заходить в проект, где ограничения и какой сценарий выхода
          реалистичен.
        </p>
      </section>
    </main>
  );
}
