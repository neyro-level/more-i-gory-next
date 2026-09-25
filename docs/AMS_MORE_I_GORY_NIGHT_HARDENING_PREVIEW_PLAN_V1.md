# Мастер-план — ночное техническое закрытие и обновление preview

Plan ID: AMS-MORE-I-GORY-NIGHT-HARDENING-PREVIEW-2026-09
Version: v1
Status: APPROVED
Architect phase: APPROVAL_HANDOFF
Approved by: owner
Approved at: 2026-09-25T21:19:01.6219098+03:00
Date: 2026-09-25
Repository: integrator-p/more-i-gory-next
Baseline: origin/main@8db1c1ced37bbd8c0b486bdb6e81ccd3ace7c683
Delivery profile: COMMERCIAL
Platform: AMS Realty Platform Core 5.5, Payload 3.90.1, Next.js 16.3.6
Execution range: EPIC 87–90
Production: FORBIDDEN

## 1. Цель и границы

Цель программы — закрыть перечисленный в исходном ТЗ технический долг, сохранить
GEO-first V5 contract и установить один проверенный exact-main candidate на
technical preview `more-previu.tw1.ru`.

Фраза «весь технический долг» в этом плане означает только конечный scope
EPIC 87–90. Она не разрешает бесконечную зачистку, major upgrade, новый продуктовый
scope или незапланированный refactor.

### Входит

- runtime-derived canonical, metadata, robots и structured data;
- fail-closed runtime contour и env validation;
- Payload-backed editorial preview без seed-подмены public read;
- error/404/font contract;
- public copy, home decomposition, navigation/a11y, LeadForm и Card variants;
- public-copy guard, low-level DB guard, test grouping и подтверждённый dead code;
- docs/archive и manual-only SourceCraft CI cleanup;
- exact-main preview artifact, immutable install, additive migrations, smoke и rollback;
- отдельный post-rollout proof PR, не устанавливаемый на сервер.

### Не входит

- production, `moreigori.ru`, DNS или новый TLS/domain contour;
- включение jobs, feeds, outbound lead channels или публичной lead intake;
- index activation и публикация неподтверждённых business facts;
- изменение GEO-first URL/intent architecture;
- non-additive/destructive migrations;
- major dependency upgrades;
- автоматический CI на push/PR;
- скрытое ослабление guards, access rules, security headers или release checks.

## 2. Source of Truth и исходная точка

Приоритет:

1. `AGENTS.md`;
2. `docs/AMS_REALTY_PLATFORM_CORE_STANDARD_5.5_SOLO_AI_FINAL.md`;
3. `docs/AMS_UI_CORE_v5.0_FINAL.md`;
4. `docs/01_PRD.md`, `02_PRODUCT_STRUCTURE.md`, `03_ARCHITECTURE.md`;
5. `docs/PROJECT.md`, `TECHNICAL_CORE.md`, `DESIGN.md`, `OPERATIONS.md`;
6. `docs/04_BACKLOG.md`, `05_RELEASE_CHECKLIST.md`;
7. package/lockfile, code, migrations, tests и runtime evidence;
8. этот master plan.

Фактический baseline:

- `origin/main = 8db1c1c...`, GEO-first V5 closeout merged;
- Task Manager предыдущих программ: 102/102 closed, ready = 0;
- Next.js `16.3.6`, React `19.3.0`, Payload group `3.90.1`;
- `DELIVERY_PROFILE = COMMERCIAL`, `AMS_PROFILE = REALTY_BASE`, BUILD mode;
- preview last proven installed SHA в каноне: `cfcc784c8dac8b3452`;
- production не выпускался;
- current docs всё ещё содержат stale EPIC 86 active-state wording — это drift,
  который закрывает EPIC 87.

## 3. Проверенные gaps

Кодовая сверка baseline подтверждает:

- `src/seo/site-url.ts` вычисляет `siteUrl` на уровне модуля;
- `AMS_RUNTIME_CONTOUR` optional, а undefined SEO contour трактуется как production;
- `robots.ts` не задаёт production disallow для `/admin/` и `/api/`;
- Montserrat объявлен независимо в site layout и global 404;
- `src/app/(site)/error.tsx` отсутствует;
- staging editorial preview читает seed modules вместо Payload Public Gateway;
- mobile-menu leaf и public-copy guard отсутствуют;
- LeadForm содержит `action/method`, а email/phone не имеют требуемых input types;
- 165 `*.test.mjs` находятся в `scripts/`, каталог `tests/` отсутствует;
- `package.json` содержит большой плоский набор `test:*` scripts;
- `tracking-wide` и `bg-gradient-to-t` остаются в public UI.

Graphify подтвердил широкий fan-out `isEditorialPreviewEnabled()` на public routes,
metadata и preview navigation. Поэтому переключение preview source является RISKY
cross-cutting change, а не локальной заменой одного adapter.

## 4. Official docs evidence

Проверено 2026-09-25:

- Next.js Metadata API поддерживает `generateMetadata` и root `metadataBase`:
  https://nextjs.org/docs/app/api-reference/functions/generate-metadata
- Next.js автоматически добавляет `noindex` для 404; explicit duplicate robots meta
  запрещён: https://nextjs.org/docs/app/api-reference/file-conventions/not-found
- `global-not-found` остаётся experimental и обязан импортировать собственные
  styles/fonts при нескольких root layouts;
- route `error.tsx` является Client Component и получает `reset`:
  https://nextjs.org/docs/app/getting-started/error-handling
- dynamic `robots.ts` поддерживает allow/disallow/sitemap contract:
  https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
- Payload Local API по умолчанию обходит access; public/user path обязан явно
  использовать `overrideAccess:false`:
  https://payloadcms.com/docs/local-api/access-control
- Payload migrations остаются единственным schema lifecycle:
  https://payloadcms.com/docs/database/migrations

Решение: план совместим с установленной major/minor линией. Dependency upgrade не
нужен. Реальные project tests и exact-head SourceCraft gate остаются обязательными.

## 5. Git, Task Manager и delivery policy

- Один epic stream = отдельная branch + worktree + PR.
- Каждый stream создаётся от свежего `origin/main`; stacked branch от незамерженного
  head другого эпика запрещён.
- EPIC 88 и EPIC 89 могут выполнять непересекающиеся implementation tasks после
  control freeze EPIC 87. Merge остаётся последовательным: 88, затем rebase 89,
  повтор только инвалидированных checks, затем 89.
- В `page.tsx`: EPIC 88 владеет metadata/generateMetadata, EPIC 89 — body/composition.
- Docs ownership: EPIC 88 — Architecture/PROJECT/OPERATIONS/Release Checklist/ADR;
  EPIC 89 — DESIGN/archive/test/CI docs; EPIC 90 — README/Backlog/DELIVERY_STATE/
  OWNER_QUEUE/night report.
- Push и создание PR не запускают CI.
- Перед каждым merge выполняется full diff review и ровно один manual exact-head
  `merge-risky` SourceCraft gate.
- Локальный `pnpm verify` и `pnpm verify:schema` выполняются один раз на финальном
  exact head перед gate, а не повторяются отдельно «до PR» и «до merge».
- Production release запрещён. Preview rollout является отдельным external action
  EPIC 90 и разрешается только APPROVED snapshot этого плана.

## 6. Dependency graph

```text
EPIC 87 control/baseline
  ├─ CONTRACT → EPIC 88 runtime/SEO/Payload/security
  └─ CONTRACT → EPIC 89 UI/copy/tests/CI

EPIC 88 delivery
  └─ HARD (merge only) → EPIC 89 delivery/rebase

EPIC 88 delivery + EPIC 89 delivery
  └─ HARD → EPIC 90 exact-main preview rollout and report
```

Связь EPIC 89 implementation с EPIC 88 — CONTRACT: frozen file ownership и
metadata/body split позволяют работать без ожидания merge. Delivery EPIC 89 ждёт
EPIC 88, потому что shared routes, `package.json`, verification runners и docs должны
быть проверены на новом `main`.

## EPIC 87 — Control foundation и baseline freeze

Outcome: Task Manager и docs описывают exact текущий baseline; дальнейшие эпики
получают детерминированные entry conditions без stale EPIC 86 state.

### Tasks

1. Зафиксировать exact `origin/main`, installed versions, migration count и clean state.
2. Reconcile GEO-first Plan v1: подтвердить EPIC 68–86 closed и убрать active wording
   из current-state docs в рамках отдельного implementation PR.
3. Снять inventory текущих preview URLs и canonical response contract без mutation.
4. Зафиксировать текущий preview installed SHA/digest/path через project runbook;
   `cfcc784...` считать только ожидаемым значением до live preflight.
5. Зафиксировать BEFORE test case count через Node test reporter.
6. Проверить наличие required SourceCraft manual workflows и отсутствие auto push/PR CI.
7. Проверить availability gitleaks-equivalent; scan всей Git history относится к EPIC 88.

### Acceptance

- baseline tuple содержит main SHA, preview SHA, migration count и URL manifest;
- previous Task Manager graph закрыт, ready work = 0;
- stale docs state устранён без переписывания истории;
- нет server/secret mutation;
- PR прошёл exact-head RISKY gate и merged.

### Verification

- `git status`, `git rev-parse`, `bd prime`, inventory reconciliation;
- read-only preview HTTP inventory;
- docs/current-state guards;
- SourceCraft workflow map.

## EPIC 88 — SEO/runtime/env/security и Payload-backed preview

Outcome: canonical/metadata/robots вычисляются из runtime contour, preview читает
Payload через Public Gateway, env/security contracts fail closed, 404/error/font
поведение единообразно.

### 88.1 Runtime URL и metadata

- заменить top-level `siteUrl` на `getSiteUrl(source?)`, читающий env при вызове;
- перевести route metadata, где требуется runtime origin, на `generateMetadata`;
- root metadata: template `%s | Море и Горы`, default title, runtime `metadataBase`;
- убрать дублирующие ручные brand suffix;
- default OG image `/images/og/default.webp` с реальными dimensions;
- `twitter.card = summary_large_image`;
- release artifact получает target `NEXT_PUBLIC_SERVER_URL`;
- runtime-release guard падает при loopback origin/HTML в заданном contour;
- canonical/OG tests для `/`, `/obekty/`, published article.

### 88.2 Contour, robots и SEO state

- production runtime требует `AMS_RUNTIME_CONTOUR`;
- undefined contour fail-closed эквивалентен staging/noindex;
- staging/undefined robots: `Disallow: /`;
- production robots: `Allow: /`, `Disallow: /admin/` и `/api/`, canonical sitemap;
- unit matrix undefined/staging/production;
- registry SEO contract требует title, description, canonical, OG image.

### 88.3 Structured data, font, 404 и error

- Organization + WebSite JSON-LD только из `LEGAL_DETAILS.md`;
- Article JSON-LD только для published; BreadcrumbList на hubs;
- единый `src/app/fonts.ts`, Montserrat cyrillic+latin;
- site layout и global 404 используют одну декларацию;
- global 404 не задаёт второй robots meta и использует SectionShell rhythm;
- `(site)/not-found.tsx` сохраняет site chrome при segment `notFound()`;
- добавить `(site)/error.tsx` client leaf с `reset`, без stack/error details в UI;
- guard разрешает `next/font/google` только в `src/app/fonts.ts`.

### 88.4 Payload-backed editorial preview

- `AMS_EDITORIAL_PREVIEW=payload|seed`;
- staging default = payload;
- seed разрешён только вне production runtime и без DB;
- regions/properties/newbuilds/developers/site chrome читаются через Public Gateway,
  serializable DTO и `overrideAccess:false`;
- preview navigation = registry + Payload data, не seed modules;
- seed commands идемпотентно создают только недостающее и дают preview-visible
  statuses без перезаписи owner content;
- baseline URL parity: прежние 200 routes остаются 200 либо approved redirect;
- изменение test region title через Local API видно после revalidate и откатывается.

### 88.5 Env, DB guard и infrastructure identifiers

- `CACHE_INVALIDATION_MODE` default `http`; runtime требует revalidate secret/base;
- non-empty `LEAD_CHANNELS` требует allowlisted outbound hosts и channel secrets;
- production runtime с `NEXT_PUBLIC_LEADS_ENABLED=true` требует `JOBS_AUTORUN=true`;
- unit matrix каждой parseProjectEnv branch;
- raw `postgres` import разрешён только migrations/ops/approved ingest allowlist;
- убрать private infrastructure IDs из tracked docs/ops/runtime contour;
- staging public host/DB name читаются из validated env;
- whole-history secret scan; любой secret = STOP;
- ADR-014 code-owned articles/static copy; ADR-012 preview/noindex/no leads/no jobs;
- обновить Architecture, PROJECT, OPERATIONS и Release Checklist.

### Acceptance

- все пункты 88.1–88.5 имеют regression evidence;
- Payload access rules не ослаблены, второй backend/ORM отсутствует;
- migration отсутствует либо только additive и backward-compatible;
- `pnpm verify` и `pnpm verify:schema` LOCAL PASS на final head;
- full diff review + один exact-head SourceCraft RISKY gate PASS;
- PR merged; production/index/jobs/leads/feed остаются выключены.

## EPIC 89 — UI, public copy, tests, docs archive и CI hygiene

Outcome: публичный интерфейс не показывает внутреннюю терминологию, home/UI
декомпозированы, accessibility и forms исправлены, tests имеют понятные группы,
CI остаётся manual-only.

### 89.1 Public copy и home

- убрать из public JSX/strings внутренние слова из исходного ТЗ;
- не выдумывать факты; использовать нейтральные формулировки;
- preview-only «Все страницы» остаётся явно помеченным исключением;
- home articles читаются из articles; production = published only, staging = all;
- ArticleCard не показывает служебный status;
- добавить `verify-public-copy` с узкими исключениями и включить в `pnpm verify`;
- разнести home sections по `src/components/pages/home/`, данные — `src/content/home/`;
- `page.tsx` остаётся композицией; mapping обновлён в DESIGN.

### 89.2 Navigation, a11y, LeadForm, Card

- skip-link первым в body, все public `<main>` получают `id=main`;
- client leaf mobile menu на project-owned shadcn Sheet: pathname close, Escape,
  focus trap, aria label; SiteHeader остаётся Server Component;
- preview menu использует `--spacing-header`, viewport max-height и Escape;
- `tracking-eyebrow`, `bg-linear-to-t` заменяют deprecated utility usage;
- LeadForm email/tel types и inputMode; удалить form action/method;
- `<noscript>` показывает verified contacts; aria relations сохраняются;
- Card получает CVA radius `card|large`; exception registry обновлён.

### 89.3 Tests, archive, CI и dead code

- записать BEFORE test count из EPIC 87;
- перенести `*.test.mjs` из scripts в `tests/{ingest,leads,seo,ui,runtime,docs,jobs}`;
- сгруппировать scripts: `test:ingest|leads|seo|ui|runtime|docs|jobs|all`;
- объединить только доказанные exact duplicates и перечислить их в PR;
- AFTER >= BEFORE - documented exact duplicates;
- обновить verify runner и quick coverage;
- перенести старые планы №2–4 в `docs/archive/` с portable names, обновить ссылки;
- удалить root duplicate legacy plan только после diff/link proof;
- вынести CI docs-presence list в `scripts/ci/docs-presence.sh`;
- сохранить manual-only `merge-standard`/`merge-risky`; auto PR trigger не добавлять;
- `quality:dead-code`: удалить только подтверждённое; Payload peers не удалять.

### 89.4 QA

- `pnpm verify`, `verify:schema`, `verify:ui-drift`, `test:ui`;
- browser 360/768/1280, keyboard menu flow, Escape/focus behavior;
- local production build Lighthouse mobile: LCP <= 2.5 s, CLS <= 0.1;
- screenshots/metrics сохраняются как PR/run artifacts, не как случайные binaries;
- exact-head review + один RISKY gate; PR merged after EPIC 88 and rebase.

### Acceptance

- public-copy guard = 0 violations outside preview exception;
- test count conservation доказан;
- CI policy соответствует zero-CI push/PR contract;
- UI acceptance и performance thresholds доказаны;
- production/index/jobs/leads/feed не менялись.

## EPIC 90 — Exact-main preview rollout, smoke, rollback и report

Outcome: итоговый merged `main` установлен на `more-previu.tw1.ru` как immutable
candidate; live smoke зелёный либо выполнен rollback; proof записан отдельным PR.

### 90.1 Preflight

- обновить `origin/main`, clean exact SHA;
- подключить `ams-server-access`, затем exact project server runbook и Secret Master;
- не печатать secrets;
- preview env: REALTY_BASE, Europe/Moscow, staging, public preview URL, editorial
  preview payload, jobs/leads/channels off, staging media prefix, HTTP revalidation;
- `db:single:preflight`; only additive/backward-compatible migrations;
- live installed SHA/digest/path и rollback unit;
- снять `BASELINE_URLS` до switch;
- missing secret, unknown server identity или non-additive migration = STOP.

### 90.2 One build, immutable install и live proof

- один SourceCraft `release-single-build` на exact main с preview public URL;
- artifact + SHA-256 + RELEASE_EVIDENCE;
- immutable install → Payload migrate → idempotent missing-only seeds → switch;
- Nginx: X-Robots-Tag noindex/nofollow, security headers и rate limits; `nginx -t`;
- smoke: baseline URL parity, Crimea/city hubs, canonical/OG origin, no loopback,
  robots/meta/header noindex, redirects without chains, 404 chrome/single robots,
  live public-copy scan, Admin owner login, anonymous business REST denied,
  reversible region-title/revalidate proof, disabled lead form/no API request,
  Lighthouse live metrics;
- любой red после switch → app rollback на live-proven previous release, smoke
  rollback и STOP; additive migration остаётся и заранее должна быть compatible.

### 90.3 Report-only PR

- `docs/proofs/night-run-report.md`: PR/gate/main/release SHA, digest, installed
  path, rollback SHA, migrations, smoke rows, screenshots/artifact links, remaining
  owner gates;
- синхронизировать README, Backlog, DELIVERY_STATE и OWNER_QUEUE с фактом;
- отдельный docs PR через one exact-head STANDARD gate;
- report commit на preview не устанавливать.

### Acceptance

- live preview работает на recorded exact-main SHA либо rollback доказан;
- moreigori.ru, production, DNS, jobs, feeds, outbound channels, lead intake и
  index activation не затронуты;
- report PR merged, Task Manager reconciliation CLEAN.

## 7. Global STOP conditions

- red gate, исправимый только ослаблением проверки;
- secret в Git history;
- migration non-additive, destructive или несовместима с rollback artifact;
- source plan/inventory drift, dependency cycle или неизвестный task target;
- production/DNS/domain action;
- неизвестная server identity или missing required secret;
- public facts/claims без evidence;
- любой EPIC 90 post-switch red: rollback, report, STOP.

При STOP создать/обновить `docs/proofs/night-run-report.md` только в безопасной
рабочей ветке: сделанное, точная ошибка, SHA, rollback status и owner decision.

## 8. Revision input R-01

Source: owner attachment `pasted-text.txt`.

| Finding | Triage | Решение |
|---|---|---|
| SEO/runtime/env/Payload preview scope | ACCEPTED | EPIC 88 |
| UI/copy/tests/docs/dead-code scope | ACCEPTED | EPIC 89 |
| exact-main preview deployment | ACCEPTED | EPIC 90, production excluded |
| EPIC 2 from unmerged EPIC 1 head | ACCEPTED WITH CHANGE | отдельные worktree от fresh main; contract-parallel implementation, sequential merge |
| full verify before every PR | ACCEPTED WITH CHANGE | один final-head local run before gate; PR creation itself remains zero-CI |
| automatic merge-standard on PR | REJECTED | conflicts with mandatory zero-CI push/PR policy |
| rollback SHA `cfcc784...` | NEEDS LIVE PREFLIGHT | expected only; verify installed identity before switch |
| “all technical debt” | NARROWED | only enumerated EPIC 87–90 scope |

## 9. Owner Decision Register

Before approval open decisions: 0.

Plan approval itself is not inferred from delivery wording. Exact approval phrase
`План утверждён` or `План утвержден` is required before Task Manager import and
Developer handoff.

## 10. Final audit

### Pass 1 — Logic / completeness

- Outcome coverage: runtime/security, UI/test hygiene, preview rollout and proof covered.
- Production and factual/index activation isolated as non-goals.
- “All debt” ambiguity removed.
- Every epic has measurable acceptance and terminal delivery state.

### Pass 2 — Architecture / data / security

- Payload remains sole CMS/auth/schema/migration owner.
- Public read stays Public Gateway + DTO + explicit access.
- Seed mode cannot replace production/staging Payload read.
- Migration is additive-only; rollback compatibility is a preflight gate.
- Secret/server actions exist only in EPIC 90 with canonical access routing.

### Pass 3 — Dependencies / autonomy

- Cycles: 0.
- HARD: EPIC 88 delivery before EPIC 89 delivery; both before EPIC 90.
- CONTRACT: EPIC 88/89 implementation after EPIC 87 file/contract freeze.
- Independent waves: runtime/security and UI/test hygiene.
- Shared-file ownership and rebase rule explicit.

### Pass 4 — Executability / evidence / delivery

- Each implementation epic has local checks, exact-head gate and merge evidence.
- Preview uses one build, immutable install, live smoke and rollback.
- Report is a separate non-deployed docs PR.
- STOP conditions cover secrets, migrations, server identity and failed rollout.

## 11. Audit scorecard

```text
Logic/completeness: blockers 0; major 0
Architecture/data/security: blockers 0; major 0
Dependency/autonomy: cycles 0; HARD 2; CONTRACT 2; independent waves 2
Executability/evidence: 4/4 epics deterministic
Owner decisions before approval: 0
Night Run Readiness: READY_WITH_LIMITS
```

`READY_WITH_LIMITS`: EPIC 90 неизбежно external/sequential и зависит от доступности
SourceCraft, Secret Master, preview server и additive migration preflight. У него есть
preflight, rollback и STOP, поэтому ограничение не блокирует approval.

## 12. Revision history

| Version | Status | Result |
|---|---|---|
| v0 | DRAFT | Owner attachment accepted as existing plan basis; no import/execution |
| v1 | APPROVED | Reconciled with main, Git/CI canon, official docs and code evidence; final audit passed; owner approved exact v1 on 2026-09-25 |

## 13. Approval/handoff contract

После exact owner approval:

1. поставить `Status: APPROVED`, approver/date и новый SHA-256;
2. обновить matching inventory schema v2;
3. `Validate → Init/Upgrade decision → Import → Reconcile`;
4. создать Codex goal на весь graph EPIC 87–90;
5. Developer выполняет ready-loop, commit/push после задач и merge только по
   `MERGE_AFTER_GATE`;
6. EPIC 90 preview rollout разрешён; production остаётся запрещён.
