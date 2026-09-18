# МАСТЕР-ПЛАН РЕМЕДИАЦИИ И ДОВЕДЕНИЯ ДО PRODUCTION
## Проект «Море и Горы» → AMS Realty Platform 5.5

```text
Plan ID: more-i-gory-remediation-2026-09
Version: v2
Status: REVIEW
Delivery profile: COMMERCIAL
Canonical repository: SourceCraft integrator-p/more-i-gory-next
GitHub mirror: neyro-level/more-i-gory-next (не primary)
Base SHA: 27ea4c2393e970797da50c7dc78b614f815820bb
Platform: Realty Platform / REALTY_BASE / BUILD
UX: PUBLIC_COMMERCIAL
Task Manager import: not allowed until «План утверждён»
Default epic delivery_mode: MERGE_AFTER_GATE (явное намерение §1.2; ждёт подтверждения владельца)
```

**Базовый аудит:** `origin/main` @ `27ea4c2393e970797da50c7dc78b614f815820bb`  
**Нормативная база:** AMS Realty Platform Core 5.5 + AMS UI Core 5.0 (решение владельца)  
**Фактически доступный AMS skill на машине:** Realty Platform Core Standard 3.0 — используется как совместимый Hard Contract там, где 5.5 локально отсутствует  
**Режим:** solo owner / PM + AI  
**Канонический production-контур:** SourceCraft → Timeweb VPS → Nginx → Next.js standalone + Payload → Timeweb Managed PostgreSQL + Timeweb S3  
**Статус документа:** REVIEW (не APPROVED)  
**Цель документа:** дать AI единый последовательный план, который можно выполнять автономно эпик за эпиком без переизобретения архитектуры.

## Architect review — 2026-09-18

Три прохода: completeness, architecture/security, executability.  
Код сверен с checkout `docs/sync-main-status` поверх `27ea4c2`. Production-код не менялся. Import в Task Manager не выполнялся.

### Pass 1 — completeness / traceability

План закрывает цепочку: access → DTO → schema/deactivation → jobs → leads E2E → ingest E2E → cache/publish → SEO → regions → UI → outbound → S3 → Timeweb → proofs → release. Human gates (secrets, domain cutover, production) вынесены. Definition of Done и STOP-условия есть.

Пробелы: нет явного `Plan ID`/inventory schema v2 до approval; в списке чтения нет `docs/05_RELEASE_CHECKLIST.md` и `docs/02_PRODUCT_STRUCTURE.md` (нужны EPIC 08/09/15); нумерация EPIC 00–15 — **новая программа**, не продолжение старых EPIC 0–18 бэклога.

### Pass 2 — architecture / data / security

Сохранение архитектуры и запрет Prisma/второго backend верны. Границы Public/System Gateway совпадают с Realty contract.

Проверено по коду, не по памяти:

- `deliverLead` только переводит delivery в `sending`, Telegram не вызывается.
- `importFeed` только переводит run в `running`, parse/upsert нет.
- `jobsJanitor` handler возвращает `{ status: "registered" }`; cron `* 0/5 * * * *`.
- raw `Page` из `@/payload-types` импортируется в `src/components/page-blocks/*`.

### Pass 3 — execution / delivery / rollback

Задачи достаточно атомарны для Beads. Proof-скрипты, которых ещё нет в `package.json`, создавать внутри эпика — это нормально. EPIC 15 правильно отделён от разработки. Rollback артефакта есть в EPIC 13/15.

Риск исполнения: §1.2 требует gate+merge каждого эпика (`MERGE_AFTER_GATE`). Default AMS — `PR_ONLY`. Нужно явное слово владельца.

### Findings

| ID | Class | Finding |
|---|---|---|
| F1 | ACCEPTED | Главный дефект «код есть, E2E нет» подтверждён на leads/ingest/janitor. |
| F2 | ACCEPTED | EPIC 01–02, 05–06, 04.1/04.4 — правильный порядок блокеров. |
| F3 | ACCEPTED | Канонический Git — SourceCraft `integrator-p/more-i-gory-next`, не GitHub slug в шапке. |
| F4 | ALREADY_COVERED | Часть EPIC 00 (NOW/NEXT, OPERATIONS TODO) уже в PR 45; остаётся разделение IMPLEMENTED/PARTIAL/NOT_PROVEN и ADR superseded. |
| F5 | RESOLVED | Норматив — 5.5 (решение владельца). Где 5.5 локально нет, исполняется совместимый Core 3.0 Hard Contract. |
| F6 | NEEDS_OWNER | `MERGE_AFTER_GATE` на каждый эпик или `PR_ONLY` до финальных волн? |
| F7 | NEEDS_OWNER | Подтвердить, что программа EPIC 00–15 **заменяет** старый NOW=EPIC 13 в бэклоге, а не идёт параллельно. |
| F8 | NEEDS_OWNER | EPIC 06 Secret Master feed URL: runtime injection без нового secret API в репозитории — ок как STOP, или нужен отдельный owner contour сразу? |

## External revision — 2026-09-18 (v2)

Внешняя ревизия принята и встроена. Каждое утверждение проверено против рабочей копии на `27ea4c2`; ниже зафиксирован фактический результат проверки, а не пересказ.

| ID | Class | Проверка по коду | Что сделано в плане |
|---|---|---|---|
| A1 cron dialect | ACCEPTED | `scheduled-tasks.ts` и `dispatch-due-feeds.ts` используют форму `0/5`; смешение с `*/5` нежелательно | TASK 04.1 → `"0 0/5 * * * *"`; TASK 04.2 проверяет единый диалект шага |
| A2 retry без `abandoned` | ACCEPTED | `planRetryableLeadDeliveryFailure` возвращает только `"failed" \| "pending"`; backoff зажат `Math.min(attempts, len-1)`; производителя `abandoned` нет | TASK 05.5 переписан на `maxAttempts` + расширение типов; помечен RISKY |
| A3 attempts не читаются | ACCEPTED | `planRetryableLeadDeliveryFailure` требует `attempts`/`attemptLog`, которых нет в `LeadDeliveryPayload` | TASK 05.3 возвращает `{payload, attempts, attemptLog, channelId}` |
| A4 путь channel-registry | ACCEPTED с уточнением | `src/project/leads/` не существует. Guard 1 блокирует по allow-list `privilegedSystemFiles` **только файлы с `overrideAccess: true`** | Добавлен TASK 05.1.1: registry сам не использует `overrideAccess`; в allow-list регистрируется System Gateway helper из 05.3 |
| A5 verification-only | ACCEPTED | `test:leads-privacy` и `test:public-inventory-boundary` существуют | Правило внесено в §1.3; TASK 01.6 переведён в verification-first |
| A6 дыра в `verify:quick` | ACCEPTED, цифра уточнена | Проверено скриптом: из 57 `test:*` вне `verify:quick` ровно один — `test:lead-delivery-admin` | Добавлен TASK 00.7 с machine-check |
| A7 revalidate уже есть | ACCEPTED | `src/app/api/internal/revalidate/route.ts` + `test:internal-revalidate` существуют | TASK 07.6 переформулирован на доказательство сквозного пути |
| B1 нет дедупликации | ACCEPTED | `idempotencyKey` есть в коллекции (unique) и в `LeadDeliveryPayload`, но Telegram его не принимает | Добавлен TASK 05.11 |
| B2 владелец `nextDueAt` | ACCEPTED | `dispatchDueFeeds` сдвигает `nextDueAt` только при claim; пост-run поведения нет | Добавлен TASK 06.15 |
| B3 путь ручного retry | ACCEPTED | `retryAbandonedLeadDelivery` + `manualRetryAudit` реализованы, операторский путь нигде не описан | Добавлен TASK 05.12 |
| B4 PII в логах | ACCEPTED | `test:lead-delivery-secrets` — статический контракт, runtime-захвата stdout нет | Добавлен proof 14.K |
| B5 один jobs owner | ACCEPTED | Machine-check отсутствует | TASK 04.8 помечен `OWNER_DECISION_REQUIRED` с тремя вариантами |
| B6 scope deviations | ACCEPTED | — | Поле добавлено в §4 |
| C1 cron раньше | ACCEPTED | Дефект активен при первом включении jobs | TASK 04.1/04.2 продублированы в EPIC 00 как hotfix |
| C2 EPIC 11 перед 05 | ACCEPTED | `deliverLead` пойдёт поверх Safe Outbound Client | Порядок изменён; §2 и §5 обновлены |
| D1 формулировка access | ACCEPTED | Буквальное `read: () => false` положит Admin | TASK 01.3 усилен до различения anonymous/authenticated |
| D2 `packages/ui` | ACCEPTED | Удаление в середине remediation бессмысленно рискованно | TASK 02.6 — только `reserved/inactive` |
| D3 enum migration | ACCEPTED | Пересекается со стоп-фактором §1.4 | TASK 03.1 помечен `OWNER_DECISION_REQUIRED` |
| D4 301 vs 410 | ACCEPTED | — | Пометка продублирована в TASK 08.4 |
| E формулировки | ACCEPTED | — | §1.1, §1.5, Guard D, EPIC 14 обновлены |

Отклонённых findings нет.

---

# 0. Короткий вывод

Архитектуру проекта **сохранять**. Новый репозиторий не создавать. Полный rewrite не делать.

Фундамент уже сильный: Payload, PostgreSQL adapter, migrations, jobs, gateways, newbuild schema, Safe Outbound Client, transactional lead outbox, S3 adapter, SEO registry, архитектурные guards и большой слой tests.

Главный системный дефект: несколько подсистем формально «собраны», но не замкнуты end-to-end.

Критические блокеры:

1. Public/Payload access boundary не доведён до Hard Contract.
2. Raw Payload documents местами доходят до presentation layer.
3. `deliverLead` не выполняет фактическую доставку.
4. `importFeed` не выполняет фактический импорт.
5. Safe deactivation approval не привязан к конкретному suspicious run и не имеет TTL.
6. `jobsJanitor` фактически заглушка, а один cron задан ошибочно.
7. Runtime publishing/cache/SEO lifecycle имеют разрывы.
8. Канонические docs отстают от фактического `main`.
9. Production Nginx/runbook всё ещё содержит остатки static-архитектуры.
10. Staging, restore, S3, jobs handover и production proofs ещё не доказаны.

До закрытия этого мастер-плана production release запрещён.

---

# 1. Правила автономной работы AI

## 1.1. Source of Truth

Перед каждым эпиком AI читает только:

1. `AGENTS.md`
2. `docs/README.md`
3. `docs/PROJECT.md`
4. `docs/03_ARCHITECTURE.md`
5. `docs/04_BACKLOG.md`
6. `docs/OPERATIONS.md`
7. `docs/DESIGN.md`
8. `docs/TECHNICAL_CORE.md`
9. `package.json` и `pnpm-lock.yaml` — фактический стек и набор проверок
10. `docs/02_PRODUCT_STRUCTURE.md` — для EPIC 08/09 (URL, index policy)
11. `docs/05_RELEASE_CHECKLIST.md` — для EPIC 13/14/15
12. профильные ADR
13. этот Master Plan

Фактический код и lockfile имеют приоритет над памятью модели.

## 1.2. Git / SourceCraft

Каждый эпик выполняется отдельно:

```text
main
→ новая epic-ветка
→ атомарные задачи
→ commit + push после законченной задачи
→ targeted proof
→ full proof эпика
→ PR
→ exact-head SourceCraft gate
→ merge только если owner подтвердил delivery_mode=MERGE_AFTER_GATE
→ следующий эпик
```

**Один эпик = одна ветка = один PR.** Direct push в `main` запрещён.

Не коммитить напрямую в `main`.

## 1.3. Autonomous mode

AI не запрашивает подтверждение на обычные технические решения, если:

- решение прямо следует Core 5.5 / UI Core 5.0;
- не меняется продуктовый смысл;
- не добавляется новая инфраструктура;
- не создаётся новый внешний provider;
- не требуется production secret;
- не выполняется production deploy.

AI должен самостоятельно:

- исследовать существующий код;
- реализовать минимальное изменение;
- обновить tests/guards;
- обновить docs;
- запустить proof;
- устранить найденные regression;
- подготовить отчёт.

### Verification-only режим (обязательное правило)

Перед реализацией любой задачи AI обязан проверить, не покрыта ли она уже
существующим `test:*` скриптом или рабочим кодом.

```text
покрыто и проходит
→ задача = VERIFICATION_ONLY
→ запустить существующий proof
→ дописать только недостающие кейсы
→ не переписывать рабочий слой
```

Переписывание работающей подсистемы без доказанного дефекта — нарушение scope.

## 1.4. STOP / OWNER DECISION

Остановить конкретную задачу и пометить `OWNER_DECISION_REQUIRED`, если требуется:

- новый внешний сервис/provider;
- новый production secret;
- смена URL/SEO модели;
- destructive migration;
- смена ORM/CMS/backend;
- изменение юридического текста/retention policy;
- production deploy;
- финальный domain cutover;
- решение, допускающее потерю данных;
- решение между `301` и `410`, если нет достоверной релевантной цели;
- новый платный API/лицензия.

Остальные задачи AI продолжает автономно.

## 1.5. Definition of Done каждой задачи

Нельзя писать `DONE`, пока нет:

```text
IMPLEMENTATION
+ targeted test/proof
+ no regression in related contracts
+ docs updated if contract changed
+ git diff review
```

Для RISKY-задач дополнительно:

```text
pnpm install --frozen-lockfile
pnpm verify
pnpm audit --audit-level high
pnpm verify:schema (если schema/migration)
exact-head SourceCraft RISKY gate
```

`--frozen-lockfile` идёт первым: audit по несинхронизированному дереву не является доказательством.

## 1.6. Запрещённый scope

Без отдельного owner decision не добавлять:

- Prisma;
- второй ORM;
- второй CMS;
- Redis;
- RabbitMQ;
- Elasticsearch;
- PostGIS;
- отдельный backend;
- microservices;
- отдельный jobs service;
- новую UI-library;
- глобальный client state;
- universal page builder;
- runtime registry;
- новый map provider;
- второй image/storage pipeline.

---

# 2. Порядок эпиков

Номера эпиков стабильны, меняется только порядок исполнения.

```text
EPIC 00  Baseline + Docs Source of Truth (+ cron hotfix, verify:quick audit)
EPIC 01  Payload Access Boundary
EPIC 02  DTO / Presentation Boundary
EPIC 03  Schema Hardening + Safe Deactivation 5.5
EPIC 04  Jobs Scheduler + Janitor + Recovery
EPIC 05  Lead Delivery End-to-End
EPIC 06  Ingest End-to-End
EPIC 07  Runtime Publishing + Cache Invalidation
EPIC 08  SEO / Sitemap / Archived Lifecycle
EPIC 09  Regions Single Source of Truth
EPIC 10  UI Core 5.0 Conformance
EPIC 11  Outbound Security Hardening
EPIC 12  S3 / Media Production Contract
EPIC 13  Timeweb Runtime + Staging
EPIC 14  Integration Proof Matrix
EPIC 15  Production Release Gate
```

## 2.1. Порядок исполнения (v2)

```text
00 (+ cron hotfix) → 01 → 02 → 11 → 05 → 03 → 04 → 06 → 07 → 08 → 09 → 10 → 12 → 13 → 14 → 15
```

Обоснование двух перестановок:

- **11 перед 05.** `deliverLead` строится поверх Safe Outbound Client. Если сначала доказать доставку, а потом поменять семантику redirect и DNS-политику транспорта, proof G придётся переделывать. Сначала фиксируем транспорт.
- **05 перед 03/06.** Заявки — единственная подсистема, где уже теряется реальный клиентский трафик. Фида нет вообще (`PROJECT.md`: ingest не активирован), поэтому 03 и 06 не горят.
- **cron hotfix в 00.** Однострочное исправление без зависимостей; иначе шторм сработает на первом же включении jobs, в том числе во время проверки миграций EPIC 03.

---

# EPIC 00 — BASELINE И НОРМАЛИЗАЦИЯ SOURCE OF TRUTH

**Priority:** BLOCKER  
**Risk:** STANDARD  
**Цель:** документы снова описывают фактический проект, а не старые этапы миграции.

## TASK 00.1 — Зафиксировать baseline

Создать audit/remediation section:

```text
BASE_SHA=27ea4c2393e970797da50c7dc78b614f815820bb
PROFILE=REALTY_BASE
TARGET_CORE=AMS Realty Platform 5.5
UI_CORE=AMS UI Core 5.0
```

Зафиксировать, что все дальнейшие изменения идут поверх этого SHA.

## TASK 00.2 — Переписать текущий статус Backlog

Обновить `docs/04_BACKLOG.md`.

Удалить устаревшие утверждения:

- `NOW: EPIC 2`;
- Payload как будущий этап;
- Leads как будущий этап;
- ingest как несуществующий foundation;
- EPIC 10–12 как полностью завершённые, если end-to-end proof отсутствует.

Добавить remediation stream EPIC 00–15.

## TASK 00.3 — Нормализовать PROJECT

Обновить `docs/PROJECT.md`.

Явно разделить:

```text
IMPLEMENTED
PARTIAL
DISABLED
NOT_PROVEN
OWNER_GATE
```

Особенно:

- Payload;
- PostgreSQL;
- S3;
- leads;
- lead delivery;
- newbuild;
- feed ingest;
- jobs;
- retention;
- cache;
- staging;
- production.

## TASK 00.4 — Нормализовать OPERATIONS

Удалить старые `TODO EPIC 6/10/11/12/16`, если код уже существует.

Вместо этого фиксировать:

```text
CODE EXISTS
RUNTIME NOT PROVEN
PRODUCTION NOT PROVEN
```

## TASK 00.5 — Нормализовать TECHNICAL_CORE / DESIGN

Убрать остатки static-export contract.

Убедиться, что runtime:

```text
Next.js standalone
Payload
PostgreSQL
S3
Node runtime
Server-first
```

## TASK 00.6 — ADR status

Проверить ADR-001..010.

Для superseded static ADR:

- не удалять историю;
- пометить superseded текущим runtime ADR.

## TASK 00.7 — Аудит полноты `verify:quick`

Тест, который существует, но не запускается в общем прогоне, не лучше отсутствующего теста.

Текущий факт (проверено на `27ea4c2`): из 57 скриптов `test:*` вне `verify:quick`
ровно один — `test:lead-delivery-admin`.

Требование:

```text
каждый test:* из package.json
→ либо входит в verify:quick
→ либо явно исключён с записанной причиной
```

Добавить machine-check (скрипт или узкий guard), который падает при появлении
нового `test:*` вне `verify:quick` без зарегистрированного исключения.

## TASK 00.8 — Cron hotfix (перенесено из EPIC 04)

Исполнить здесь TASK 04.1 и TASK 04.2: исправление ошибочного расписания и
cron guard. Однострочная правка без зависимостей, но она блокирует безопасный
запуск jobs на staging во время EPIC 03.

Остальной EPIC 04 остаётся на своём месте в порядке исполнения.

## Acceptance Criteria

- ни один canonical doc не утверждает, что Payload/DB/leads «ещё впереди»;
- docs описывают текущий код;
- docs не объявляют proof пройденным без фактического прогона;
- `docs/04_BACKLOG.md` содержит этот remediation program;
- каждый `test:*` либо в `verify:quick`, либо явно исключён;
- maintenance cron не создаёт per-second schedule.

## Proof

```bash
git diff --check
pnpm verify:foundation
pnpm test:jobs-config
pnpm test:maintenance-jobs
```

---

# EPIC 01 — PAYLOAD ACCESS BOUNDARY

**Priority:** P0 / BLOCKER  
**Risk:** RISKY / SECURITY  
**Цель:** anonymous raw Payload business data недоступны, каждый Local API call имеет явный access mode.

## TASK 01.1 — Инвентаризация Payload Local API

Найти все:

```text
payload.find
payload.findByID
payload.findGlobal
payload.create
payload.update
payload.delete
req.payload.*
getPayload(...)
```

Для каждого вызова классифицировать:

```text
PUBLIC GATEWAY
SYSTEM GATEWAY
CMS ADMIN
MIGRATION
TEST
```

## TASK 01.2 — Explicit access mode

Каждый application Local API call обязан иметь:

```ts
overrideAccess: false
```

или быть зарегистрированным System Gateway call с:

```ts
overrideAccess: true
```

Запрещены implicit defaults.

## TASK 01.3 — Закрыть anonymous raw business REST

Пересмотреть access:

```text
pages
regions
properties
developers
residential-complexes
redirects
media
...
```

Anonymous raw REST не должен быть публичным business API.

Public website читает данные через server-only Public Gateway.

**Обязательное уточнение (D1).** Payload Admin ходит через тот же REST с
авторизованной сессией. Буквальное `read: () => false` положит админку.
Правильная формулировка требования:

```text
access-функции обязаны различать anonymous и authenticated owner/editor
anonymous → denied
authenticated по роли → allowed
```

Регрессия Admin-доступа после этой задачи считается блокером эпика.

## TASK 01.4 — Отдельно проверить Media

Определить минимальный public media contract.

Не отдавать через raw API лишние CMS/runtime поля.

## TASK 01.5 — Усилить Guard 1

Architecture guard должен падать на:

```text
Local API call without explicit overrideAccess
```

И отдельно на:

```text
overrideAccess:true outside registered System Gateway
```

## TASK 01.6 — Integration tests (verification-first)

Сначала запустить существующие `test:leads-privacy` и
`test:public-inventory-boundary`. Покрытые сценарии не переписывать —
подтвердить прогоном и дописать только недостающие.

Обязательные сценарии:

```text
anonymous GET raw properties → denied
anonymous GET raw pages → denied
anonymous GET leads → denied
anonymous GET lead-deliveries → denied

owner → allowed where intended

public site:
published property → available
draft/hidden property → unavailable
private fields → never in DTO
```

## Acceptance Criteria

- raw anonymous Payload business REST закрыт;
- Public Gateway продолжает работать;
- все Local API access modes explicit;
- guard ловит будущий drift.

## Proof

```bash
pnpm test:public-gateway
pnpm test:system-gateway
pnpm verify:guards
pnpm verify:guards:test
pnpm verify
```

---

# EPIC 02 — DTO / PRESENTATION BOUNDARY

**Priority:** P0/P1  
**Risk:** RISKY  
**Цель:** raw Payload types/documents не доходят до reusable UI.

## TASK 02.1 — CmsPage DTO

Создать explicit contracts:

```text
CmsPageDTO
CmsPageBlockDTO
CmsSeoDTO
```

Не использовать `Page` из `payload-types` в presentation.

## TASK 02.2 — Gateway mapping

`src/core/data-access/public/pages.ts`:

```text
Payload
→ explicit select
→ mapper
→ Zod output validation
→ DTO
```

## TASK 02.3 — Page Block DTO

`page-block-registry.tsx` принимает project DTO, а не Payload block union.

## TASK 02.4 — Site Chrome DTO

Проверить `site-chrome` и globals:

- explicit select;
- explicit access mode;
- output DTO validation;
- no raw Payload types in UI.

## TASK 02.5 — Mechanical boundary

Запретить imports в:

```text
src/components/**
src/ui/**
```

из:

```text
@/payload-types
payload
@payloadcms/*
@/project/*
@/core/data-access/*
```

Исключения только в специально зарегистрированных composition/server adapter files.

## TASK 02.6 — Package strategy

Зафиксировать:

```text
FOLDER FORM = canonical
```

Не переносить UI массово в `packages/ui`.

`packages/contracts` оставить активным.

`packages/ui` на этом этапе только **пометить reserved/inactive**.

Удаление рабочего workspace-пакета в середине remediation ломает
`pnpm-workspace.yaml`/lockfile ради нулевой выгоды. Вопрос об удалении
вернуть после EPIC 14.

## Acceptance Criteria

```text
Payload document
→ Public Gateway
→ DTO
→ UI
```

без bypass.

## Proof

```bash
pnpm verify:guards
pnpm verify:guards:test
pnpm typecheck
pnpm verify
```

---

# EPIC 03 — SCHEMA HARDENING + SAFE DEACTIVATION 5.5

**Priority:** P0 before feed activation  
**Risk:** RISKY / MIGRATION

## TASK 03.1 — Properties enums — `OWNER_DECISION_REQUIRED`

Это destructive-adjacent миграция на живой БД и она попадает под стоп-фактор §1.4.
AI не выполняет её автономно: сначала фиксирует предлагаемый enum-diff, план
миграции и влияние на существующие записи, затем ждёт решения владельца.

Нормализовать:

```text
category:
apartment | house | land | commercial

dealType:
sale | rent
```

Если текущая product model требует другой enum — сначала сверить PRD и Core, не придумывать новые значения.

## TASK 03.2 — Numeric DB contract

Проверить money/area types.

Требования:

```text
money = integer minor units
area = decimal(10,2) equivalent
```

Не полагаться только на application validation.

## TASK 03.3 — Feed invariants

Server-side invariants:

```text
origin=feed
→ feedSource required
→ externalId required
→ importHash required after successful import

market must match feed source market
```

## TASK 03.4 — Manual publication invariant

Manual passport нельзя считать publishable, если нет:

```text
slug
publishedAt
verifiedAt
verdict
riskSummary
sources >= required minimum
required facts
```

Publish gate должен быть server/schema-level.

## TASK 03.5 — Redesign safe-deactivation approval

Убрать общий:

```text
required | approved | rejected
+ consumedAt
```

Ввести run-bound approval:

```text
runId
approvedBy
approvedAt
expiresAt
consumedAt
decision
```

Допустим отдельный collection/document или embedded contract — выбрать минимальный вариант.

## TASK 03.6 — Approval validation

Mass deactivation разрешена только если:

```text
approval.runId === currentRun.id
approvedAt != null
expiresAt > now
consumedAt == null
decision == approved
```

## TASK 03.7 — Baseline safety

Первый full run:

```text
never mass deactivate
```

## TASK 03.8 — Tests

Обязательные cases:

```text
approval A cannot approve run B
expired approval rejected
consumed approval rejected
rejected approval rejected
baseline cannot deactivate
threshold breach → suspicious
absolute limit breach → suspicious
approved exact run → deactivation allowed once
```

## TASK 03.9 — Migration proof

```text
clean DB migration
existing DB upgrade
schema drift
indexes
constraints
```

## Acceptance Criteria

Safe deactivation соответствует Hard Contract и не может быть случайно переиспользована.

## Proof

```bash
pnpm test:properties-contract
pnpm test:ingest-safe-deactivation
pnpm verify:schema
pnpm verify
```

---

# EPIC 04 — JOBS SCHEDULER + JANITOR + RECOVERY

**Priority:** P0/P1  
**Risk:** RISKY

## TASK 04.1 — Исправить cron

Исполняется в EPIC 00 как hotfix (TASK 00.8); здесь остаётся нормативное описание.

Ошибочная семантика в `src/project/jobs/maintenance/scheduled-tasks.ts`:

```text
{ slug: "jobsJanitor", cron: "* 0/5 * * * *" }
```

Секундное поле `*` означает срабатывание каждую секунду в подходящие минуты.

Целевое значение — минимальная дельта в один символ, единый стиль с соседними
строками (`"30 0/5 * * * *"`, `"0 0 * * * *"`):

```text
0 0/5 * * * *
```

Форму `*/5` не вводить: в репозитории повсеместно используется диалект `0/5`.
Payload 3.x понимает обе, но смешивать стили внутри одного файла не нужно.

Проверить заодно `src/project/jobs/imports/dispatch-due-feeds.ts`, где то же
выражение `"* 0/5 * * * *"`.

## TASK 04.2 — Cron guard

Добавить tests:

- seconds field не `*` для maintenance и dispatcher jobs;
- expected fire frequency;
- no accidental per-second schedule;
- **все cron-выражения проекта используют один диалект шага** (`0/N`, не `*/N`).

## TASK 04.3 — autoRun contract

Явно задать для queues:

```text
queue
limit
disableScheduling
```

Не оставлять implicit concurrency.

## TASK 04.4 — Реальный jobsJanitor

Заменить stub handler.

Janitor должен:

- находить orphan queued import runs;
- находить stale running imports;
- переводить stale run → interrupted;
- не выполнять mass deactivation;
- сохранять безопасную summary;
- не трогать active healthy jobs.

## TASK 04.5 — Import orphan recovery

Если dispatcher:

```text
created import-run
→ queue failed
```

janitor должен позже обнаружить orphan.

## TASK 04.6 — Lead recovery pagination

Убрать hard ceiling `1000`.

Сделать bounded pagination/cursor loop.

То же проверить для `payload-jobs`.

## TASK 04.7 — Maintenance registry

Убрать позиционную деструктуризацию массива tasks.

Получать task по slug или создавать explicit objects.

## TASK 04.8 — One jobs owner — `OWNER_DECISION_REQUIRED`

Цель: machine-checkable runtime contract `exactly one JOBS_AUTORUN=true`.

Варианты, между которыми AI **не выбирает сам**:

| Вариант | Суть | Цена |
|---|---|---|
| 1 | Postgres advisory lock при старте jobs-owner | RISKY, меняет runtime-архитектуру |
| 2 | Служебная запись владения с TTL | RISKY, новая таблица/миграция |
| 3 | Runbook-проверка в OPERATIONS + deploy-шаг | честный минимум, без новой инфраструктуры |

Варианты 1 и 2 добавляют инфраструктуру, ограниченную §1.6. По умолчанию
до решения владельца действует вариант 3.

## Acceptance Criteria

- scheduler не создаёт storm;
- stale/orphan jobs восстанавливаются;
- janitor не заглушка;
- recovery масштабируется больше 1000 записей.

## Proof

```bash
pnpm test:jobs-config
pnpm test:maintenance-jobs
pnpm test:ingest-import-maintenance
pnpm test:lead-delivery-recovery
pnpm verify
```

---

# EPIC 05 — LEAD DELIVERY END-TO-END

**Priority:** P0 / BLOCKER  
**Risk:** RISKY / PII / OUTBOUND  
**Depends on:** EPIC 11 (транспорт зафиксирован до построения доставки)  
**Цель:** пользовательская заявка реально доходит до Telegram и корректно переживает ошибки.

## TASK 05.1 — Channel composition root

Создать новую директорию и файл:

```text
src/project/leads/channel-registry.ts
```

Директории `src/project/leads/` сейчас нет; существующие job-файлы лежат в
`src/project/jobs/leads/`. Создание новой директории допустимо и предпочтительно:
composition root не является job-обработчиком.

Он должен:

1. читать env только через `src/project/env.ts`;
2. parse `LEAD_CHANNELS`;
3. создавать SafeOutboundClient;
4. создавать Telegram channel;
5. возвращать registry `channelId → LeadDeliveryChannel`;
6. fail closed при неизвестном/неполном active channel.

### TASK 05.1.1 — Guard allow-list

Guard 1 (`scripts/lib/architecture-guards.mjs`) блокирует `overrideAccess: true`
вне пофайлового списка `privilegedSystemFiles`.

Правила:

```text
channel-registry.ts     → НЕ использует overrideAccess; в allow-list не вносить
System Gateway helper из TASK 05.3 → обязан быть внесён в privilegedSystemFiles
```

Без этой подзадачи `pnpm verify:guards` упадёт на новом привилегированном файле,
и AI начнёт чинить не тот слой.

## TASK 05.2 — Telegram URL

Проверить реальный Telegram Bot API path.

Токен не должен повреждаться URL-кодированием.

Добавить deterministic unit test для URL.

## TASK 05.3 — System Gateway read

Создать privileged helper в `src/core/data-access/system/` и внести его в
`privilegedSystemFiles` (см. 05.1.1).

Возвращаемый контракт **должен включать retry-состояние**, иначе на шаге 05.4
придётся делать второй запрос к БД или счётчик попыток обнулится:

```text
leadDeliveryId
→ delivery + lead
→ {
    payload: LeadDeliveryPayload,
    attempts: number,
    attemptLog: readonly LeadDeliveryAttemptLogEntry[],
    channelId: string
  }
```

`planRetryableLeadDeliveryFailure` принимает `attempts` и `attemptLog` на вход,
а в `LeadDeliveryPayload` этих полей нет — поэтому они возвращаются отдельно.

Не передавать raw Payload docs в handler.

## TASK 05.4 — Full deliverLead handler

Реальная последовательность:

```text
claim pending → sending
→ load delivery + lead + attempts + attemptLog   (TASK 05.3)
→ resolve channel                                 (TASK 05.1)
→ deliver()
```

Шаг чтения `attempts`/`attemptLog` обязателен и идёт до планирования retry.

### success

```text
→ externalRef
→ status sent
→ clear error
```

### retryable failure

```text
→ retry plan
→ attempts++
→ safe log
→ pending
→ waitUntil
```

### non-retryable

```text
→ failed / terminal policy
```

### exhausted attempts

```text
→ abandoned
```

## TASK 05.5 — Ввести `maxAttempts` в retry-plan — RISKY

**Фактическое состояние кода** (`src/core/leads/delivery-state.ts`):

```text
planRetryableLeadDeliveryFailure:
  backoff = backoffMs[Math.min(attempts, backoffMs.length - 1)]
  → всегда status: "pending"
  → перехода в "abandoned" нет вообще
```

То есть после исчерпания лестницы задача вечно повторяется с шагом 240m.
Статус `abandoned` существует в `LeadDeliveryStatus` и обрабатывается в
`retryAbandonedLeadDelivery`, но **производителя у него нет**.

Требование:

```text
attempts >= maxAttempts
→ status: "abandoned"
→ enqueueNextAttempt: false
→ nextAttemptAt не выставляется
```

Backoff-лестница остаётся:

```text
immediate → +1m → +5m → +15m → +60m → +240m → abandoned
```

### Затронутая сигнатура (почему RISKY)

| Файл | Что меняется |
|---|---|
| `src/core/leads/delivery-state.ts` | `LeadDeliveryRetryPlan.status` расширяется до `"failed" \| "pending" \| "abandoned"`; вход получает `maxAttempts` |
| `src/core/data-access/system/lead-delivery.ts` | `LeadDeliveryFailurePlan.status` расширяется; `recordLeadDeliveryFailureAndMaybeRetry` сейчас фильтрует `where: status equals "sending"` и возвращает `"failed" \| "retry_scheduled"` — добавить терминал `abandoned` |
| `src/project/jobs/leads/deliver-lead.ts` | обработка нового терминального исхода |

Это изменение типов в трёх файлах, а не косметика. Обязательны обновлённые
`test:lead-delivery-state` и `test:lead-delivery-task`.

## TASK 05.6 — Unknown outcome policy

Для Telegram timeout/unknown:

Default safe policy:

```text
unknown
→ retryable
→ possible duplicate documented
```

Не считать доставленным без remote confirmation.

Если owner policy уже зафиксирована — следовать ей.

## TASK 05.7 — Heartbeat

Для долгой outbound operation:

```text
sending
→ periodic heartbeat
```

Heartbeat interval < stale threshold.

Heartbeat не хранит PII.

## TASK 05.8 — Enqueue failure observability

`enqueueLeadDelivery` не проглатывает ошибку молча.

Логировать:

```text
safe error code
leadDeliveryId
queue state
```

Без:

```text
name
phone
email
message
token
chat id
```

## TASK 05.9 — E2E fake transport tests

Cases:

```text
success
400
429
500
timeout-before-response
unknown timeout
invalid channel
queue unavailable
process crash after commit before enqueue
```

## TASK 05.10 — Proof G

Доказать:

```text
POST /api/public/leads
→ DB lead
→ delivery
→ job
→ fake/controlled Telegram
→ sent + externalRef
```

## TASK 05.11 — Честная политика дублей (ADR)

`lead-deliveries.idempotencyKey` существует, уникален и формируется как
`lead:<id>:channel:<channelId>`. Но **Telegram Bot API не принимает
idempotency key**: защиты от дубля на стороне получателя нет.

В связке с политикой 05.6 (`unknown → retryable`) таймауты гарантированно
дадут повторные сообщения.

Требования:

1. зафиксировать в ADR, что дедупликация на стороне Telegram невозможна;
2. включить `deliveryId` в текст сообщения как визуальный маркер для оператора;
3. описать в OPERATIONS, как оператор распознаёт дубль.

Без этой задачи 05.6 создаёт операционную проблему вместо её решения.

## TASK 05.12 — Операторский путь ручного retry

`retryAbandonedLeadDelivery` и `manualRetryAudit` реализованы, есть
`test:lead-delivery-admin`. Не описано, **через что оператор это вызывает**.

Требования:

- зафиксировать конкретный путь (Payload admin action либо документированная процедура);
- описать его в `docs/OPERATIONS.md`;
- проверить вручную и записать evidence.

Иначе `abandoned` — тупик без выхода.

## Acceptance Criteria

Форма может быть включена только после полного proof.

## Proof

```bash
pnpm test:leads-transaction
pnpm test:lead-delivery-channel
pnpm test:lead-delivery-state
pnpm test:lead-delivery-task
pnpm test:lead-delivery-admin
pnpm test:lead-delivery-recovery
pnpm test:lead-delivery-secrets
pnpm test:leads-intake
pnpm verify
```

---

# EPIC 06 — INGEST END-TO-END

**Priority:** P0 before feed activation  
**Risk:** RISKY / DATA

## TASK 06.1 — Ingest composition root

Создать реальный ingest orchestration layer.

## TASK 06.2 — Resolve feed secret reference

`feedUrlRef` содержит только SecretMaster reference.

Raw credential/feed URL не хранить в DB.

Нужен adapter, который получает фактический URL из разрешённого secret contour.

Если нет подключённого runtime SecretMaster API — зафиксировать owner/runtime injection contract без помещения secret в repository.

## TASK 06.3 — Fetch

Pipeline:

```text
SafeOutboundClient
→ If-None-Match
→ If-Modified-Since
→ response limits
→ timeout
```

## TASK 06.4 — Conditional response

```text
304
→ unchanged
→ no business writes
→ correct run finalization
```

## TASK 06.5 — Parse

```text
parser registry
→ YRL parser
→ limits
→ issues
```

Critical/suspicious parse не должен изменять live inventory.

## TASK 06.6 — Normalize

Raw feed offer:

```text
→ typed normalized offer
→ domain mapping
```

Не писать raw feed shape напрямую в `properties`.

## TASK 06.7 — Idempotent upsert

Для каждого offer:

```text
(feedSource, externalId)
→ find current owner
→ manual/different-feed protection
→ compare importHash
→ create/update/touch-seen
```

## TASK 06.8 — Business ownership

Feed не может перезаписывать manual-owned fields.

Field ownership policy должна быть explicit и tested.

## TASK 06.9 — Import issues

Сохранять bounded diagnostics:

```text
severity
safeCode
externalId
path
safe message
```

Не сохранять raw secret/feed credentials.

## TASK 06.10 — Safe deactivation

После успешного полного run:

```text
missing scope
→ baseline check
→ threshold
→ absolute ceiling
→ run-bound approval
→ archive
```

## TASK 06.11 — Run finalization

Terminal states:

```text
completed
unchanged/skipped
suspicious
failed
interrupted
```

Ни один штатный run не остаётся `running` навсегда.

## TASK 06.12 — Heartbeat

Во время long import:

```text
periodic heartbeat
outside business transaction
```

## TASK 06.13 — Batch cache invalidation

После commit:

```text
affected complexes
affected slices
catalog
→ one batch invalidation
```

## TASK 06.15 — Scheduling contract для `nextDueAt`

**Факт:** `dispatchDueFeeds` сдвигает `nextDueAt` один раз — в момент claim.
Поведение после завершения run нигде не определено.

Последствие: при падении импорта фид либо застревает, либо молотит непрерывно.

Зафиксировать и реализовать:

```text
кто владеет nextDueAt после run
что происходит при failed
что происходит при interrupted
что происходит при suspicious
есть ли backoff у постоянно падающего фида
```

## TASK 06.14 — Proof A/C/D

Минимум:

```text
baseline full run
same feed
304
changed feed
40% missing → suspicious
exact approval → deactivate
truncated feed → no deactivation
kill running import → interrupted
next run succeeds
```

## Acceptance Criteria

`importFeed` — полноценный ingestion task, а не status transition.

## Proof

```bash
pnpm test:ingest-parser-contract
pnpm test:ingest-import-state
pnpm test:ingest-field-ownership
pnpm test:ingest-safe-deactivation
pnpm test:ingest-import-maintenance
pnpm test:ingest-integration-block
pnpm verify
```

---

# EPIC 07 — RUNTIME PUBLISHING + CACHE INVALIDATION

**Priority:** P1  
**Risk:** RISKY

## TASK 07.1 — Dynamic route publication contract

Проверить:

```text
/obekty/[slug]
/novostroyki/[slug]
/zastroyshchik/[slug]
```

Если новый published DB record должен появляться без rebuild:

- убрать `dynamicParams=false`;
- сохранить server-first route;
- использовать controlled cache/revalidation.

## TASK 07.2 — CMS publish without deploy test

Сценарий:

```text
create published complex
→ no build
→ request slug
→ 200
```

## TASK 07.3 — Collection invalidation hooks

Подключить после успешного commit:

```text
pages
properties
regions
residential-complexes
developers
redirects
site-settings
navigation
```

к CacheInvalidator.

## TASK 07.4 — No invalidation rollback

Cache failure:

```text
business write remains committed
→ operational issue logged
→ retry/monitoring
```

## TASK 07.5 — Silent fallback observability

Public readers не должны превращать DB/Payload outage в тихое `[]` без operational signal.

Допускается graceful UI fallback, но:

```text
empty business result
!=
infrastructure failure
```

## TASK 07.6 — B2 proof (endpoint уже существует)

`src/app/api/internal/revalidate/route.ts` и `test:internal-revalidate` уже есть.
Писать endpoint не нужно.

Задача — доказать сквозной путь:

```text
mutation
→ collection hook
→ HTTP revalidate
→ next public request sees fresh data
```

## Acceptance Criteria

Runtime CMS publication работает без rebuild и без stale content.

---

# EPIC 08 — SEO / SITEMAP / ARCHIVED LIFECYCLE

**Priority:** P1  
**Risk:** STANDARD/RISKY

## TASK 08.1 — Unified sitemap sources

Sitemap должен включать:

```text
static registry
published CMS pages
published manual passports
published complexes
published developers
published articles later
```

## TASK 08.2 — Exclusions

Никогда не включать:

```text
draft
hidden
noindex
unit routes
layout routes
filter states
archived noindex
```

## TASK 08.3 — Dynamic passport metadata

Manual property:

```text
title
description
canonical
robots
OG
structured data only from facts
```

## TASK 08.4 — Archived retention — содержит `OWNER_DECISION_REQUIRED`

Выбор между `301` и `410` при отсутствии достоверной релевантной цели —
owner-решение по §1.4. AI фиксирует кандидатов и останавливается, а не выбирает.

Contract:

```text
recent archived
→ 200
→ noindex
```

После retention:

```text
relevant replacement exists
→ 301

no relevant replacement
→ 410
```

Не редиректить всё автоматически на `/obekty/`.

## TASK 08.5 — Catalog lifecycle execution

`catalogLifecycle` должен не только считать expired records.

Должен формировать/исполнять lifecycle decision либо поддерживать route-level typed decision source.

## TASK 08.6 — Redirect safety

Проверить:

```text
no loops
no chains
no self redirect
target exists
no redirect to generic home
```

## TASK 08.7 — Sitemap runtime test

Publish:

```text
property
complex
developer
```

и доказать появление в sitemap без rebuild.

## Acceptance Criteria

SEO lifecycle соответствует фактическому publication lifecycle.

---

# EPIC 09 — REGIONS: SINGLE SOURCE OF TRUTH

**Priority:** P1  
**Risk:** RISKY / DATA

## TASK 09.1 — Инвентаризация duplicated data

Сравнить:

```text
Payload regions
src/content/regions/region-route-plan.ts
src/content/regions/region-dtos.ts
SEO registry
```

## TASK 09.2 — Ownership decision

Зафиксировать:

```text
Payload = domain/content owner
Code = routing/composition policy
SEO registry = explicit index policy
```

## TASK 09.3 — Перенос фактического domain content

Убрать из hardcoded route plan, где это уже CMS-owned:

```text
title
lead
investment thesis
risk summary
media
status
hierarchy
```

## TASK 09.4 — Route path

Path вычислять из:

```text
slug
parent relation
reserved namespace policy
```

## TASK 09.5 — Stub Sochi

Сохранить текущий продуктовый contract:

```text
200
noindex
no child cluster
```

пока owner не меняет решение.

## TASK 09.6 — Internal links

Генерировать из domain hierarchy + approved cross-links.

## Acceptance Criteria

Нет двух параллельных региональных баз данных.

---

# EPIC 10 — UI CORE 5.0 CONFORMANCE

**Priority:** P1  
**Risk:** STANDARD

## TASK 10.1 — Motion contract

Удалить project duration token:

```text
--motion-duration-fast
@utility duration-fast
```

Заменить consumers:

```text
duration-fast
→ duration-150
```

Semantic easing сохранить через `--ease-*`.

## TASK 10.2 — LeadForm primitives

Перевести client LeadForm на canonical shadcn primitives:

```text
Input
Textarea
Button
Checkbox
Field
Label
```

Не менять transport/business contract.

## TASK 10.3 — Один canonical Button/control system

Проверить отсутствие второго визуального pattern.

## TASK 10.4 — Presentation DTO guard

UI drift audit должен также ловить:

```text
@/payload-types
@/project/*
@/core/data-access/*
```

в presentation.

## TASK 10.5 — P2 drift report

UI Drift:

```text
P0/P1 → blocking
P2 → report/backlog
```

## TASK 10.6 — Responsive/accessibility regression

Representative widths:

```text
390
768
1024
1440
```

Проверить:

- overflow;
- CTA ≥ touch target;
- keyboard;
- focus;
- headings;
- labels;
- error association;
- reduced motion.

## Acceptance Criteria

UI соответствует v5.0 без визуального redesign.

---

# EPIC 11 — OUTBOUND SECURITY HARDENING

**Priority:** P0 / BLOCKER (перемещён перед EPIC 05)  
**Risk:** SECURITY  
**Почему раньше:** EPIC 05 строит доставку поверх Safe Outbound Client. Менять
семантику redirect и DNS-политику после доказанной доставки означает
переделывать proof G. Транспорт фиксируется первым.

## TASK 11.1 — Redirect method semantics

SafeOutboundClient:

- 303 → GET + no body;
- 301/302 для non-GET → безопасная подтверждённая политика;
- 307/308 → preserve method/body only if policy allows.

## TASK 11.2 — Cross-host redirect headers

При смене host:

- не переносить auth-like headers;
- заново проверять allowlist;
- заново проверять resolved IP.

## TASK 11.3 — DNS rebinding / TOCTOU

Закрыть разрыв:

```text
DNS safety check
→ fetch performs separate DNS resolution
```

Использовать pinned/resolved connection strategy, если она реалистична для Node runtime.

Если выбранный HTTP stack не позволяет надёжный pinning — зафиксировать residual risk и компенсирующие меры.

## TASK 11.4 — SSRF test matrix

```text
https allowlisted public IP → allowed
http → denied
127.0.0.1 → denied
10/8 → denied
169.254/16 → denied
private IPv6 → denied
redirect to private → denied
redirect outside host allowlist → denied
```

## Acceptance Criteria

Safe Outbound Client остаётся единственным configurable outbound boundary.

---

# EPIC 12 — S3 / MEDIA PRODUCTION CONTRACT

**Priority:** P1 before production  
**Risk:** RISKY / INFRA

## TASK 12.1 — Production env fail-fast

В production profile S3 обязателен:

```text
S3_ENDPOINT
S3_REGION
S3_BUCKET
S3_ACCESS_KEY
S3_SECRET_KEY
```

## TASK 12.2 — Timeweb S3 compatibility

Проверить:

- endpoint format;
- region;
- path-style vs virtual-host;
- exact Next image remotePatterns.

## TASK 12.3 — Upload policy

Добавить/проверить:

```text
allowed MIME
max file size
image only where intended
alt policy
decorative policy
```

## TASK 12.4 — Object source of truth

Доказать:

```text
upload via Payload
→ object in S3
→ restart/redeploy VPS
→ media remains available
```

## TASK 12.5 — Versioning / recovery

Зафиксировать Timeweb capability:

```text
versioning/retention
provider-independent backup if required
restore procedure
```

## TASK 12.6 — Missing image

Один canonical fallback pattern.

## Acceptance Criteria

VPS disk не нужен для постоянного хранения user media.

---

# EPIC 13 — TIMEWEB RUNTIME + STAGING

**Priority:** BLOCKER before production  
**Risk:** RISKY / INFRA

## TASK 13.1 — Удалить active static Nginx contract

`ops/nginx/moreigori-static.example.conf` не должен считаться current runtime config.

Создать новый runtime config.

## TASK 13.2 — Target topology

```text
Internet
→ Nginx TLS
→ 127.0.0.1:<app-port>
→ Next standalone + Payload
→ Managed PostgreSQL
→ S3
```

## TASK 13.3 — Nginx

Обязательно:

```text
TLS
proxy headers
trusted real IP contract
security headers
body size
timeouts
static assets cache
/api routing
/admin routing
no direct Node exposure
```

## TASK 13.4 — Runtime supervisor

Выбрать минимальный поддерживаемый вариант:

```text
systemd
```

или уже утверждённый проектом supervisor.

Не добавлять контейнерную оркестрацию без необходимости.

## TASK 13.5 — Immutable release

```text
/releases/<sha>/
current → symlink
```

Build происходит вне production host.

## TASK 13.6 — Atomic rollback

Rollback:

```text
current → previous release
restart
smoke
```

## TASK 13.7 — Staging

Отдельно:

```text
domain
Managed PostgreSQL
S3 bucket/prefix
secrets
noindex
restricted access
no production PII
```

## TASK 13.8 — Jobs owner handover

Deploy sequence:

```text
new runtime JOBS_AUTORUN=false
→ readiness
→ stop old jobs owner
→ assert no owner
→ start new owner JOBS_AUTORUN=true
→ health
```

## TASK 13.9 — Backup / Restore

Фактический test:

```text
backup
→ restore into disposable/staging DB
→ app reads restored state
```

## Acceptance Criteria

Production topology повторяем, откатываем и не зависит от ручной правки кода на сервере.

---

# EPIC 14 — INTEGRATION PROOF MATRIX

**Priority:** BLOCKER  
**Risk:** RISKY  
**Цель:** доказать систему как целое, а не только отдельные pure functions.

## Evidence contract

Каждый proof фиксируется файлом в `docs/proofs/`:

```text
exact SHA
дата и время
точная команда
сырой вывод
PASS / FAIL
```

Отчёт без сырого вывода не является proof. Через месяц «мы это проверяли»
без файла не имеет силы.

## 14.A — Access

```text
raw anonymous REST denied
Public Gateway works
owner works
private fields absent
leads/deliveries denied
```

## 14.B — Leads

```text
HTTP POST
→ DB transaction
→ pending delivery
→ job
→ outbound fake Telegram
→ sent

Telegram down
→ lead still committed
→ retry
→ later sent
```

## 14.C — Crash window

```text
lead committed
→ process dies before enqueue
→ recovery
→ delivery
```

## 14.D — Ingest

```text
baseline
idempotent rerun
304
changed item
manual ownership protection
different feed protection
truncated feed
suspicious deactivation
run-bound approval
interrupted import
recovery
```

## 14.E — Cache

```text
mutation
→ invalidation
→ fresh public page
```

## 14.F — Publishing

```text
publish DB record
→ no rebuild
→ route 200
→ sitemap updated
```

## 14.G — S3

```text
upload
→ page image
→ redeploy
→ still works
```

## 14.H — Retention

```text
day 100 → PII anonymized
recovery period → non-PII operational history remains
day 300 → purge
```

## 14.I — Jobs

```text
one owner
no cron storm
orphan recovery
stale running recovery
no catch-up storm
```

## 14.K — PII не попадает в логи (негативный runtime-тест)

`test:lead-delivery-secrets` — статический контракт, он не смотрит на runtime-вывод.

Требуется отдельный прогон:

```text
полный цикл заявки с тестовыми PII-маркерами
→ захват stdout / лог-файла
→ grep по маркерам: phone, email, name, message, token, chat id
→ 0 совпадений
```

## 14.J — Browser

Representative pages:

```text
/
region
/obekty/
/obekty/<slug>/
/novostroyki/
/novostroyki/<slug>/
/zastroyshchik/<slug>/
/podbor/
/privacy/
/consent/
404
```

Проверить:

- console;
- hydration;
- keyboard;
- responsive;
- forms;
- canonical;
- noindex;
- images;
- performance.

## Acceptance Criteria

Все proofs имеют фактический evidence. Никакого `CHECKED` по чтению кода.

---

# EPIC 15 — PRODUCTION RELEASE GATE

**Priority:** FINAL  
**Risk:** RISKY / OWNER GATE

## TASK 15.1 — Exact head

```text
clean main
exact SHA
no uncommitted changes
all PR merged
```

## TASK 15.2 — SourceCraft final gate

```bash
pnpm install --frozen-lockfile
pnpm audit --audit-level high
pnpm verify
pnpm verify:schema
```

Exact-head RISKY.

## TASK 15.3 — Production DB

Перед миграцией:

- backup;
- restore proof already completed;
- migration plan;
- no destructive surprise.

## TASK 15.4 — Production S3

- bucket exists;
- credentials;
- upload/read proof;
- remotePatterns exact.

## TASK 15.5 — Secrets

Secrets приходят только из SecretMaster/runtime env.

Запрещено:

```text
.env in repo
secret in docs
secret in logs
secret in task input
```

## TASK 15.6 — Deploy

```text
build artifact
→ upload versioned release
→ migrate
→ start runtime JOBS_AUTORUN=false
→ readiness
→ jobs handover
→ enable one jobs owner
→ smoke
```

## TASK 15.7 — Live smoke

Проверить:

```text
200
404
robots
sitemap
canonical
Payload Admin
S3
DB
lead E2E
Telegram
jobs
newbuild
manual passport
redirect/410
```

## TASK 15.8 — Rollback proof

Фактически выполнить controlled rollback на предыдущий artifact.

## TASK 15.9 — Final domain

`moreigori.ru` переключать только отдельным owner decision после technical preview.

## Release criterion

Production считается готовым только после фактического прохождения EPIC 14 и 15.

---

# 3. Дополнительные guard-задачи

Эти проверки должны стать постоянной частью проекта.

## Guard A — Explicit Payload Access

Fail если application Local API call не содержит explicit access mode.

## Guard B — Raw Payload Type in UI

Fail для:

```text
src/components/**
src/ui/**
```

если импортируются raw persistence types.

## Guard C — Public DTO private fields

Расширить current list и проверять contracts mechanically.

## Guard D — Job handler completeness

Не пытаться определять бизнес-готовность regex-ом. Контракт-тест обязан
подменять канал/парсер фейком и утверждать, что фейк **был фактически вызван**:

```text
deliverLead  → fake channel.deliver() вызван ровно один раз
importFeed   → fake parser/ingest/finalization вызваны
```

Проверка «функция существует» или «модуль импортируется» не засчитывается.
Это единственная машинная защита от повторения текущего дефекта-заглушки.

## Guard E — Cron

Запретить accidental per-second schedules, если это явно не разрешено.

## Guard F — UI Core 5

Запретить:

```text
duration-fast custom token
project dark:
second primitives
raw system values
```

---

# 4. Формат отчёта AI после каждого эпика

AI обязан завершать каждый эпик таким блоком:

```text
EPIC:
BRANCH:
BASE SHA:
HEAD SHA:

IMPLEMENTED:
- ...

MIGRATIONS:
- ...

TESTS ADDED/UPDATED:
- ...

PROOF ACTUALLY RUN:
- command → PASS/FAIL

NOT RUN:
- ...

GUARDS:
- ...

DOCS UPDATED:
- ...

SCOPE DEVIATIONS:
- что сделано сверх задачи и почему (пусто = ничего)

OPEN RISKS:
- ...

OWNER DECISIONS REQUIRED:
- ...

PRODUCTION CHANGED:
NO
```

Для финального release:

```text
PRODUCTION CHANGED:
YES — owner-approved release <SHA>
```

---

# 5. Приоритет исправления

## BLOCKER

В порядке исполнения v2:

```text
EPIC 00  (+ cron hotfix, verify:quick audit)
EPIC 01
EPIC 02
EPIC 11  (транспорт до доставки)
EPIC 05  (горит: теряется реальный трафик заявок)
EPIC 03
EPIC 04
EPIC 06
```

Без них не включать production leads/feed и не считать Realty Core завершённым.

## BEFORE PRODUCTION

```text
EPIC 07
EPIC 08
EPIC 09
EPIC 10
EPIC 12
EPIC 13
EPIC 14
```

## FINAL

```text
EPIC 15
```

---

# 6. Ключевой принцип выполнения

Не переписывать систему.

Нужно довести уже существующие сильные слои до реального исполнения:

```text
PURE LOGIC
+ GATEWAY
+ TASK HANDLER
+ TRANSACTION
+ OUTBOUND
+ RECOVERY
+ OBSERVABILITY
+ PROOF
=
WORKING SYSTEM
```

Главная цель remediation — убрать разрыв между «код существует и покрыт unit tests» и «подсистема действительно выполняет бизнес-задачу end-to-end».

После завершения EPIC 00–15 проект можно считать приведённым к целевому AMS Realty Platform 5.5 контуру и готовым к отдельному owner-approved production release.
