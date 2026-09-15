# Project router — «Море и Горы Next»

Этот файл дополняет глобальный AMS-канон и не дублирует его.

## Профиль проекта

- Класс: публичный коммерческий сайт инвестиционного бюро недвижимости.
- Режим: Next.js Node runtime с Payload; публичные SEO-страницы по возможности пререндерятся статически.
- UX scope: `PUBLIC_COMMERCIAL`.
- Repository mode: `SOURCECRAFT_PRIMARY_GITHUB_MIRROR`.
- Canonical repository: `integrator-p/more-i-gory-next`.
- Production изменяется только по отдельной команде владельца.

## Порядок чтения

1. `docs/README.md` — карта документов и текущая точка.
2. `docs/01_PRD.md` — продукт, аудитория, позиционирование.
3. `docs/02_PRODUCT_STRUCTURE.md` — PAGE-ID, URL, SEO, контент и публикация.
4. `docs/03_ARCHITECTURE.md` — stack, boundaries, build и integrations.
5. `docs/TECHNICAL_CORE.md` — UI-relevant runtime facts для UI scope.
6. `docs/06_DESIGN_SYSTEM.md` — визуальная система.
7. Текущий PR/Task из `docs/04_BACKLOG.md`.

Исследования в `docs/research/` — evidence, а не параллельный Source of Truth.

## Инварианты

- `SERVER FIRST`; `"use client"` разрешён только в `src/ui/interactive/**`.
- Страницы получают контент через `ContentService` и `ContentRepository`.
- Только `published` сущности создают production routes и sitemap entries.
- Новый индексируемый URL сначала фиксируется в `docs/02_PRODUCT_STRUCTURE.md`.
- Metadata берётся из единого registry.
- Фильтры и параметры не создают индексируемые URL.
- Нельзя выдумывать проекты, цены, доходность, кейсы, команду и юридические факты.
- Сырой transfer package не коммитится; разрешены только выбранные локальные ассеты.
- Payload уже владеет CMS/auth/schema; публичный read adapter переключается в EPIC 8. Prisma и второй ORM запрещены.

## Основные команды

```text
pnpm dev
pnpm verify
pnpm build
```

Точные scripts определяет `package.json`. Полный `pnpm verify` обязателен перед merge; в WORK запускаются только необходимые проверки.
