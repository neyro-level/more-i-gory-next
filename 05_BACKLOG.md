# Backlog — «Море и Горы»

**Статус:** Active
**Версия:** 1.6
**Дата:** 2026-09-11
**Правило:** это единственный source of truth текущей разработки.

## 1. Текущая точка

PR-00..PR-15 слиты в `main`. Реализованы static Next foundation, Content
Repository, SEO registry, дизайн-система, полная главная, 23 PAGE-ID, региональные
экраны, каталог-шаблон, аналитика, формы и release-readiness baseline.

Production не выпускался. Все коммерческие, аналитические и юридические страницы
остаются под content/trust gate и не попадают в sitemap.

## 2. Завершённые эпики

| PR | Результат | Статус |
|---|---|---|
| PR-00..PR-04 | Документы, foundation, content/SEO boundaries, design shell | DONE |
| PR-05..PR-08 | Главная и региональные SEO-кластеры | DONE |
| PR-09..PR-11 | Каталог, паспорт-шаблон, аналитика, формы и trust/legal screens | DONE |
| PR-12..PR-15 | Static QA, no-JS export, JS budget, delivery profile и route gate | DONE |

Git-история и SourceCraft PR являются доказательством отдельных merge, а не этот
документ.

## 3. NOW — EPIC-16 Technical Production Readiness

Ветка: `codex/epic-technical-production-readiness`
Gate: `RISKY` — изменяются dependencies, SourceCraft workflow и Nginx contract.

### TASK-016.1 — Architecture/code drift

- [x] сверить Architecture, Product Structure, Design System и runtime;
- [x] убрать устаревшие обещания о candidate dependencies и несуществующих DTO;
- [x] зафиксировать реальный verification contract;
- [x] обновить текущий backlog и release checklist.

### TASK-016.2 — Static runtime and SEO hardening

- [x] устранить двойной бренд в rendered Title;
- [x] привести шрифт к Design System;
- [x] заменить client navigation на обычные document links;
- [x] заменить 290 КБ React hydration на framework-free form enhancement;
- [x] добавить собственную 404;
- [x] усилить проверку rendered Title, Description, H1, canonical, robots и links;
- [x] усилить Server First/hydration guards.

### TASK-016.3 — Dependencies, CI and Nginx

- [x] устранить HIGH advisories через единую `sharp 0.35.4`;
- [x] отделить build-only dependencies;
- [x] убрать двойной запуск STANDARD gate;
- [x] вернуть install/audit/verify в RISKY gate;
- [x] добавить `.env.example`;
- [x] добавить 404/cache/security baseline в Nginx example;
- [x] выполнить браузерный smoke, hydration console и accessibility audit;
- [x] повторить финальный `pnpm verify` после form-runtime optimization;
- [x] commit, push и SourceCraft PR #18.

## 4. NEXT — Content Approval

Эти задачи не входят в EPIC-16:

1. Утвердить сильные заявления, методику, команду и модель оплаты.
2. Добавить реальные проекты, цены, источники, `verifiedAt` и инвестиционные выводы.
3. Дописать пять аналитических материалов и провести editorial QA.
4. Утвердить юридические тексты, фактические реквизиты и consent version.
5. После прохождения page gates перевести конкретные registry entries в
   `index=yes` / `sitemap=yes`.

## 5. LATER — Production Release

Отдельный release stream и явная команда владельца:

1. Утвердить production Leads API, rate limit, CAPTCHA и SLA.
2. Подготовить versioned artifact upload, atomic switch и rollback runbook.
3. Провести Nginx/TLS validation на production-like host.
4. Выполнить exact-main release, live smoke, form E2E, logs и rollback proof.

## 6. Human gates

Не блокируют техническую ветку, но блокируют production:

- контентные доказательства и реальные проекты;
- юридические тексты и оператор ПДн;
- production Leads API;
- адрес/карта и публичные контакты;
- финальная команда на release.
