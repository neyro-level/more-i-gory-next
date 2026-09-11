# Backlog — «Море и Горы»

**Статус:** Active
**Версия:** 1.7
**Дата:** 2026-09-11
**Правило:** это единственный source of truth текущей разработки.

## 1. Текущая точка

PR-00..PR-19 слиты в `main`. Реализованы static Next foundation, Content
Repository, SEO registry, дизайн-система, полная главная, 23 PAGE-ID, региональные
экраны, каталог-шаблон, аналитика, формы, release-readiness baseline и UI
Constitution Conformance.

Production не выпускался. Все коммерческие, аналитические и юридические страницы
остаются под content/trust gate и не попадают в sitemap.

## 2. Завершённые эпики

| PR | Результат | Статус |
|---|---|---|
| PR-00..PR-04 | Документы, foundation, content/SEO boundaries, design shell | DONE |
| PR-05..PR-08 | Главная и региональные SEO-кластеры | DONE |
| PR-09..PR-11 | Каталог, паспорт-шаблон, аналитика, формы и trust/legal screens | DONE |
| PR-12..PR-15 | Static QA, no-JS export, JS budget, delivery profile и route gate | DONE |
| PR-18 | Technical Production Readiness | DONE |
| PR-19 | UI Constitution Conformance | DONE |

Git-история и SourceCraft PR являются доказательством отдельных merge, а не этот
документ.

## 3. NOW — EPIC-17 Documentation Standard 2.0

Ветка: `codex/docs-standard-2-normalization`
Gate: `RISKY` — меняются SourceCraft docs-contract paths.

### TASK-017.1 — Normalize canonical documentation

Status: REVIEW

- [x] перенести канон в `docs/`;
- [x] привести Backlog, Release Checklist и Design System к номерам `04–06`;
- [x] перенести риски и technical debt в профильные Source of Truth;
- [x] перенести ADR и research evidence;
- [x] отделить короткий repository README от `docs/README.md`;
- [x] обновить project router и SourceCraft path guards;
- [x] выполнить финальную проверку ссылок и `pnpm verify`.

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

## 6. Technical Debt

### TD-001 — Custom post-export Next runtime stripping

Status: Accepted
Risk: Medium

Server-only маршруты освобождаются от Next runtime после build. Контроль:
обычные document links, artifact validation и browser/hydration smoke. Пересмотр
обязателен при смене Next.js или появлении React-интерактивности на этих routes.

### TD-002 — Production release automation не реализована

Status: Open
Risk: High for production; none for local development

Есть static artifact и Nginx example, но нет доказанного versioned upload,
atomic switch и rollback runbook. Production запрещён до отдельного release
stream на утверждённом сервере.

### TD-003 — Draft article shells находятся в preview artifact

Status: Accepted during content stage
Risk: Low

Пять первых экранов статей собираются для согласования, но имеют `noindex` и не
попадают в sitemap. Перед release каждый материал проходит editorial gate либо
исключается из artifact.

## 7. Human gates

Не блокируют техническую ветку, но блокируют production:

- контентные доказательства и реальные проекты;
- юридические тексты и оператор ПДн;
- production Leads API;
- адрес/карта и публичные контакты;
- финальная команда на release.
