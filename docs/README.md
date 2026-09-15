# Документация проекта «Море и Горы»

**Статус:** Active
**Версия:** 2.0
**Дата:** 2026-09-11
**Стандарт:** AMS Product Development Standard 2.0

## Что создаём

«Море и Горы» — публичный статический Next.js-сайт инвестиционного бюро
курортной недвижимости. Он помогает сравнить регионы и проекты, проверить
экономику, риски и сценарий выхода, а затем перейти к персональному разбору.

## Бизнес-цель

Получать релевантный органический спрос по инвестиционной курортной недвижимости
и превращать его в квалифицированные обращения без неподтверждённых обещаний
доходности, кейсов или рыночного лидерства.

## Текущий статус

- технический фундамент и статический preview собраны;
- production не выпускался;
- все коммерческие и аналитические страницы остаются под content/trust gate;
- принят переход к Realty Platform; EPIC 0 фиксирует governance и IA;
- следующий технический этап после merge — EPIC 1, переход на Node.js runtime;
- production release остаётся отдельным этапом после платформенной перестройки.

## Platform contract

Текущее реализованное состояние до EPIC 1 — static Next.js preview с
`output: "export"`. Принятая целевая модель — `AMS_PROFILE=REALTY_BASE`,
Next.js + Payload + Managed PostgreSQL + S3 в одном Node.js runtime; решение
зафиксировано в [`ADR-004`](adr/ADR-004-realty-platform-runtime.md). Переходный
статус и exact-версии находятся в [`03_ARCHITECTURE.md`](03_ARCHITECTURE.md).

`DELIVERY_PROFILE = COMMERCIAL`.

## Source of Truth

| Область | Source of Truth |
|---|---|
| Продукт, аудитория, требования и ключевые риски | [`01_PRD.md`](01_PRD.md) |
| Страницы, URL, SEO, навигация, формы и user flows | [`02_PRODUCT_STRUCTURE.md`](02_PRODUCT_STRUCTURE.md) |
| Stack, modules, content/data, integrations, security и production | [`03_ARCHITECTURE.md`](03_ARCHITECTURE.md) |
| Project-specific профиль Realty Platform, среды, модули и human gates | [`PROJECT.md`](PROJECT.md) |
| Короткие UI-relevant runtime facts и verification cadence | [`TECHNICAL_CORE.md`](TECHNICAL_CORE.md) |
| NOW / NEXT / LATER, Epic, Task и technical debt | [`04_BACKLOG.md`](04_BACKLOG.md) |
| Release readiness и post-deploy proof | [`05_RELEASE_CHECKLIST.md`](05_RELEASE_CHECKLIST.md) |
| Визуальный язык, tokens и UI-компоненты | [`06_DESIGN_SYSTEM.md`](06_DESIGN_SYSTEM.md) |
| Адаптер дизайн-решений Realty Platform к визуальному канону проекта | [`DESIGN.md`](DESIGN.md) |
| Операционный runbook: deploy, rollback, backup, imports, leads и incidents | [`OPERATIONS.md`](OPERATIONS.md) |
| Труднообратимые решения | [`adr/`](adr/) |
| Исследования и исторические evidence | [`research/`](research/) |

Research объясняет причины решений, но не является параллельным Source of Truth.
Встроенные статусы старых файлов внутри `research/legacy/` являются историческими
и отменены общим статусом каталога.

## Как работать с проектом

1. Прочитать корневой `AGENTS.md`.
2. Прочитать эту карту.
3. Открыть только профильный Source of Truth текущей задачи.
4. Проверить READY Task в `04_BACKLOG.md`.
5. При труднообратимом решении открыть профильный ADR.

Новый индексируемый URL сначала фиксируется в `02_PRODUCT_STRUCTURE.md`.
Изменение stack, runtime, CMS, storage, auth или production topology сначала
фиксируется в `03_ARCHITECTURE.md` и при необходимости в ADR.

## Current Focus

Активна программа перехода к Realty Platform. EPIC 0 фиксирует документы, ADR и
Crimea-core IA; после его merge READY становится EPIC 1 — runtime pivot без
Payload. Атомарное состояние программы ведётся в импортированном Beads-графе,
а этот Backlog остаётся проектным source of truth верхнего уровня. Production не
выпускался и текущим потоком не разрешён.
