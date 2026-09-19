# ПЛАН №3 — ИСПРАВЛЕНИЯ И ФИНАЛЬНОЕ ПРИВЕДЕНИЕ «МОРЕ И ГОРЫ»

Plan ID: more-i-gory-conformance-plan3-2026-09
Version: v1
Status: APPROVED
Readiness: APPROVED
Approved by: owner
Approved at: 2026-09-19T12:01:40+03:00

**Canonical repository:** SourceCraft `integrator-p/more-i-gory-next`  
**GitHub mirror:** `neyro-level/more-i-gory-next` — не primary  
**Базовый audit SHA:** `2a3b2f5416094dfb3ad1be28732c7925bb121cea`  
**Target Core:** AMS REALTY PLATFORM CORE STANDARD 5.5 — SOLO + AI  
**Target UI:** AMS UI CORE v5.0  
**Profile:** `AMS_PROFILE=REALTY_BASE`  
**Delivery profile:** `COMMERCIAL`  
**Project mode:** `BUILD`  
**UX scope:** `PUBLIC_COMMERCIAL`  
**Назначение:** автономное выполнение Codex по утверждённому Beads-графу; локальный blocker не останавливает независимую ready work.  
**Default delivery mode:** `MERGE_AFTER_GATE` после owner approval exact версии.  
**Production release:** OUT OF SCOPE; только отдельная команда владельца.

## Lifecycle и revision history

| Версия | Статус | Вход | Результат |
|---|---|---|---|
| v0 | DRAFT | Исходный owner-аудит на SHA `2a3b2f5` | Принят как содержательная основа; импорт запрещён |
| v1 | APPROVED | Architect normalization + four-pass final audit + owner approval 2026-09-19 | Устранены collisions EPIC 33/34, построены автономные waves, owner/production gates вынесены в EPIC 44, добавлены contracts и Task Manager isolation; blocker/major findings закрыты; владелец утвердил exact v1 |

`APPROVED` назначен после финального четырёхпроходного аудита exact v1 и точной
команды владельца `План утвержден`. Импорт этого snapshot в Beads разрешён.

## Решения, зафиксированные до approval

| ID | Решение | Статус |
|---|---|---|
| OD-01 | SourceCraft — canonical primary; GitHub — mirror | DECIDED |
| OD-02 | EPIC 35–43 используют `MERGE_AFTER_GATE`; direct push в `main` запрещён | DECIDED, вступает в силу только после approval |
| OD-03 | Production, live credentials, DNS/TLS, реальный feed/channel и live-data migration preflight не входят в автономный контур | DECIDED |
| OD-04 | Старые открытые Beads-задачи планов №1/№2 не входят в Plan №3; новый graph получает отдельный prefix/Plan ID | DECIDED |

Открытых решений `before APPROVAL`: **0**.

## Автономная dependency model

Типы связей: `HARD` — без prerequisite нельзя начать; `CONTRACT` — достаточно
зафиксированного интерфейса; `SOFT` — рекомендуемый порядок без блокировки;
`OWNER/PRODUCTION` — вынесено в EPIC 44 и не блокирует EPIC 35–43.

| Epic | Outcome | Depends on | Type | Wave | Если epic заблокирован |
|---|---|---|---|---|---|
| 35 Public boundary | hidden/stub не выходят в generic public surface | none | — | A | перейти к 36, 37 или 40 |
| 36 System Gateway | privileged operations только в whitelist owner | none | — | A | перейти к 35, 37 или 40 |
| 37 Safe Outbound | bounded streaming transport contract | none | — | A | перейти к 35, 36 или 40 |
| 38 Import safety | streaming import и canonical lifecycle | EPIC 37 | HARD | B | перейти к 40/41 или 35/36 |
| 39 Lead delivery | canonical delivery state/migration | EPIC 38 merge | HARD только для migration order | C | перейти к 40/41 |
| 40 UI foundation | UI Core 5.0 guards/foundation | none | — | A | перейти к 35, 36 или 37 |
| 41 UI rhythm | normalized Section rhythm и browser matrix | EPIC 40 | CONTRACT | B | перейти к 38/39 |
| 42 Final proofs | финальные proofs на общем code state | EPIC 35–41 | HARD | D | не начинать до закрытия prerequisites |
| 43 SoT closeout | docs/machine state соответствуют final main | EPIC 42 | HARD | E | не начинать до final proofs |
| 44 Owner/production gates | только реальные external/live действия | EPIC 43 | OWNER/PRODUCTION | F | естественная остановка; нужна отдельная команда владельца |

Shared-file conflicts (`scripts/lib/architecture-guards.mjs`, schema/migrations,
design contracts) снимаются правилом «один active implementation stream, новая
ветка от актуального `main` после каждого merge». Они не являются HARD
dependencies между независимыми эпиками Wave A.

## Epic execution contract

Для EPIC 35–43 действует единый contract:

- **Entry:** все его `HARD` dependencies merged; ветка создана от fresh
  `origin/main`; scope/source files ещё соответствуют плану.
- **Scope out:** production, live secrets, DNS/TLS, новый stack, второй ORM/UI
  foundation и unrelated cleanup.
- **Exit:** все task acceptance выполнены, targeted checks и обязательный
  project `pnpm verify` фактически PASS, evidence ledger записан, PR exact-head
  прошёл требуемый gate и merged.
- **Rollback/recovery:** до merge — revert task commits в своей ветке; после
  merge — новый revert/fix PR. Применённые migrations не переписывать и не
  откатывать через rollback другого epic.
- **Stop current task:** destructive/live-data surprise, новый secret/paid
  external action, scope expansion или противоречие с Source of Truth. Оформить
  blocker, освободить claim и взять другую ready task Plan №3.
- **Stop whole autonomous run:** только когда implementation graph EPIC 35–43
  завершён либо во всём Plan №3 не осталось safe ready work.

## Task Manager isolation

- будущий Beads prefix: `mg3`;
- source graph: только Plan ID `more-i-gory-conformance-plan3-2026-09` exact version/hash;
- старые `mg-*` и `mig-*` задачи не выбираются Developer-циклом Plan №3;
- если у Plan №3 уже есть active epic branch/worktree и в этом epic есть ready
  task, Developer продолжает этот epic до delivery; переключение на другой
  epic допускается только после delivery или оформления blocker текущего epic;
- при отсутствии active epic scheduler выбирает минимальную доступную wave, а
  внутри wave — меньший EPIC ID; это порядок исполнения, не новая HARD-связь;
- при блокировке task она получает явный blocker, claim освобождается, затем
  выбирается другая ready implementation task этого Plan ID;
- production/owner nodes не выдаются роли `implementation`.

---

# 0. ОБЯЗАТЕЛЬНЫЙ EXECUTION CONTRACT

## 0.1 Порядок работы

Каждый implementation EPIC выполняется только от актуального `main`. Порядок
между независимыми эпиками определяется ready queue, а не номером.

```text
git checkout main
→ git pull / fetch exact main
→ убедиться, что все HARD dependencies текущего EPIC merged
→ создать новую branch
→ выполнить только текущий EPIC
→ targeted WORK checks
→ обновить tests/docs только в scope EPIC
→ review diff
→ PR
→ exact-head merge gate
→ merge
→ удалить/закрыть branch
→ следующая ready implementation task/EPIC этого Plan ID снова от fresh main
```

Запрещено:

```text
открывать branches нескольких EPIC одновременно одним worker
объединять два EPIC в один PR
ослаблять guard/test ради green
делать speculative rewrite
менять stack
добавлять Redis/broker/search/PostGIS
вводить второй ORM
вводить второй UI foundation
делать production cutover
```

## 0.2 WORK / MERGE

Во время работы запускать только необходимые targeted checks.

Перед merge сначала локальные/risk-specific проверки, затем один exact-head
SourceCraft gate текущего PR:

### STANDARD

```text
targeted tests
typecheck
lint
relevant guards
exact-head STANDARD gate
```

### RISKY

```text
targeted integration tests
typecheck
lint
relevant guards
migration/schema proof при применимости
pnpm verify
pnpm verify:schema
exact-head RISKY gate
```

Не заменять SourceCraft/Git merge gate локальным сообщением `PASS`.

`pnpm verify:schema` обязателен только для schema/migration epic. `pnpm verify`
выполняется перед каждым merge по project contract; EPIC 42 не повторяет
одинаковый build/test без причины, а собирает final cross-boundary evidence.

## 0.3 Отчёт после каждого EPIC

```text
СДЕЛАНО:
ПРОВЕРЕНО ФАКТИЧЕСКИ:
MIGRATION / SECURITY:
НЕ ПРОВЕРЕНО:
РИСКИ / ОТКРЫТЫЕ РЕШЕНИЯ:
PR:
MERGE SHA:
```

Для UI дополнительно:

```text
REUSED:
CREATED + OWNERSHIP:
VARIANTS ADDED:
NEW TOKENS + WHY:
UPSTREAM PRIMITIVE EXCEPTIONS:
ARBITRARY VALUES + JUSTIFICATION:
RESPONSIVE / STATES / ACCESSIBILITY:
SEO / PAGE CONTRACT:
```

---

# EPIC 35 — PUBLIC DATA / PUBLICATION BOUNDARY

**Risk:** RISKY  
**Branch:** `codex/plan3-epic-35-public-boundary`  
**Dependencies:** none

## Цель

Закрыть возможность выхода `hidden` entities в публичный runtime и вернуть все public reads под контракт:

```text
Public consumer
→ Public Gateway
→ explicit access
→ explicit depth/select/limit
→ publication predicate
→ serializable DTO
```

## TASK 35.1 — Regions publication predicate

Проверить и исправить:

```text
src/core/data-access/public/regions.ts
src/core/data-access/public/regions-contract.ts
```

Public reader должен возвращать только действительно публичные сущности.

Для generic public region contract:

```text
status=published → разрешено
status=hidden    → запрещено
status=stub      → запрещено generic reader
```

`stub` допускается только через отдельный project-specific route/contract, если такой route предусмотрен проектом.

Не фильтровать `hidden` только после получения массива. Publication predicate должен существовать на data-access boundary.

## TASK 35.2 — Generic dynamic route

Проверить:

```text
src/app/(site)/investicionnaya-nedvizhimost/[...path]/page.tsx
```

Contract:

```text
published → render
hidden    → notFound
unknown   → notFound
stub      → notFound в generic route
```

Не считать проверку только `region.status === "stub"` достаточным publication gate.

## TASK 35.3 — Hub / static params / related links

Проверить:

```text
listPublicRegions
listPublicHubRegions
generateStaticParams
getPublicRegionRelatedLinks
```

`hidden` entity не имеет права:

```text
попадать в public hub
создавать static param
создавать parent/child/sibling public link
создавать generic public route
```

## TASK 35.4 — Sitemap только через Public Gateway

Сейчас проверить:

```text
src/seo/sitemap-source.ts
```

После исправления SEO layer не должен напрямую импортировать:

```text
payload
@payloadcms/*
@payload-config
```

Создать/расширить Public Gateway reader для CMS sitemap data.

Пример ownership:

```text
src/core/data-access/public/sitemap-pages.ts
```

Reader contract:

```text
server-only
overrideAccess:false
explicit depth
explicit select
explicit limit
status=published
DTO only
```

## TASK 35.5 — Нормализовать DTO ownership

Не делать массовый rewrite.

Целевая ownership-модель:

| DTO family | Owner |
|---|---|
| Shared/project serializable contracts | `packages/contracts/**` |
| Realty/public DTO, если project-local | `src/core/dto/**` |
| Payload select/query/mapping logic | `src/core/data-access/public/**` |
| Presentation | импортирует DTO/contracts, не data-access |

Не создавать второй набор одинаковых DTO.

Если существующий `*-contract.ts` содержит одновременно:

```text
Payload select
mapping
DTO schema/type
```

разделить только там, где это реально необходимо для чистой dependency boundary.

## TASK 35.6 — Architecture guards

Добавить mechanical protection:

```text
src/seo/**
-X→ payload
-X→ @payloadcms/*
-X→ @payload-config
```

Добавить regression test на отсутствие public region reader без publication predicate.

## TASK 35.7 — Tests

Запустить:

```bash
pnpm test:regions-contract
pnpm test:regions-routing
pnpm test:regions-public-content
pnpm test:regions-internal-links
pnpm test:sitemap-source
pnpm test:public-gateway
pnpm test:presentation-dto-guard
pnpm test:seo-contract
pnpm verify:guards
pnpm verify:guards:test
pnpm typecheck
pnpm lint
```

Добавить tests:

```text
hidden region → absent from public reader
hidden region → absent from hub
hidden region → absent from static params
hidden region → absent from related public links
hidden region → absent from sitemap
published region → present
SEO → Payload import → guard FAIL
```

## Merge

```text
merge-risky
exact PR HEAD
```

## DoD

```text
[ ] hidden entity невозможно получить через public region contract
[ ] sitemap не читает Payload напрямую
[ ] DTO ownership однозначен
[ ] guards ловят повторный обход
[ ] pnpm verify GREEN на PR HEAD
[ ] pnpm verify:schema GREEN
```

---

# EPIC 36 — SYSTEM GATEWAY / PRIVILEGED OPERATIONS

**Risk:** RISKY  
**Branch:** `codex/plan3-epic-36-system-gateway`  
**Dependencies:** none

## Цель

Обеспечить invariant:

```text
overrideAccess:true
→ только whitelist System Gateway operations
```

## TASK 36.1 — Seed scripts

Проверить:

```text
scripts/seed-regions.mjs
scripts/seed-media-assets.mjs
```

Убрать из orchestration scripts прямые:

```text
payload.find
payload.create
payload.update
overrideAccess:true
```

Privileged operations перенести в:

```text
src/core/data-access/system/**
```

Script остаётся только orchestration layer.

## TASK 36.2 — Narrow System Gateway operations

Допустимые owners, например:

```text
src/core/data-access/system/seed-regions.ts
src/core/data-access/system/seed-media.ts
```

Не создавать generic privileged CRUD helper.

Каждая privileged function должна описывать конкретную whitelist system operation.

## TASK 36.3 — Guard coverage для scripts

Расширить Guard 1 на executable operational scripts.

Проверять:

```text
scripts/*.mjs
```

Исключить:

```text
*.test.mjs
test fixture strings
```

Regression:

```text
scripts/example.mjs + overrideAccess:true
→ FAIL
```

## TASK 36.4 — Local API inventory

Обновить:

```text
docs/research/payload-local-api-inventory.md
```

`SYSTEM GATEWAY` должен означать фактический module внутри:

```text
src/core/data-access/system/**
```

а не orchestration script.

## TASK 36.5 — Tests

```bash
pnpm test:system-gateway
pnpm test:payload-local-api-inventory
pnpm test:explicit-access-mode
pnpm test:regions-seed
pnpm test:media-seed
pnpm verify:guards
pnpm verify:guards:test
pnpm typecheck
pnpm lint
```

## Merge

```text
merge-risky
```

## DoD

```text
[ ] operational scripts не содержат overrideAccess:true
[ ] privileged seed operations имеют System Gateway owner
[ ] guard покрывает operational scripts
[ ] Local API inventory соответствует коду
```

---

# EPIC 37 — SAFE OUTBOUND TRANSPORT BOUNDARIES

**Risk:** RISKY  
**Branch:** `codex/plan3-epic-37-safe-outbound`  
**Dependencies:** none

## Цель

Сделать `timeout` и `maxResponseBytes` реальными transport/memory boundaries.

## TASK 37.1 — Early response size enforcement

Проверить:

```text
src/core/security/outbound-http/index.ts
```

Production HTTPS transport не должен сначала накапливать полный:

```text
Buffer[]
```

и только после `end` проверять размер.

Целевое поведение:

```text
incoming chunk
→ receivedBytes += chunk.length
→ receivedBytes > maxResponseBytes
→ abort/destroy stream immediately
→ outbound_response_too_large
```

## TASK 37.2 — Streaming response path

Safe Outbound Client должен уметь отдавать большой feed как bounded stream:

```text
ReadableStream<Uint8Array>
или
AsyncIterable<Uint8Array>
```

Small-response helper можно сохранить для:

```text
lead delivery
internal revalidate
small APIs
```

Не создавать второй security client.

## TASK 37.3 — Preserve security boundaries

Сохранить:

```text
HTTPS default
exact host allowlist
localhost/private/link-local deny
DNS resolution
DNS pinning
redirect destination re-check
cross-host auth stripping
timeout
max redirects
```

## TASK 37.4 — Mid-stream testability seam

Сделать streaming implementation тестируемой без ослабления production security.

Допускается:

```text
internal transport abstraction
injectable test transport
stream reader helper
```

Test seam не должен быть активируем production env.

## TASK 37.5 — Regression tests

Добавить:

```text
oversized Content-Length → early reject
chunked oversized body → abort до полного body
exact limit → success
slow body → timeout mid-stream
redirect to unapproved host → reject
redirect to unsafe address → reject
cross-host auth → stripped
```

Proof не должен основываться только на факте, что после полного body функция вернула ошибку.

## Tests

```bash
pnpm test:safe-outbound
pnpm test:fetch-feed
pnpm test:lead-delivery-channel
pnpm test:internal-revalidate
pnpm verify:guards
pnpm typecheck
pnpm lint
```

## Merge

```text
merge-risky
```

## DoD

```text
[ ] maxResponseBytes применяется во время чтения
[ ] oversized body не буферизуется полностью
[ ] streaming API готов для ingest
[ ] SSRF / DNS / redirect protections сохранены
```

---

# EPIC 38 — IMPORT SAFETY / STREAMING / BASELINE / LIFECYCLE

**Risk:** RISKY — critical data surface  
**Branch:** `codex/plan3-epic-38-import-contract`  
**Dependencies:** EPIC 37 merged

## Цель

Привести XML/YRL import к AMS Core 5.5 без потери уже работающих safety guarantees.

## TASK 38.1 — End-to-end streaming XML

Удалить архитектурную цепочку:

```text
full HTTP body
→ full Uint8Array
→ full XML string
→ chunkXmlInput
→ SAX
```

Целевая цепочка:

```text
Safe Outbound stream
→ byte counter
→ incremental UTF-8 decode
→ incremental SHA-256
→ SAX.write(chunk)
→ normalized bounded processing
```

До SAX запрещено создавать:

```text
полный Buffer
полный Uint8Array
полную XML string
```

## TASK 38.2 — Incremental feed hash

Вычислять `sha256` по stream chunks.

Hash считается доказанным только после полного успешного чтения response.

## TASK 38.3 — `HTTP 200 + same hash → unchanged`

После полного safe stream read:

```text
feedHash == lastFeedHash
→ persisted run = unchanged
→ 0 inventory business writes
→ 0 deactivation
```

Для byte-identical feed:

```text
lastSuccessfulRunAt → update
lastFullRunAt       → update, потому что полный response успешно дочитан
lastOfferCount      → НЕ менять
```

Причина: full read доказан, но новый offer count не вычислялся и safe baseline уже известен из предыдущего идентичного feed.

Не менять это правило без отдельного документированного решения.

## TASK 38.4 — `HTTP 304 → unchanged`

При `304`:

```text
persisted run        → unchanged
lastSuccessfulRunAt  → update
lastAttemptAt         → already/update according to dispatcher contract
nextDueAt             → schedule normally
```

Не менять:

```text
lastOfferCount
lastFullRunAt
inventory
safe deactivation baseline
```

`304` не является полным чтением body.

## TASK 38.5 — Suspicious baseline corruption

Исправить current behavior, при котором failed/suspicious finalization способна менять baseline fields.

Только:

```text
full successful run
AND structural integrity passed
AND safety checks passed
```

может продвигать baseline.

Для `suspicious`:

```text
lastOfferCount → unchanged
safe baseline  → unchanged
mass deactivation → forbidden
```

Regression:

```text
baseline = 1000

run A:
100 offers
→ suspicious
→ baseline remains 1000

run B:
100 offers
→ suspicious again
→ baseline remains 1000
→ no mass deactivation
```

## TASK 38.6 — Canonical import-run lifecycle

Persisted statuses:

```text
queued
running
success
unchanged
suspicious
interrupted
failed
```

Убрать из persisted canonical state:

```text
completed
skipped
```

Internal pipeline result `skipped` можно сохранить как control-flow concept, если он не становится persisted semantic status.

## TASK 38.7 — Migration preflight для historical statuses

До migration сформировать report фактических historical values.

Особенно `status=skipped`.

Текущий код persist-ит `skipped` через 304 finalizer, а failed `claim-running` возвращает `skipped` только как internal pipeline result. Однако migration не должна предполагать, что все исторические версии проекта всегда имели те же semantics.

Preflight:

```text
SELECT/group:
status
summary
createdAt/finishedAt
offeredCount
feedHash
доступные diagnostic fields
```

Для `skipped`:

```text
если row доказуемо соответствует 304 unchanged
например canonical summary "Feed unchanged (HTTP 304)."
→ map to unchanged

если row не имеет доказуемого discriminator
→ НЕ map автоматически
→ report ambiguous row count
→ production migration блокируется на owner decision
```

Не добавлять ретроактивно выдуманный discriminator.

Forward runtime после EPIC должен записывать canonical statuses однозначно.

Автономный scope этой задачи: реализовать repeat-safe preflight/report и
доказать его на непустых локальных fixtures, включая ambiguous rows. Запуск на
реальных staging/production данных относится к EPIC 44; его отсутствие не
блокирует merge EPIC 38 и дальнейшую автономную работу.

## TASK 38.8 — Migration mapping

Доказуемые mappings:

```text
completed → success
304-skipped → unchanged
```

Все остальные mappings только после preflight.

Migration должна быть repeat-safe согласно Payload migration contract.

## TASK 38.9 — Structural anomaly semantics

Разделить:

```text
transport/network failure
→ failed

полученный, но structurally unsafe/suspicious feed
→ suspicious
```

Проверить:

```text
truncated XML
DOCTYPE/ENTITY
max depth
max offers
identity anomaly
unsafe deactivation count
```

## TASK 38.10 — Heartbeat independent-read proof

Unit proof `disableTransaction:true` недостаточен.

Добавить integration proof:

```text
реальный PostgreSQL
→ long controlled ingest transaction
→ heartbeat update outside transaction
→ independent DB connection
→ heartbeatAt виден и изменяется до commit ingest transaction
```

Не заменять independent DB read mock assertion.

## TASK 38.11 — Preserve passed ingest guarantees

После refactor должны остаться GREEN:

```text
manual ownership
source isolation
idempotent offer update
truncated feed safety
run-bound approval
interrupted ≠ deactivation
janitor recovery
concurrency key
```

## TASK 38.12 — New tests

Добавить:

```text
test:feed-same-hash-unchanged
test:suspicious-baseline-regression
test:heartbeat-visibility
test:import-run-canonical-status
test:streaming-feed-memory-boundary
test:import-status-migration-preflight
```

Все новые `test:*`:

```text
→ verify:quick
или
→ documented verify-quick exclusion
```

`verify:quick-coverage` должен оставаться GREEN.

## Targeted tests

```bash
pnpm test:fetch-feed
pnpm test:parse-feed
pnpm test:ingest-parser-contract
pnpm test:ingest-import-state
pnpm test:upsert-feed
pnpm test:run-safe-deactivation
pnpm test:ingest-safe-deactivation
pnpm test:finalize-import
pnpm test:import-feed-heartbeat
pnpm test:ingest-proof-acd
pnpm test:ingest-integration-block
pnpm test:ingest-import-maintenance
pnpm test:ingest-dispatcher
pnpm test:schedule-next-due
pnpm verify:quick-coverage
pnpm typecheck
pnpm lint
```

## Migration order contract

Это первая schema/status migration в Plan №3.

Production migration order:

```text
EPIC 38 import-runs migration
→ отдельно committed/verified
→ EPIC 39 lead-deliveries migration
```

EPIC 39 rollback не должен откатывать EPIC 38.

## Merge

```text
merge-risky
pnpm verify
pnpm verify:schema
```

## DoD

```text
[ ] streaming end-to-end
[ ] 200 same hash = unchanged
[ ] 304 updates successful freshness
[ ] lastFullRunAt semantics зафиксированы
[ ] suspicious cannot lower safety baseline
[ ] canonical persisted statuses
[ ] historical skipped migration безопасна
[ ] heartbeat visibility доказана independent DB read
[ ] existing ingest safety tests GREEN
```

---

# EPIC 39 — LEAD DELIVERY CORE 5.5 ALIGNMENT

**Risk:** RISKY  
**Branch:** `codex/plan3-epic-39-lead-delivery-contract`  
**Dependencies:** EPIC 38 merged — только для неизменяемого migration order

## Цель

Привести persisted lead-delivery state machine к Core 5.5.

## TASK 39.1 — Canonical status

Persisted:

```text
sent
→ delivered
```

Canonical set:

```text
pending
sending
delivered
failed
abandoned
```

## TASK 39.2 — `deliveredAt`

Добавить field:

```text
deliveredAt: date | null
```

Для новых успешных deliveries:

```text
sending
→ delivered
→ deliveredAt = now
→ externalRef persist
→ lastErrorRedacted = null
```

Новый successful transition обязан записывать `deliveredAt`.

## TASK 39.3 — Historical migration

Migration:

```text
sent → delivered
```

Не выдумывать historical `deliveredAt`.

Фактический retention проекта сейчас считается от `lead.createdAt`, а не `deliveredAt`; поэтому historical `NULL deliveredAt` не должен менять retention window.

Contract:

```text
historical migrated delivered row
→ deliveredAt may remain NULL if exact delivery timestamp unavailable

new delivered row
→ deliveredAt MUST be non-null
```

Не использовать `updatedAt` как historical delivery time без доказательства, что оно соответствует фактической доставке.

Admin/UI должны корректно обрабатывать historical:

```text
deliveredAt = null
→ "время исторической доставки неизвестно" / empty safe display
```

Не показывать ложную дату.

## TASK 39.4 — Retention regression

Добавить explicit regression:

```text
lead retention uses lead retention policy / lead.createdAt
and does not become dependent on deliveredAt
```

Если в ходе EPIC появится новая зависимость retention от `deliveredAt`, остановить её и сохранить действующий lead-level retention contract.

## TASK 39.5 — State-machine update

Проверить:

```text
src/core/leads/delivery-state.ts
src/core/data-access/system/lead-delivery.ts
src/project/jobs/leads/deliver-lead.ts
src/core/leads/delivery-recovery.ts
src/project/collections/lead-deliveries.ts
attemptLog
admin aggregates
manual retry
payload-types
proof tests
```

Переименовать internal functions, если старое имя `markLeadDeliverySent` больше вводит в заблуждение.

## TASK 39.6 — Retry contract `retries=0`

Обязательная regression:

```text
Payload task retries = 0
+
retryable channel error
→ handler НЕ throw
→ attempts increment
→ status=pending
→ nextAttemptAt set
→ waitUntil job queued
→ handler completes successfully
```

`test:lead-delivery-proof-g` и/или отдельный targeted test должен покрывать этот invariant после rename/refactor.

## TASK 39.7 — Delivery certainty

Не смешивать:

```text
transport result classification
```

и canonical:

```text
deliveryCertainty:
not-delivered
unknown
delivered
```

Timeout/unknown не имеет права автоматически становиться `delivered`.

## TASK 39.8 — Migration fixture

Перед merge проверить migration на documented SQL seed со всеми statuses:

```text
pending
sending
sent
failed
abandoned
```

Assertions:

```text
row count preserved
sent → delivered only
other statuses preserved
indexes preserved
unique constraints preserved
historical deliveredAt policy respected
```

Если доступна staging snapshot до migration, дополнительно прогнать на disposable copy. Snapshot не обязателен для merge, если его создание owner-gated; live execution фиксируется в EPIC 44.

## TASK 39.9 — Migration order

EPIC 39 migration идёт строго после committed EPIC 38 migration.

```text
36 migration не переписывается
37 migration самостоятельна
rollback 37 не откатывает 36
```

## Tests

```bash
pnpm test:leads-collections
pnpm test:lead-delivery-state
pnpm test:lead-delivery-task
pnpm test:lead-delivery-channel
pnpm test:lead-delivery-e2e-fake
pnpm test:lead-delivery-proof-g
pnpm test:lead-delivery-recovery
pnpm test:lead-delivery-admin
pnpm test:lead-retention-cleanup
pnpm test:load-lead-delivery
pnpm verify:schema
pnpm typecheck
pnpm lint
```

## Merge

```text
merge-risky
pnpm verify
pnpm verify:schema
```

## DoD

```text
[ ] persisted "sent" отсутствует в new schema/runtime
[ ] canonical "delivered" используется системно
[ ] new delivered rows always have deliveredAt
[ ] historical null timestamp не фальсифицируется
[ ] retention contract не сломан
[ ] retryable + retries=0 does not throw
[ ] migration fixture preserves rows/constraints
```

---

# EPIC 40 — UI CORE 5.0 FOUNDATION / GUARDS

**Risk:** RISKY — UI foundation contract  
**Branch:** `codex/plan3-epic-40-ui-core-5`  
**Dependencies:** none

## Цель

Привести mechanical UI contract к AMS UI Core 5.0 и исключить ложные нарушения canonical shadcn baseline.

## TASK 40.1 — Class-based dark foundation

В canonical `globals.css` должен существовать:

```css
@custom-variant dark (&:is(.dark *));
```

Dark mode проекта остаётся:

```text
DISABLED
```

Запрещено:

```text
устанавливать .dark
писать project-authored dark:
активировать theme по OS preference
```

Internal canonical shadcn `dark:` могут оставаться inert.

## TASK 40.2 — Исправить Guard 10

Текущий guard не должен считать `@custom-variant dark` ошибкой.

Новый contract:

```text
missing required class-based custom variant → FAIL
project-authored dark: → FAIL
runtime .dark installation → FAIL
canonical internal primitive dark: → allowed inert
```

Переписать соответствующие guard tests.

## TASK 40.3 — `verify-ui-drift`

Drift audit должен:

```text
REQUIRE @custom-variant dark
REJECT project-authored dark:
REJECT runtime .dark activation
```

и не report правильный class-based foundation как P1.

## TASK 40.4 — Guard 11: two-tier exception model

Не использовать один общий allowlist, смешивающий structural и upstream design literals.

Разделить:

### Tier A — structural geometry

Разрешать только layout/structural значения:

```text
fr
auto
grid track relationships
grid lines/spans
percentages
intrinsic keywords
structural aspect expressions
```

### Tier B — verified upstream primitive baseline

Canonical shadcn primitive может содержать upstream literal, если одновременно:

```text
literal находится только в canonical primitive implementation
он получен из pinned shadcn preset/version
он проверен против upstream baseline
он записан в explicit upstream exception manifest
```

Рекомендуемый artifact:

```text
scripts/ui-upstream-exceptions.json
```

Каждая запись:

```text
file
literal/pattern
component
shadcnVersion
preset
verificationMethod
reason
```

Verification method:

```text
shadcn diff для pinned CLI, если команда поддерживается
ИЛИ
генерация того же primitive в disposable temp project на exact pinned shadcn version/preset и comparison
```

Не fork-ать canonical primitive только ради удаления upstream literal.

## TASK 40.5 — Inspect current primitive literals

Проверить implementation owners:

```text
src/ui/interactive/checkbox.tsx
src/lib/button-variants.ts
src/ui/interactive/sheet.tsx
```

Особенно:

```text
rounded-[4px]
text-[0.8rem]
rounded-[min(var(--radius-md),...)]
bg-black/10
```

Правило:

```text
если upstream shadcn baseline → explicit Tier B exception
если project-authored drift → заменить token/variant
```

`bg-black/10` у Sheet overlay не менять механически, если comparison подтверждает canonical upstream convention.

`text-[0.8rem]` в Button size не менять механически, если comparison подтверждает pinned base-nova baseline.

## TASK 40.6 — Clarify single primitive owner

Не считать re-export вторым primitive.

Пример:

```text
src/components/ui/checkbox.tsx
→ re-export implementation owner
src/ui/interactive/checkbox.tsx
→ actual client implementation
```

Это одна implementation chain, если второй independent implementation отсутствует.

Зафиксировать:

```text
consumer canonical path = @/components/ui/*
implementation owner may be client leaf
```

## TASK 40.7 — Base UI import guard

`@base-ui/react/*` разрешать только внутри canonical primitive implementation paths.

Минимум:

```text
ALLOW:
src/components/ui/**
approved primitive implementation files under src/ui/interactive/**

DENY:
src/app/**
src/components/marketing/**
src/components/layout/**
src/components/pages/**
lead-form composition unless it is primitive owner
other project/business UI
```

Не считать Base UI автоматически второй UI-library, если он является engine canonical shadcn preset.

## TASK 40.8 — Primitive drift coverage

`verify-ui-drift` не должен исключать целиком:

```text
src/components/ui/**
src/ui/interactive/**
src/lib/button-variants.ts
```

Он должен:

```text
проверять project drift
учитывать Tier B upstream exception manifest
не блокировать verified upstream baseline
```

## TASK 40.9 — Tests

Добавить:

```text
test:dark-mode-foundation
test:primitive-import-boundary
test:design-literal-guard
test:upstream-primitive-exceptions
```

Запустить:

```bash
pnpm test:site-globals
pnpm test:button-control-system
pnpm test:lead-form-primitives
pnpm test:motion-contract
pnpm test:presentation-dto-guard
pnpm test:ui-drift-p2-policy
pnpm test:responsive-a11y-regression
pnpm verify:guards
pnpm verify:guards:test
pnpm verify:foundation
pnpm verify:ui-drift
pnpm typecheck
pnpm lint
pnpm build
```

## Merge

```text
merge-risky
```

## DoD

```text
[ ] class-based dark foundation соответствует UI Core 5.0
[ ] Guard 10 проверяет актуальный contract
[ ] Guard 11 разделяет structural и upstream baseline
[ ] upstream shadcn literals не требуют fork
[ ] project-authored literals не маскируются upstream exception
[ ] Base UI imports mechanically bounded
[ ] primitive layer покрывается drift audit
```

---

# EPIC 41 — UI RHYTHM / DESIGN-SYSTEM DRIFT

**Risk:** RISKY — UI foundation contract  
**Branch:** `codex/plan3-epic-41-ui-rhythm`  
**Dependencies:** EPIC 40 merged

## Цель

Убрать повторяемый обход canonical section rhythm и провести финальную UI normalization без бессмысленного file-splitting.

## TASK 41.1 — Inventory SectionShell overrides

Найти:

```text
SectionShell + pt-*
SectionShell + pb-*
SectionShell + py-*
```

Особенно recurring:

```tsx
<SectionShell className="pt-0">
```

## TASK 41.2 — Устранить hidden rhythm API

Для каждого occurrence классифицировать:

### A — одна semantic section

Объединить composition внутри одного `SectionShell`.

### B — отдельная semantic section

Использовать canonical named rhythm.

При необходимости расширить owner API:

```ts
rhythm?: "sm" | "md" | "lg" | "hero"
```

Default должен сохранить текущее canonical поведение (`md` или фактический default).

Изменение должно быть additive/backward-compatible.

Не создавать:

```text
zero
tiny2
custom
```

ради копирования `pt-0`.

## TASK 41.3 — Drift guard

Повторяющийся direct vertical padding override на canonical Section owner:

```text
→ P1/report or blocking guard
```

кроме documented approved exception.

## TASK 41.4 — Не делать file split ради правила, которого нет

Не переносить каждую section в отдельный физический файл только потому, что один module содержит несколько exported `*Section` components.

Требование:

```text
semantic section = component
```

а не:

```text
semantic section = file
```

Разделять файл только если это улучшает ownership/maintainability и не является механическим churn.

## TASK 41.5 — Dead token audit

Для каждого project-specific token:

```text
consumer exists
ИЛИ shadcn-required
ИЛИ explicitly reserved/documented
```

Иначе удалить.

Не считать dead:

```text
canonical shadcn-required tokens
verified upstream primitive tokens
```

## TASK 41.6 — Responsive / accessibility matrix

Representative routes:

```text
/
 /investicionnaya-nedvizhimost/
 /investicionnaya-nedvizhimost/[...path]/
 /novostroyki/
 /novostroyki/[slug]/
 /obekty/
 /podbor/
 /kontakty/
 /analitika/[slug]/
```

Widths:

```text
390
768
1024
1440
1920
```

Проверить:

```text
horizontal overflow
one logical H1
heading hierarchy
section spacing
CTA visibility
focus
keyboard
touch targets
form labels/errors
media aspect
missing image state
```

Для hero/media representative routes дополнительно проверить DPR 1 и DPR 2, если browser harness это поддерживает.

## TASK 41.7 — Reduced motion

Обязательная browser regression:

```text
prefers-reduced-motion: reduce
→ animations/transitions reduced according to project contract
→ content/state remains equivalent
→ nothing becomes hidden/unreachable
```

Сравнить layout/content snapshot с default motion mode, кроме ожидаемых animation-style differences.

## Tests

```bash
pnpm test:responsive-a11y-regression
pnpm test:motion-contract
pnpm test:site-navigation
pnpm test:site-globals
pnpm verify:ui-drift
pnpm verify:foundation
pnpm verify:seo
pnpm typecheck
pnpm lint
pnpm build
```

## Merge

Изменяется canonical `SectionShell` foundation contract.

```text
merge-risky
```

Не использовать STANDARD только потому, что schema/data не меняются.

## DoD

```text
[ ] recurring pt-0 workaround устранён
[ ] SectionShell имеет один canonical rhythm API
[ ] P0/P1 UI drift = 0
[ ] 390/768/1024/1440/1920 regression clean
[ ] reduced-motion proof clean
[ ] no unnecessary section file churn
```

---

# EPIC 42 — FINAL PLATFORM PROOFS / TECHNICAL VALIDATION

**Risk:** RISKY  
**Branch:** `codex/plan3-epic-42-platform-proofs`  
**Dependencies:** EPIC 35–41 merged  
**Production deployment:** запрещён в этом EPIC

## Цель

На final code state повторно доказать именно изменённые critical boundaries.

Не переписывать существующие EPIC 32 proof files без причины.

## TASK 42.1 — Public boundary final proof

Обязательный proof для EPIC 35.

Fixture:

```text
published region
hidden region
stub region
```

Проверить на final head:

```text
listPublicRegions
listPublicHubRegions
generateStaticParams source/contract
getPublicRegionRelatedLinks
sitemap source
generic public route resolution
```

Expected:

```text
published → public
hidden    → absent everywhere
stub      → absent from generic public paths
```

Evidence сохранить в:

```text
docs/proofs/
```

с:

```text
exact SHA
exact command
criteria
verdict
```

## TASK 42.2 — Safe Outbound mid-stream harness

Proof должен проверять реальное mid-stream поведение, а не повторять post-body unit assertion.

Использовать test harness, который генерирует:

```text
A. chunked response > maxResponseBytes
B. slow-drip response > timeout
```

Допустим:

```text
local test HTTP(S) server behind test transport seam
или internal stream harness, проходящий через production bounded reader
```

Обязательные assertions:

```text
client rejects before producer sends full body
producer/socket receives abort/close
received byte count bounded
timeout fires before body completes
```

Memory measurement можно писать как diagnostic (`rss/external`), но не делать flaky `heapUsed` threshold единственным доказательством.

## TASK 42.3 — Same-hash proof

```text
run 1: HTTP 200 unique feed
→ success

run 2: HTTP 200 byte-identical feed
→ unchanged
→ zero inventory business writes
→ no deactivation
→ lastSuccessfulRunAt advances
→ lastFullRunAt advances
→ lastOfferCount unchanged
```

## TASK 42.4 — Suspicious baseline proof

```text
known baseline 1000
→ suspicious feed 100
→ baseline remains 1000
→ repeat 100
→ suspicious again
→ no mass deactivation
```

## TASK 42.5 — Heartbeat visibility proof

На PostgreSQL:

```text
long open ingest transaction
→ heartbeat outside transaction
→ independent connection
→ sees heartbeatAt advancing before commit
```

Не принимать source-code inspection как замену.

## TASK 42.6 — Lead migration proof

Fixture должен быть воспроизводимым.

Минимальный SQL seed:

```text
pending
sending
sent
failed
abandoned
```

Assertions:

```text
row count before == row count after
sent only → delivered
other statuses preserved
constraints/indexes preserved
new delivered transition writes deliveredAt
historical deliveredAt may be NULL per policy
```

Если owner предоставил staging snapshot, дополнительно выполнить migration на disposable copy.

## TASK 42.7 — Retryable delivery proof

На final head:

```text
retries=0
retryable outbound error
→ no throw
→ pending
→ nextAttemptAt
→ waitUntil queued
→ next attempt executable
```

## TASK 42.8 — Existing proofs

После изменённых subsystem повторно запустить применимые существующие proofs:

```text
cache B2
ingest A/C/D
crash window F
retention E
jobs owner/no-catch-up
S3 if unaffected by code only as smoke
```

Не создавать duplicate proof document, если existing proof format можно корректно обновить новым exact SHA.

## TASK 42.9 — Jobs ownership

Не вводить Postgres advisory lock.

Существующий contract:

```text
one jobs-active owner
controlled handover
JOBS_AUTORUN
runbook + mechanical handover checks
```

повторно проверить:

```bash
pnpm test:jobs-handover
pnpm test:jobs-config
pnpm test:runtime-topology
```

Новая lock infrastructure требует отдельного proven trigger.

## TASK 42.10 — Full verification

На exact PR HEAD:

```bash
pnpm install --frozen-lockfile
pnpm audit --audit-level high
pnpm verify
pnpm verify:schema
pnpm verify:daily
```

Если `verify:daily` является точным alias `verify`, выполнить один canonical
`pnpm verify:daily` и зафиксировать, что он одновременно покрывает `verify`.
Не запускать второй идентичный suite только ради другого имени команды.

## Merge

```text
merge-risky
```

## DoD

```text
[ ] public boundary final proof PASS
[ ] bounded transport mid-stream proof PASS
[ ] same-hash proof PASS
[ ] suspicious baseline proof PASS
[ ] heartbeat independent DB proof PASS
[ ] lead migration fixture PASS
[ ] retryable retries=0 proof PASS
[ ] full verify PASS
[ ] verify:schema PASS
[ ] verify:daily PASS
```

---

# EPIC 43 — SOURCE OF TRUTH / FINAL CONFORMANCE CLOSEOUT

**Risk:** STANDARD  
**Branch:** `codex/plan3-epic-43-conformance-closeout`  
**Dependencies:** EPIC 42 merged

## Цель

Синхронизировать project documentation и machine-readable SoT с фактическим final `main`.

Никакого production cutover.

## TASK 43.1 — PROJECT.md

Зафиксировать только факты:

```text
AMS_PROFILE=REALTY_BASE
Core = AMS Realty Platform Core 5.5
UI = AMS UI Core 5.0
actual cache mode
actual jobs mode
actual enabled modules
actual proof status
actual owner gates
```

Удалить stale notes о старой версии стандарта, если они ещё существуют.

## TASK 43.2 — DESIGN.md / Approved Exceptions

Зафиксировать:

```text
canonical primitive consumer path
actual primitive implementation ownership
dark disabled + class-based custom variant
SectionShell rhythm owner
token owner
upstream shadcn exception policy
```

Каждое final deviation должно быть:

```text
устранено
ИЛИ
записано как Approved Exception
```

Approved Exception содержит:

```text
date
location
exception
reason
owner decision
```

Не записывать как exception normal canonical behavior.

Проверить, что upstream primitive exceptions из EPIC 40 отражены либо:

```text
в dedicated machine-readable exception manifest + ссылка из DESIGN
```

либо непосредственно в approved-exceptions table.

## TASK 43.3 — DELIVERY_STATE semantics

Убрать неоднозначное использование stale/self-referential `canonical_main`, если оно не означает фактический current SHA.

Использовать однозначно:

```yaml
code_baseline_sha:
last_verified_main_sha:
verification_date:
current_status:
next_step:
production:
```

## TASK 43.4 — OWNER_QUEUE

Не закрывать без evidence:

```text
staging/restore DB
property enum live drift
credential rotation
domain cutover
production authorization
```

Если какой-либо пункт выполнен в ходе реальной owner operation — обновить только с proof.

## TASK 43.5 — Root machine artifacts

Проверить:

```text
master-plan.inventory.json
root master-plan markdown
```

Rule:

```text
active machine artifact
→ должен иметь explicit consumer
→ consumer указан в docs/README.md
→ указано, кто/какой script/agent его читает

нет explicit consumer
→ archive/remove после проверки SoT
```

Не оставлять файл только с формулировкой «возможно нужен агентам».
Не архивировать и не переписывать active inventory Plan №3 или используемый
Beads store. Legacy root inventory обрабатывается только после доказанной
идентификации его consumer и без source drift текущего graph.

## TASK 43.6 — `experimental.globalNotFound`

Проверить pinned Next `16.3.4` и официальную version-sensitive документацию.

Для:

```ts
experimental: {
  globalNotFound: true
}
```

сделать одно из:

```text
если pinned Next всё ещё считает feature experimental
→ зафиксировать project trigger + approved exception/ADR

если существует стабильный эквивалент и migration безопасна
→ перейти на stable API
```

Не менять feature по памяти модели.

## TASK 43.7 — Final architecture scan

Подтвердить отсутствие:

```text
overrideAccess:true outside System Gateway
Local API call без explicit access mode
generic application CRUD payload-jobs outside System Gateway
low-level DB outside approved paths
private fields in public DTO/select
Payload import in presentation
Payload import in SEO
configurable outbound bypass
wildcard CORS
secret/process.env bypass
hidden entity in generic public routes
project-authored dark:
unapproved design literals
direct Base UI use outside primitive owner
unapproved Section rhythm bypass
unrecorded Approved Exceptions
undocumented experimental Next config
```

Особенно проверить:

```text
collection: "payload-jobs"
```

Generic application CRUD по `payload-jobs` вне trusted System Gateway должен отсутствовать.

## TASK 43.8 — Docs / proof consistency

Проверить:

```text
PROJECT.md
OPERATIONS.md
DESIGN.md
OWNER_QUEUE.md
DELIVERY_STATE.yaml
04_BACKLOG.md
05_RELEASE_CHECKLIST.md
docs/proofs/**
```

Не оставлять:

```text
старый SHA как "current"
старый status после rename
sent вместо delivered
completed/skipped как canonical import status
устаревший P0/P1 audit finding как active task
```

Исторические proof documents не переписывать так, будто они были запущены на новом SHA. Историю сохранять.

## TASK 43.9 — Final main proof

После merge EPIC 43:

```bash
git checkout main
git pull
git rev-parse HEAD

pnpm install --frozen-lockfile
pnpm verify:daily
```

Записать exact final main SHA и результат.

Не писать `GREEN`, если команда не запускалась.

## Merge

```text
merge-standard
```

Если closeout неожиданно меняет executable architecture/code, переклассифицировать PR в RISKY, а не проталкивать через STANDARD.

## DoD

```text
[ ] docs соответствуют final main
[ ] Approved Exceptions соответствуют факту
[ ] payload-jobs generic CRUD отсутствует
[ ] experimental config имеет explicit policy
[ ] root machine artifacts имеют explicit consumer или архивированы
[ ] owner gates не помечены DONE без evidence
[ ] final main verify:daily фактически PASS
```

---

# FINAL EXECUTION ORDER

```text
WAVE A — независимая ready work, один active stream:
  EPIC 35 — Public Data / Publication Boundary
  EPIC 36 — System Gateway / Privileged Operations
  EPIC 37 — Safe Outbound Transport Boundaries
  EPIC 40 — UI Core 5.0 Foundation / Guards

WAVE B:
  EPIC 38 — Import Safety / Streaming / Baseline / Lifecycle
             HARD: EPIC 37 merged
  EPIC 41 — UI Rhythm / Design-System Drift
             CONTRACT: EPIC 40 merged

WAVE C:
  EPIC 39 — Lead Delivery Core 5.5 Alignment
             HARD: EPIC 38 migration merged; migration order неизменяем

WAVE D:
  EPIC 42 — Final Platform Proofs / Technical Validation
             HARD: EPIC 35–41 merged

WAVE E:
  EPIC 43 — Source of Truth / Final Conformance Closeout
             HARD: EPIC 42 merged

WAVE F — естественная owner/production stop:
  EPIC 44 — Owner / Production Gates
             OWNER/PRODUCTION: отдельная команда владельца
```

---

# EPIC 44 — OWNER / PRODUCTION GATES (DEFERRED)

**Risk:** OWNER / PRODUCTION  
**Branch:** не создаётся без отдельной release-команды владельца  
**Dependencies:** EPIC 43 merged  
**Delivery mode:** `PR_ONLY` placeholder в Task Manager; не является production authorization

Этот EPIC намеренно остаётся последним owner gate. Он не выдаётся роли
`implementation`, не входит в autonomous completion EPIC 35–43 и не является
разрешением на production.

Эти действия не выполнять как автономные code EPIC и не использовать как причину остановить EPIC 35–43:

```text
создание/настройка production/staging DB владельцем
live property-enum drift на production data
rotation leaked PostgreSQL credentials
production domain/DNS cutover
production TLS switch
production release authorization
подключение реального внешнего lead channel
подключение реального live feed, если владелец его ещё не разрешил
live preflight исторических migration values на production/staging data
```

Если EPIC обнаружил такой gate:

```text
автономную часть завершить
добавить точную запись в OWNER_QUEUE
не симулировать PASS
не ослаблять test
продолжить следующий автономный EPIC, если dependency позволяет
```

Entry condition: EPIC 43 merged и отдельная явная production/release-команда
владельца. Exit condition определяется отдельным release contract и не входит
в Definition of Done Plan №3. До entry condition статус EPIC 44 — `blocked` с
labels `needs-owner` и `production`.

---

# НЕ ДЕЛАТЬ В PLAN №3

```text
не переносить весь src/components/** в src/ui/**
не считать re-export вторым primitive implementation
не мигрировать Base UI → Radix без proven trigger
не удалять shadcn/tailwind.css только ради "одного token source"
не вводить Postgres advisory lock без proven trigger
не дробить каждый semantic section в отдельный physical file
не вводить SafeImage wrapper только ради abstraction
не удалять packages/contracts
не переписывать unaffected EPIC 32 proofs
не менять Next/Payload/Tailwind/React major versions
не включать production release
```

---

# FINAL ARCHITECT AUDIT — v1

## MASTER PLAN MAP

- **Primary goal:** закрыть подтверждённые audit findings по public/system
  boundaries, outbound/ingest, lead delivery и UI Core, затем доказать общий
  final state и синхронизировать Source of Truth.
- **Non-goals:** production release/cutover, live secrets, новый stack,
  неподтверждённый redesign, real feed/channel activation.
- **Autonomous outcomes:** EPIC 35–43.
- **Owner/production outcome:** EPIC 44, deferred и не авторизован.
- **Shared foundations:** Public/System Gateway, Safe Outbound, architecture
  guards, migration order, UI guard/token policy.
- **Data/schema:** import-run lifecycle migration EPIC 38, затем независимая
  lead-delivery migration EPIC 39; applied migration не переписывается.
- **Security-sensitive:** publication predicate, privileged Local API,
  SSRF/DNS/redirect boundaries, lead certainty/PII, migration preservation.
- **External prerequisites:** SourceCraft gate, package registry/docs access и
  local PostgreSQL proof. Live-data prerequisites вынесены в EPIC 44.

## FINDING REGISTER

| ID | Severity | Finding | Resolution | Status |
|---|---|---|---|---|
| F-01 | BLOCKER | EPIC 33/34 уже заняты предыдущей программой | Plan №3 перенумерован в EPIC 35–44 | RESOLVED |
| F-02 | BLOCKER | Полная последовательная цепочка останавливала весь run при локальном blocker | Введены Waves A–F и минимальные HARD/CONTRACT dependencies | RESOLVED |
| F-03 | BLOCKER | Текущий Beads содержит задачи старых планов и мог выдать их новому worker | Зафиксированы отдельные Plan ID, prefix `mg3` и plan-label isolation | RESOLVED |
| F-04 | MAJOR | Live/production prerequisites смешивались с автономным DoD | Все live/owner/production действия вынесены в EPIC 44 | RESOLVED |
| F-05 | MAJOR | Live historical migration preflight мог заблокировать EPIC 38 | Merge требует repeat-safe report + local fixtures; live execution перенесён в EPIC 44 | RESOLVED |
| F-06 | MAJOR | `verify` и точный alias `verify:daily` требовалось запускать повторно | Один canonical invocation допускается как общее evidence при доказанном alias | RESOLVED |
| F-07 | MAJOR | У плана не было lifecycle, delivery и rollback/stop contracts | Добавлены Plan ID/version/status, epic contract и revision history | RESOLVED |

## FOUR-PASS RESULT

| Pass | Результат |
|---|---|
| Logic / Completeness | PASS: все 10 EPIC и 73 implementation tasks связаны с goal; content из owner-аудита сохранён |
| Architecture / Data / Security | PASS: Realty/Payload single-owner boundaries сохранены; migrations ordered; production отделён |
| Dependencies / Autonomy | PASS: cycles `0`; Wave A имеет 4 независимых входа; shared-file conflicts сериализуются одним worker, не HARD dependency |
| Executability / Evidence / Delivery | PASS: outcome/DoD/tests/merge contracts заданы; final proof и exact-main closeout отделены |

## NIGHT RUN READINESS

```text
Independent ready wave: EPIC 35, 36, 37, 40
Critical paths: 37 → 38 → 39; 40 → 41; all autonomous → 42 → 43
Dependency cycles: 0
Before-approval owner decisions: 0
Unknown critical prerequisites: 0
Production-only stop: EPIC 44
Safe work if one epic blocks: другая ready work Wave A/B/C
Whole-run stop: EPIC 35–43 complete OR no safe ready work remains

Result: READY
```

## AUDIT SCORECARD

```text
Blockers open: 0
Major findings open: 0
Needs owner before approval: 0
Hard dependencies: 37→38, 38→39 (migration order), 35–41→42, 42→43
Contract dependency: 40→41
Independent initial waves: 4 epics
Ambiguous critical DoD: 0
Night Run Readiness: READY
Task Manager import: ALLOWED for exact APPROVED v1 by owner phrase "План утвержден"
```

---

# FINAL PLAN №3 DEFINITION OF DONE

```text
[ ] EPIC 35 merged
[ ] EPIC 36 merged
[ ] EPIC 37 merged
[ ] EPIC 38 merged
[ ] EPIC 39 merged
[ ] EPIC 40 merged
[ ] EPIC 41 merged
[ ] EPIC 42 merged
[ ] EPIC 43 merged
[ ] EPIC 44 остаётся OWNER/PRODUCTION gate до отдельной команды

[ ] hidden entities закрыты public boundary
[ ] sitemap использует Public Gateway
[ ] overrideAccess:true только System Gateway
[ ] operational scripts покрыты privileged-access guard
[ ] Safe Outbound реально bounded mid-stream
[ ] feed processing streaming end-to-end
[ ] HTTP 200 same hash = unchanged
[ ] HTTP 304 = unchanged + successful freshness
[ ] same-hash lastFullRunAt policy доказана
[ ] suspicious run не меняет safety baseline
[ ] import-run canonical lifecycle внедрён
[ ] historical skipped migration имеет preflight/discriminator
[ ] heartbeat visibility доказана independent DB read
[ ] lead delivery использует delivered + deliveredAt
[ ] historical deliveredAt не фальсифицируется
[ ] retries=0 retryable path не throw
[ ] migrations идут 36 → 37 и rollback независим
[ ] UI dark foundation соответствует AMS UI Core 5.0
[ ] Guard 10 соответствует актуальному contract
[ ] Guard 11 имеет structural + verified-upstream tiers
[ ] upstream shadcn literals не вызывают fork primitive
[ ] direct Base UI mechanically bounded
[ ] Section rhythm имеет canonical owner
[ ] P0/P1 UI drift = 0
[ ] 390/768/1024/1440/1920 responsive proof PASS
[ ] reduced-motion proof PASS
[ ] final public-boundary proof PASS
[ ] final outbound mid-stream proof PASS
[ ] final same-hash/suspicious-baseline proofs PASS
[ ] generic payload-jobs CRUD вне System Gateway отсутствует
[ ] Approved Exceptions соответствуют фактическому final state
[ ] experimental Next config имеет explicit decision
[ ] root machine artifacts имеют explicit consumer или архивированы
[ ] pnpm verify PASS на final critical PR
[ ] pnpm verify:schema PASS
[ ] pnpm verify:daily PASS на final main SHA
[ ] production остаётся OWNER_GATE до отдельной команды
```

**Конец документа — План №3.**
