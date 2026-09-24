# Backlog — «Море и Горы»

**Статус:** Active
**Версия:** 5.0 — GEO-first remediation execution
**Дата:** 2026-09-24
**Правило:** это единственный source of truth текущей разработки.

## 1. Текущая точка

Current execution source —
`AMS_MORE_I_GORY_GEO_FIRST_REMEDIATION_MASTER_PLAN_V5_0.md` v1 APPROVED,
Task Manager prefix `mggeo`. EPIC 68 смержен PR 111 и зафиксировал exact
baseline. EPIC 69 смержен PR 112 и заморозил GEO-first IA. EPIC 70 фиксирует
evidence-based решения по каждому current/legacy URL до изменения runtime routes.

Публичный сайт читает Payload через Public Gateway и DTO. Business facts по
Крыму и четырём городам остаются `MISSING`: технический graph выполняется, но
index activation закрыт. Production не выпускался и не разрешён.

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
| PR-25 | EPIC 0 — governance, IA и manual CI policy | DONE |
| PR-26 | EPIC 1 — Next.js Node runtime pivot | DONE |
| PR-27 | EPIC 2 — Payload и PostgreSQL foundation | DONE |
| PR-30 | EPIC 3 — gateways, contracts и architecture guards | DONE |
| PR-31 | EPIC 4 — Jobs и cache invalidation | DONE |
| PR-32 | EPIC 5 — Globals, Pages и SEO CMS foundation | DONE |
| PR-34 | EPIC 6 — Media и S3 pipeline | DONE |
| PR-35 | EPIC 7 — Regions IA и Crimea core | DONE |
| PR-36 | EPIC 8 — Properties investment passports foundation | DONE |
| PR-37 | EPIC 15 — Newbuild schema foundation | DONE |
| PR-38 | EPIC 16 — Ingest subsystem (XML/YRL) | DONE |
| PR-39 | EPIC 17 — Public newbuild catalog | DONE |
| PR-40 | EPIC 9 — UI conformance и добор долга | DONE |
| PR-41 | EPIC 10 — Leads transactional outbox | DONE |
| PR-42 | Release — standalone production artifact | DONE |
| PR-43 | EPIC 11 — Lead delivery | DONE |
| PR-44 | EPIC 12 — Maintenance, retention и recovery | DONE |
| PR-46 | EPIC 19 — baseline SoT, verify:quick, cron hotfix | DONE |
| PR-47 | EPIC 20 — Payload Access Boundary | DONE |
| PR-48 | EPIC 21 — DTO / Presentation Boundary | DONE |
| PR-49 | EPIC 22 — Outbound Security Hardening | DONE |
| PR-50 | EPIC 23 — Lead Delivery End-to-End | DONE |
| PR-51 | EPIC 24 — schema hardening and safe deactivation | DONE |
| PR-52 | EPIC 25 — Jobs Scheduler + Janitor + Recovery | DONE |
| PR-53 | EPIC 26 — ingest pipeline, fixture proof, freeze | DONE |
| PR-54 | EPIC 27 — runtime publishing and CMS cache | DONE |
| PR-55 | EPIC 28 — SEO sitemap and archived lifecycle | DONE |
| PR-56 | EPIC 29 — Regions Single Source of Truth | DONE |
| PR-57 | EPIC 30 — UI Core 5.0 Conformance | DONE |
| PR-58 | EPIC 31 — S3 / Media Production Contract | DONE |
| PR-59 | EPIC 13 — Timeweb Runtime + Staging | DONE |
| PR-60 | EPIC 32 — Integration Proof Matrix | DONE |
| PR-61 | EPIC 34 — Owner Queue | DONE |
| PR-65 | EPIC 35 — Plan №3 governance and baseline | DONE |
| PR-66 | EPIC 36 — architecture boundary hardening | DONE |
| PR-67 | EPIC 37 — UI and route conformance | DONE |
| PR-68 | EPIC 38 — PostgreSQL/migration verification; historical-chain blocker recorded | DONE WITH OWNER GATE |
| PR-69 | EPIC 39 — security and outbound hardening | DONE |
| PR-70 | EPIC 40 — runtime and content contracts | DONE |
| PR-71 | EPIC 41 — responsive/accessibility browser matrix | DONE WITH DEFERRED DB ROUTES |
| PR-72 | EPIC 42 — final platform proof matrix | DONE |
| PR-73 | EPIC 43 — Source of Truth / final conformance closeout | DONE |
| PR-75 | EPIC 51 — content fact foundation | DONE |
| PR-74 | EPIC 44 — historical PostgreSQL migration-chain repair | DONE |
| PR-76 | EPIC 45 — canonical state closeout | DONE |
| PR-82 | EPIC 46 — security and access closeout | DONE |
| PR-84 | EPIC 47 — credential rotation | DONE |
| PR-93 | EPIC 48 — single-DB migration/application proof; restore deferred | DONE |
| PR-97 | EPIC 49 — immutable preview runtime and rollback | DONE |
| PR-98 | EPIC 50 — enabled leads E2E and safe disable | DONE |
| PR-77 | EPIC 52 — content readiness classification | DONE |
| PR-99 | EPIC 53 — observability and performance closeout | DONE |
| PR-100 | EPIC 54 — technical preview candidate closeout | DONE WITH EVIDENCE LIMITATION |

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

## 4. NOW / NEXT — GEO-first remediation v1

Код в `main` — Realty 5.5 контур без production. Approved graph содержит 19
эпиков и выполняется строго через Beads.

| Состояние | Эпик | Результат |
|---|---|---|
| DONE | EPIC 35–54 | код в `main` `21e484c98503550dbfbcbef38eb2e9eecd8d8308`; PR 100 / RISKY run 143; original EPIC 54 task ledgers утрачены |
| DONE | EPIC 60–66 | Next `16.3.6`, Payload `3.90.1`, runtime/security/ingest/leads/repository/delivery hardening смержены |
| DONE | EPIC 67 | Plan №4 final verification и preview evidence закрыты |
| DONE | EPIC 68 | baseline, route/SEO inventory и factual preflight; PR 111 |
| DONE | EPIC 69 | GEO-first IA, intent ownership и четыре ADR; PR 112 |
| DONE | EPIC 70 | current/legacy URL manifest, migration decisions и три детерминированных отчёта; PR 113 |
| DONE | EPIC 71 | typed reversible `RouteIdentity` grammar, reserved-root protection и round-trip tests; PR 114 |
| DONE | EPIC 74 | normalized Crimea/city Payload model, DTO и manual project geo relations; PR 115 / RISKY run 176 |
| DONE | EPIC 72 | unified SEO state resolver, CMS SEO runtime propagation и indexability invariants; PR 116 / RISKY run 177 |
| NOW | EPIC 73 | real HTTP lifecycle adapters and cache-safe Public Gateway failures |
| NEXT | EPIC 75–86 | GEO pages, project passports и final proof по approved dependencies |
| CONTENT GATE | Крым + четыре города | facts `MISSING`; index activation запрещена, technical work разрешена |
| PRODUCTION GATE | Release/cutover | только отдельная release-команда после нового approved plan |

Старые `mg-*` задачи не являются READY work текущего плана. Единственное
execution state — CLEAN graph `mggeo`; DRAFT/legacy inventories повторно не
импортируются.

### EPIC 72 — Unified SEO state engine

- [x] один чистый resolver определяет canonical, index/follow, sitemap,
  HTTP-state intent, redirect intent и reason;
- [x] static registry, regions, CMS pages, complexes, developers, passports и
  article lifecycle используют согласованный effective state;
- [x] CMS SEO проходит через Public DTO в runtime metadata и sitemap;
- [x] canonical override ограничен внутренним нормализованным path, а CMS Pages
  — runtime-supported whitelist;
- [x] staging, preview, technical, draft/review/archived, noindex и страницы без
  Content Gate исключены из sitemap;
- [x] добавлены contract suites `seo-state-contract`,
  `sitemap-indexability-invariant`, `article-indexing-lifecycle` и
  `cms-seo-runtime`.

Merge gate: `RISKY` — единый resolver меняет cross-cutting SEO/runtime contract.
Production и фактическая index activation не входят в scope.

### EPIC 73 — HTTP lifecycle and cache failure semantics

- [x] fake HTTP 200/`data-archive-status="410"` удалён;
- [x] `gone` materialized как реальный Next 404 согласно ADR-013;
- [x] permanent route redirect materialized и тестируется как 308;
- [x] operational DB/Payload failure больше не возвращает cacheable
  `[]`/`null`; entity detail, catalog и sitemap fail closed, а ограниченный
  presentation fallback применяется только вне `unstable_cache`;
- [x] valid zero-row read остаётся отдельным успешным состоянием;
- [x] cache failure fixture доказывает retry после временного сбоя.

Merge gate: `RISKY` — меняются HTTP и cross-cutting Public Gateway/cache
semantics. Production не входит в scope.

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

## 5. DEFERRED — Content и Production Release

Этот scope отложен владельцем. Когда он будет возвращён в работу, потребуется
отдельный release stream и явная команда владельца:

1. Доказать production activation локального Payload intake, trusted-client
   rate limit, honeypot, minimum-fill и SLA; внешний CRM/notification channel
   остаётся выключенным.
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

Status: Next technical plan input — частично закрыто PR-42 и preview runbook
Risk: High for production; none for local development

Standalone artifact, Nginx, systemd, pack/rollback и preview contour в `main`.
Live restore в disposable DB FAIL (нет `CREATEDB`). Production запрещён до
approved recovery/release contract и отдельной команды владельца.

### TD-003 — Draft article shells находятся в preview artifact

Status: Deferred by owner with content/page scope
Risk: Low

Пять первых экранов статей собираются для согласования, но имеют `noindex` и не
попадают в sitemap. Перед release каждый материал проходит editorial gate либо
исключается из artifact.

### TD-004 — Payload version upgrade

Status: Urgent next technical plan input
Risk: High / RISKY

Текущий exact baseline — Payload и `@payloadcms/*` `3.89.0`; Plan №4 v1 APPROVED
предлагает exact target `3.90.1`. Перед реализацией повторно подтвердить latest
и совместимость с Next.js, React, Node.js, PostgreSQL adapter, Admin, Jobs,
migrations и generated types по свежей официальной документации. Upgrade не
смешивать с контентом или production release.

### TD-005 — EPIC 54 terminal evidence gap

Status: Next technical plan input
Risk: Medium for development; High before release claim

PR 100, RISKY run 143 и merge SHA известны, но original per-task ledgers и
immutable tuple `exact main SHA + digest + installed path + smoke` не сохранены.
Нельзя считать `21e484c` доказанным installed candidate без нового evidence.

### TD-006 — Unmerged release-tooling stream

Status: Decision required before next plan import
Risk: High if duplicated

`work/ci-gate-split` содержит пять чистых commits поверх Plan №3 main и меняет
CI/release contracts. Новый план должен сначала принять, перебазировать или
отклонить этот stream; параллельный второй release-контур запрещён.

### TD-007 — Reserved inactive `packages/ui`

Status: Resolved in Plan №4 EPIC 65.1
Risk: Low

Consumer-free пакет удалён вместе с lockfile importer. Architecture guard теперь
запрещает его скрытое возвращение; canonical UI остаётся в едином project-owned
`src/components/**`.

### TD-008 — Legacy Beads graph остаётся физически активным

Status: P0 next technical plan cleanup input
Risk: High for autonomous execution

Старый prefix `mg-*` содержит 156 open, 149 blocked и 7 ready-записей без
current Plan ID. Они объявлены noncanonical и запрещены к исполнению, но не
закрываются массово без history-preserving cleanup contract и approval.

## 7. Human gates

Не блокируют техническую ветку, но блокируют production:

- контентные доказательства и реальные проекты;
- внешний канал оповещений о заявках (в этой программе исключён);
- карта/provider, если публикуется на страницах;
- финальная команда на release и cutover `moreigori.ru`.

Оператор ПДн и тексты `privacy`/`consent` зафиксированы в `LEGAL_DETAILS.md` /
`PROJECT.md`; это не заменяет live production proof.
