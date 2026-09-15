# Backlog — «Море и Горы»

**Статус:** Active
**Версия:** 3.0 Realty Platform program
**Дата:** 2026-09-15
**Правило:** это единственный source of truth текущей разработки.

## 1. Текущая точка

В `main` завершён EPIC 0. В активной ветке EPIC 1 static export заменён на
Next.js Node runtime без Payload. Владелец принял мастер-план
перехода к `AMS_PROFILE=REALTY_BASE`; он импортирован в локальный Beads-граф без
дублирования 137 атомарных задач в этом документе.

NOW: EPIC 1 — Node.js runtime pivot без Payload. После его review, exact-head
gate и merge следующий READY поток — EPIC 2: Payload + PostgreSQL.
Далее эпики выполняются только по dependency graph; один эпик = одна ветка/PR.

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
| PR-20 | Documentation Standard 2.0 normalization | DONE |

Git-история и SourceCraft PR являются доказательством отдельных merge, а не этот
документ.

## 3. COMPLETED — EPIC-17 Documentation Standard 2.0

Ветка: `codex/docs-standard-2-normalization`
Gate: `RISKY` — меняются SourceCraft docs-contract paths.

### TASK-017.1 — Normalize canonical documentation

Status: MERGED

Proof: SourceCraft PR-20, RISKY exact-head gate run 21, merge commit
`b53d852272417088884e58f817b72a8661f72128`.

- [x] перенести канон в `docs/`;
- [x] привести Backlog, Release Checklist и Design System к номерам `04–06`;
- [x] перенести риски и technical debt в профильные Source of Truth;
- [x] перенести ADR и research evidence;
- [x] отделить короткий repository README от `docs/README.md`;
- [x] обновить project router и SourceCraft path guards;
- [x] выполнить финальную проверку ссылок и `pnpm verify`.

## 4. NOW / NEXT — Realty Platform migration

| Состояние | Эпик | Результат |
|---|---|---|
| DONE | EPIC 0 | Project profile, operations/design adapters, Crimea-core IA, ADR-004..010, guards и manual CI policy |
| NOW | EPIC 1 | static export → Node.js runtime; Payload ещё запрещён |
| NEXT | EPIC 2 | Payload + PostgreSQL + migration foundation |
| BLOCKED BY GRAPH | EPIC 3..18 | data/gateway/UI/regions/leads/operations/feeds/analytics по зависимостям мастер-плана |

Контентные, legal и production решения остаются human gates и не подменяются
технической готовностью.

## Appendix A — Completed EPIC-18 UI Constitution Conformance 2.0

Ветка: `codex/ui-constitution-conformance-v2`
Gate: `STANDARD` — shared presentation/tokens без data, auth или runtime change.

### TASK-018.1 — Normalize the project UI system

- [x] проверить UI layers, shadcn config, primitive base и route templates;
- [x] зафиксировать semantic type scale и responsive matrix;
- [x] создать canonical `ActionLink` и semantic CTA variants;
- [x] убрать 1024px header overflow и укрепить mobile grid constraints;
- [x] вынести повторяемые numbered/article patterns в project components;
- [x] перевести главную из page-level монолита в композицию секций;
- [x] нормализовать form control sizes, validation states и native static exception;
- [x] выполнить full project verify и browser regression на 1440/1024/768/390;
- [x] зафиксировать финальный proof и закрыть Epic.

Local proof:

- `pnpm verify` — PASS: content, typecheck, lint, foundation, SEO, static build и artifact;
- 26 маршрутов × 4 ширины = 104 состояния, horizontal overflow и CTA `<44px` — 0;
- header breakpoint: desktop navigation только `≥1280px`, 1024/768/390 — compact menu;
- form validation: четыре invalid state отражены одновременно через
  `aria-invalid=true`, `data-invalid=true` и visible status;
- semantic audit: один H1, labels, alt, unique IDs и heading hierarchy — PASS
  после исправления страницы `/o-kompanii/`.

Merge/SourceCraft Gate/production не выполнялись и требуют отдельной lifecycle-команды владельца.

## Appendix B — Completed EPIC-19 AMS UI Skill Pack 4.2 Conformance

Ветка: `codex/ui-constitution-4-2`
Base: `codex/ui-constitution-conformance-v2` / SourceCraft PR-22
Gate: `RISKY` — меняются token contract, motion/theme foundation и canonical
Table primitive. Merge Gate пока не запускался.

### Audit findings

| Severity | Finding | Resolution |
|---|---|---|
| P1 | Dark mode не определён, но `dark:` и `.dark` foundation присутствовали | Dark mode зафиксирован как DISABLED; неактивные branches удалены |
| P1 | Нет reduced-motion foundation при transitions/animations | Добавлен global prefers-reduced-motion contract |
| P1 | Локальные typography/radius names расходились с 4.2 | Введены h1–h4, body roles, control/card/large |
| P1 | Design System дублировал numeric token values | Документ переведён на policy; values оставлены в globals.css |
| P1 | Не было UI Technical Core adapter и token compile proof | Добавлены Technical Core, UI drift gate и compiled CSS assertions |
| P1 | ScenarioTable был визуальной div-grid без table semantics | Подключён официальный shadcn Table и semantic markup |
| P2 | Form state message не различал warning/error/success | Добавлены semantic states и data-state contract |
| P2 | Text glyphs использовались вместо canonical icons | Заменены на Lucide |
| P2 | Laptop Hero обрезал secondary CTA внутри узкой колонки | Actions stack through laptop and become horizontal on desktop |

### TASK-019.1 — Normalize UI foundation 4.2

- [x] создать project UI Technical Core adapter;
- [x] перевести Design System на policy-only contract;
- [x] нормализовать semantic colors/type/radius/section/media/motion tokens;
- [x] удалить inactive dark-mode branches;
- [x] добавить reduced-motion behavior;
- [x] подключить официальный shadcn Table без React hydration;
- [x] перевести form status на validation/warning/error/success states;
- [x] заменить glyph icons на Lucide;
- [x] добавить mechanical UI drift gate;
- [x] добавить compiled token fixture в runtime verification;
- [x] проверить responsive/accessibility/performance на production-like runtime.

Local proof:

- `pnpm verify` — PASS: content, typecheck, lint, foundation, UI drift, SEO,
  static build, compiled token fixture и artifact;
- 26 routes × 4 widths = 104 browser states;
- page overflow, wrong H1, heading skips, duplicate IDs, orphan inputs,
  missing alt, broken aria-describedby и touch targets <44px — 0;
- LeadForm validation: 4 invalid controls, 4 associated descriptions,
  visible semantic error state;
- reduced motion: transition duration reduced to 0.01ms and smooth scroll disabled;
- local mobile lab: LCP 328ms, CLS 0 on static localhost artifact;
- visual review: 1440/1024/768/390; laptop Hero CTA regression fixed.

Merge, SourceCraft Gate и production не выполнялись.

## 5. LATER — Production Release

Отдельный release stream и явная команда владельца:

1. Утвердить production Leads API, rate limit, CAPTCHA и SLA.
2. Подготовить versioned artifact upload, atomic switch и rollback runbook.
3. Провести Nginx/TLS validation на production-like host.
4. Выполнить exact-main release, live smoke, form E2E, logs и rollback proof.

## 6. Technical Debt

### TD-001 — Custom post-export Next runtime stripping

Status: Resolved by EPIC 1
Risk: Closed

`strip-static-route-js`, static server и `StaticLink` удалены. Внутренние ссылки
используют `next/link`; runtime проверяется через `next start` и route manifest.

### TD-002 — Production release automation не реализована

Status: Open
Risk: High for production; none for local development

Есть локальный Node runtime, но нет доказанного immutable image rollout,
Nginx reverse proxy и rollback runbook. Production запрещён до отдельного release
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
