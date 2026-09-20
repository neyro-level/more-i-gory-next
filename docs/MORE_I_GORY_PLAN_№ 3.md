# ПЛАН №3 — ИСПРАВЛЕНИЯ И ФИНАЛЬНОЕ ПРИВЕДЕНИЕ «МОРЕ И ГОРЫ»

Plan ID: more-i-gory-production-readiness-2026-09
Previous Task Manager Plan ID: more-i-gory-conformance-plan3-2026-09 (v1, historical)
Future Task Manager prefix: mg4
Version: v2
Status: APPROVED
Readiness: READY_WITH_LIMITS
Approved by: owner
Approved at: 2026-09-20T12:17:11+03:00
Previous approved snapshot: v1, approved 2026-09-19T12:01:40+03:00

**Canonical repository:** SourceCraft `integrator-p/more-i-gory-next`
**GitHub mirror:** `neyro-level/more-i-gory-next` — не primary
**Historical v1 audit SHA:** `2a3b2f5416094dfb3ad1be28732c7925bb121cea` — evidence only
**V2 implementation base:** SourceCraft `main` @ `78c2753efc48fb2abafd0527b8949e85af199762`
**V2 plan snapshot:** exact approved Markdown SHA-256 фиксируется в mg4 inventory после approval
**Target Core:** AMS REALTY PLATFORM CORE STANDARD 5.5 — SOLO + AI
**Target UI:** AMS UI CORE v5.0
**Profile:** `AMS_PROFILE=REALTY_BASE`
**Delivery profile:** `COMMERCIAL`
**Project mode:** `BUILD`
**UX scope:** `PUBLIC_COMMERCIAL`
**Назначение:** v1 сохраняет завершённый conformance baseline EPIC 35–43; v2
собирает весь остаток до production-ready состояния и изолирует сам release.
**Default delivery mode:** `MERGE_AFTER_GATE` для EPIC 44–54 после approval exact v2.
**Production release:** только EPIC 55–56 и только после отдельной устойчивой
команды владельца `Выпускаем production`.

## Lifecycle и revision history

| Версия | Статус | Вход | Результат |
|---|---|---|---|
| v0 | DRAFT | Исходный owner-аудит на SHA `2a3b2f5` | Принят как содержательная основа; импорт запрещён |
| v1 | APPROVED | Architect normalization + four-pass final audit + owner approval 2026-09-19 | Устранены collisions EPIC 33/34, построены автономные waves, owner/production gates вынесены в EPIC 44, добавлены contracts и Task Manager isolation; blocker/major findings закрыты; владелец утвердил exact v1 |
| v2 | APPROVED | Owner confirmation 2026-09-20 после final four-pass audit exact commit `9c4b287` | EPIC 44 placeholder разложен на EPIC 44–56; blockers/majors/cycles = 0; Night Run `READY_WITH_LIMITS`; mg4 import и Developer handoff разрешены |

Snapshot v1 был утверждён и выполнен по EPIC 35–43. Текущий v2 утверждён после
финального четырёхпроходного аудита и owner confirmation; mg4 inventory,
Task Manager import/reconcile и Developer handoff разрешены.

# V1 HISTORICAL SNAPSHOT — NON-IMPORTABLE IN V2

Всё от этого заголовка до `# V2 — ОСТАВШАЯСЯ ПРОГРАММА ДО PRODUCTION` ниже
является историческим approved/executed контрактом v1. Он сохраняется как
evidence, но не управляет v2, не импортируется повторно и не является current
ready queue. Current execution contract, decisions и DoD заданы только в v2.

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

## V1 historical Task Manager isolation

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

# V1 HISTORICAL EPIC 35 — PUBLIC DATA / PUBLICATION BOUNDARY

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

# V1 HISTORICAL EPIC 36 — SYSTEM GATEWAY / PRIVILEGED OPERATIONS

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

# V1 HISTORICAL EPIC 37 — SAFE OUTBOUND TRANSPORT BOUNDARIES

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

# V1 HISTORICAL EPIC 38 — IMPORT SAFETY / STREAMING / BASELINE / LIFECYCLE

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

# V1 HISTORICAL EPIC 39 — LEAD DELIVERY CORE 5.5 ALIGNMENT

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

# V1 HISTORICAL EPIC 40 — UI CORE 5.0 FOUNDATION / GUARDS

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

# V1 HISTORICAL EPIC 41 — UI RHYTHM / DESIGN-SYSTEM DRIFT

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

# V1 HISTORICAL EPIC 42 — FINAL PLATFORM PROOFS / TECHNICAL VALIDATION

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

# V1 HISTORICAL EPIC 43 — SOURCE OF TRUTH / FINAL CONFORMANCE CLOSEOUT

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

# V1 HISTORICAL OWNER / PRODUCTION GATE — EPIC 44 PLACEHOLDER

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

# V2 — ОСТАВШАЯСЯ ПРОГРАММА ДО PRODUCTION

Этот раздел является единственным новым planning scope. Выполненные EPIC 35–43
и их evidence не переоткрываются. Старый EPIC 44 выше сохраняется как
историческая v1-заглушка и после approval v2 заменяется графом ниже.

## V2 фактический baseline

```text
main / origin/main  : 78c2753efc48fb2abafd0527b8949e85af199762
preview host        : more-previu.tw1.ru
server              : moregory1; SSH moreigory; deploy + sudo PASS
runtime             : nginx active; moreigory.service active; Node 24.20.0
public preview      : /api/health 200; /, robots.txt, sitemap.xml = 503
managed PostgreSQL  : 18.6; default_db; gen_user; CREATEDB=false
database schema     : payload_migrations/properties/users absent
Secret Master       : more-i-gory-server/prod readable
PR 74 head          : d9eb2e4df85d79d6085318656a86122299c46076
Task Manager        : v1 reconciliation CLEAN; no scoped ready implementation
```

## V2 решения по умолчанию — без повторных запросов

| ID | Решение | Статус |
|---|---|---|
| V2-OD-01 | SourceCraft остаётся primary; все code/docs EPIC 44–54 используют `MERGE_AFTER_GATE` | PROPOSED |
| V2-OD-02 | Project-scoped Secret Master, SSH, Timeweb API и DB operations в утверждённых non-production контурах выполняются автономно по task contract | PROPOSED |
| V2-OD-03 | Production-target cluster `4210557` не повышается ради staging. Создаётся отдельный минимальный PostgreSQL 18 staging cluster с API quote ≤600 RUB/month including tax; если read-only quote выше cap или billing semantics не подтверждены — external stop | PROPOSED |
| V2-OD-04 | Внешний lead channel, live feed и карты остаются выключены; Payload Admin — операционная поверхность заявок до отдельного business decision | PROPOSED |
| V2-OD-05 | Любая страница без доказанных фактов остаётся unpublished/noindex и не блокирует независимую infrastructure work | PROPOSED |
| V2-OD-06 | Legacy Task Manager records не удаляются: carry-forward → `supersede`, дубли → `ALREADY_COVERED` с evidence | PROPOSED |
| V2-OD-07 | Один final release intent разрешает непрерывный EPIC 55→56; automatic rollback ограничен artifact/symlink и DNS/Nginx при schema compatibility. DB migration anomaly всегда stop + recovery/forward-fix, auto-down запрещён | PROPOSED |
| V2-OD-08 | Первый release стартует с `JOBS_AUTORUN=false`; feed, ingest schedule и outbound delivery channel выключены. Jobs owner включается отдельной post-release task после готовности queue/channel contracts | PROPOSED |
| V2-OD-09 | Разрешена zero-downtime rotation exact More i Gory production-target DB identity и `/etc/moreigory/app.env`: replacement → grants → Secret Master/env → smoke → revoke; schema/data mutation в эту авторизацию не входит | PROPOSED |
| V2-OD-10 | Leads anti-bot default — Cloudflare Turnstile для `moreigori.ru` и preview hostname; существующий Cloudflare/API access ищется автоматически, иначе один consolidated owner action до RC; до ключей форма disabled | PROPOSED |

До approval эти решения являются рекомендацией Architect, а не разрешением на
исполнение. После approval они входят в durable authorization exact v2.

## V2 execution contract

- EPIC 44–54 выполняются автономно после approval exact v2 через scoped Plan ID
  `more-i-gory-production-readiness-2026-09`; blocked task освобождает claim, а
  Developer продолжает другую ready work.
- Каждый code/docs epic завершается `TASK <id>.D — Delivery`, полным diff review,
  одним risk-based exact-head gate и merge; повторные gates запрещены.
- EPIC 46–49 используют две стадии: `TASK xx.P` делает review/gate/merge
  runbook/code; только затем `TASK xx.O` выполняет mutation из exact merged SHA
  и пишет evidence в Beads ledger. `TASK xx.D` закрывает epic; отдельный
  docs-only evidence PR создаётся лишь если repository evidence действительно
  изменилось. Mutation из feature branch запрещена.
- EPIC 55–56 не импортируются в implementation graph. После команды
  `Выпускаем production` создаётся отдельный release graph/goal на exact EPIC 54
  main SHA; дополнительных owner-вопросов внутри 55→56 нет, если stop condition
  не сработал.
- Safe retries для внешнего API: максимум 3 попытки с паузами 2/5/10 секунд;
  после 401/403, неоднозначного target или превышения spend cap повтор запрещён.

## V2 delivery matrix

| Epics | Git delivery | Operational mutation | Gate |
|---|---|---|---|
| 44–45, 50–54 | PR + merge | none либо test/staging evidence | exact-head STANDARD/RISKY |
| 46–49 | PR + merge | Timeweb/Secret Master/staging/server по merged runbook | exact-head RISKY |
| 55–56 | отдельный release graph | production rollout/cutover | exact-main release evidence |

## V2 dependency model

| Wave | Epics | Dependency | Safe fallback |
|---|---|---|---|
| A | 44, 46, 50, 51 | после approval; независимы | при blocker перейти к другому epic Wave A |
| B | 45 после 44; 47 после 46; 52 после 51 | минимальные HARD связи | content blocker не останавливает infra |
| C | 48 после 44+47; 49 после 48; 53 после 49+52 | DB/runtime/content contracts | DB blocker не останавливает content и наоборот |
| D | 54 после 45+48+49+50+53 | release-candidate aggregation | не начинать с неполным evidence |
| E | 55 после 54 + release command | PRODUCTION | stop без release intent |
| F | 56 после 55 | PRODUCTION | rollback на previous known-good |

Cycles: `0`. Shared schema/migrations идут последовательно. Research, content
inventory и infrastructure discovery могут идти параллельно в отдельных
read-only потоках; writing worker остаётся один.

# EPIC 44 — MIGRATION BASELINE REPAIR / PR 74

**Outcome:** historical Payload migration chain имеет один доказанно безопасный
путь для clean install и upgrade без переписывания уже применённых migrations.

**Entry:** v2 APPROVED; PR !74 exact head известен; production DDL запрещён.
**Dependencies:** none. **Wave:** A. **Risk:** RISKY.
**Delivery:** `MERGE_AFTER_GATE`.

## TASK 44.1 — Target migration history inventory

- read-only получить `payload_migrations` для каждого известного managed,
  preview и staging контура;
- если таблица отсутствует, записать `unmigrated`, не симулировать history;
- не выводить credentials или row data.

## TASK 44.2 — Historical-file decision

- если изменённые PR !74 historical files нигде не применялись — разрешить
  repair с exact evidence;
- если хотя бы один старый checksum применён — historical files не менять,
  заменить решение forward-only migration.

## TASK 44.3 — Verification and delivery

- clean PostgreSQL 18 install;
- upgrade fixture всех 26 migrations;
- regression исторического pages/status collision;
- `verify:schema`, typecheck, lint и affected migration tests;
- full diff review + один exact-head SourceCraft `RISKY` gate + merge.

## TASK 44.D — Delivery

Проверить exact PR head, выполнить единственный RISKY gate, merge и записать
merge SHA; новый push инвалидирует gate.

**Acceptance:** clean/upgrade PASS; target-history decision доказан; PR head не
изменился после gate; `mg3-discovered-38-migration-chain` имеет replacement/evidence.
**Recovery:** до merge — revert/fix только в feature branch; после merge —
отдельный revert/fix PR. Уже применённая migration никогда не auto-down и не
переписывается; recovery только forward-only либо exact restore plan.
**Stop:** только неоднозначная/непроверяемая history. Известная применённая старая
migration автоматически выбирает forward-only repair и не является owner-вопросом.

# EPIC 45 — CANONICAL STATE / TASK MANAGER HYGIENE

**Outcome:** документы, Git и Task Manager рассказывают одну историю exact main;
legacy-граф не попадает в ready-loop.

**Entry:** EPIC 44 merged. **Wave:** B. **Risk:** STANDARD.
**Delivery:** `MERGE_AFTER_GATE`.

## TASK 45.1 — Docs truth

Обновить `README`, Backlog, `DELIVERY_STATE`, `OWNER_QUEUE`, `PROJECT`,
Architecture и Release Checklist: убрать stale `842b0cce`/EPIC 43, противоречия
`N/A` для реализованных Payload/auth/jobs/PostgreSQL и записать exact main.

## TASK 45.2 — Task Manager carry-forward

- составить mapping всех 32 legacy open records и v1 EPIC 44/discovered task;
- import v2 использует новый Plan ID/prefix `more-i-gory-production-readiness-2026-09` / `mg4`; v1 graph и metadata не переписываются;
- carry-forward records закрывать только `bd supersede <old> --with=<mg4-id>`;
  дубли закрывать `bd close --reason="ALREADY_COVERED: <evidence>; replacement: <id>"`;
- `mg3-discovered-38-migration-chain` → TASK 44.2; historical
  `mg3-epic-44` остаётся blocked до появления отдельного release graph 55–56;
- закрытые 392 записи не изменять и не удалять;
- generic ready и scoped helper не должны выдавать legacy implementation.

## TASK 45.3 — Worktree hygiene

После доказанного merge/ancestry удалить только clean completed worktrees
EPIC 37–42; PR !74 worktree убрать после merge. Пользовательский
`_root_utf8.txt` не удалять без отдельной идентификации.

## TASK 45.D — Delivery

Docs diff review, STANDARD gate, merge, затем scoped/global Task Manager smoke.

**Acceptance:** docs exact; reconcile CLEAN; lint/orphans PASS; ready queue без
legacy work; active/dirty worktrees перечислены.
**Recovery:** перед supersede/close сохранить exact mapping/status snapshot;
ошибочную запись reopen/reverse только по mapping evidence. Branch удаляется
только после merge ancestry proof; clean worktree восстанавливается через
`git worktree add` из сохранённой branch/SHA. Bulk delete/force cleanup запрещены.
**Stop:** отсутствует точный replacement ID или найден unknown dirty state.

# EPIC 46 — INFRASTRUCTURE CONTROL PLANE

**Outcome:** сервер, Secret Master, Timeweb API и изолированные DB-контуры
доступны через документированный least-privilege маршрут.

**Entry:** v2 APPROVED. **Wave:** A. **Risk:** RISKY.
**Delivery:** `MERGE_AFTER_GATE`; operational checkpoint входит в evidence, production deploy запрещён.

## TASK 46.1 — Redacted access matrix

Подтвердить `moreigory`, deploy+sudo, server identity, Timeweb server/DB resource,
Secret Master names, API permissions и отсутствие необходимости root SSH.

## TASK 46.2 — Staging/restore resource

- не пытаться `CREATE DATABASE` под `gen_user`;
- read-only получить exact quote/currency/billing period минимального отдельного
  PostgreSQL 18 cluster; разрешённый cap после approval v2 — 600 RUB/month
  including tax;
- подготовить exact API request для изолированного long-lived staging cluster,
  не меняя production-target cluster `4210557`; фактическое создание cluster,
  `moreigory_staging`, disposable `moreigory_restore_dst` и least-privilege
  identities выполняет только TASK 46.O из merged SHA;
- если quote выше cap, currency/period не доказаны или API mutation запрещена —
  оформить один external blocker без попытки upgrade production-target cluster;
- production PII не копировать.

## TASK 46.3 — Secret routing

Определить отдельные staging credentials и names для `PAYLOAD_SECRET`, public
server URL, revalidation и S3. Значения никогда не писать в git/log/chat.

## TASK 46.P — Runbook/code delivery

Зафиксировать runbook/preflight в PR, выполнить RISKY gate и merge.

## TASK 46.O — Operational execution

Из exact merged SHA выполнить API provisioning и записать redacted ledger evidence.

## TASK 46.D — Evidence closeout

Проверить consumer smoke, resource identity и ledger; docs-only PR только при
фактическом изменении canonical docs.

**Acceptance:** SSH/API/DB smoke PASS; staging/restore identity существует;
runtime и staging secrets разделены; cost/resource recorded.
**Recovery:** production-target cluster `4210557` никогда не изменять. При
partial/wrong provisioning удалить только новый пустой resource по exact ID
после проверки отсутствия данных/consumers; если безопасное удаление не доказано
— retain+label incident и выполнить forward-fix. Удалить только созданные этой
task Secret Master entries либо заменить их forward-fix; чужие secrets не трогать.
**Stop:** API не имеет нужной mutation permission после safe retries или target
resource identity неоднозначна.

# EPIC 47 — CREDENTIAL / ENV HARDENING

**Outcome:** утёкшая DB identity отозвана после безопасного переключения, а
runtime env полон, LF-normalized и проверен потребителем.

**Entry:** EPIC 46. **Wave:** B. **Risk:** RISKY.
**Delivery:** `MERGE_AFTER_GATE`; operational checkpoint входит в evidence.

## TASK 47.1 — Replacement identity and grants

Создать replacement DB identity, выдать только необходимые права, проверить
connect/schema permissions; старую identity пока не отзывать.

## TASK 47.2 — Zero-downtime rotation

Обновить Secret Master и `/etc/moreigory/app.env`, нормализовать LF, выполнить
controlled restart + health/DB smoke, затем отозвать старый credential.

## TASK 47.3 — Runtime env completeness

Проверить `PAYLOAD_SECRET`, canonical server URL, revalidation, S3 и contour
flags; staging/prod values не смешивать.

## TASK 47.P — Runbook/code delivery

Зафиксировать rotation runbook/tests, RISKY gate и merge до mutation.

## TASK 47.O — Operational execution

Из exact merged SHA выполнить dual-credential rotation и consumer smoke.

## TASK 47.D — Evidence closeout

Записать redacted ledger, доказать revoke старой identity; docs-only PR по факту.

**Acceptance:** новый credential работает; старый отклоняется; секреты не
раскрыты; service health PASS; env contract complete.
**Rollback:** до revoke вернуть previous env; после revoke — forward-fix новой identity.
**Stop:** replacement identity/grants неоднозначны, consumer smoke FAIL,
Secret Master/env target не exact или revoke может оставить runtime без доступа.

# EPIC 48 — DB REHEARSAL / BACKUP / RESTORE

**Outcome:** полный migration и recovery contract доказан на изолированном
PostgreSQL 18 без записи в production data.

**Entry:** EPIC 44 + 47. **Wave:** C. **Risk:** RISKY.
**Delivery:** `MERGE_AFTER_GATE`; operational evidence обязательно.

## TASK 48.1 — Clean and upgrade rehearsal

Применить полную chain на clean staging и upgrade fixture; записать exact
migration ledger, owner bootstrap и schema state.

## TASK 48.2 — Enum and data preflight

Если `properties` отсутствует/пуст — зафиксировать `not applicable before seed`.
Если данные есть — read-only drift query; DDL только при zero unsupported rows.

## TASK 48.3 — Restore proof

Полный logical dump staging с migration ledger и минимальными seeded application
records → disposable restore DB → boot application → read seeded records;
teardown disposable target после evidence. Никогда не restore поверх production DB.

## TASK 48.4 — DB-backed routes

Проверить Admin/auth, public list/detail, unpublished boundary и migrations-only
adapter через staging runtime.

## TASK 48.P — Runbook/code delivery

Зафиксировать rehearsal code/runbook, выполнить RISKY gate и merge до DB operation.

## TASK 48.O — Operational execution

Из exact merged SHA выполнить clean/upgrade/full restore/DB-backed proofs.

## TASK 48.D — Evidence closeout

Проверить migration ledger и recovery evidence; docs-only PR по факту.

**Acceptance:** clean/upgrade/restore/app-read PASS; rollback/forward-fix описан;
никакой production row mutation.
**Stop:** destructive anomaly, unsupported live enum value или source history mismatch.

# EPIC 49 — PREVIEW RUNTIME

**Outcome:** `more-previu.tw1.ru` является полноценным noindex staging runtime,
а не health-only bootstrap с публичным `503`.

**Entry:** EPIC 48 PASS. **Wave:** C. **Risk:** RISKY.
**Delivery:** `MERGE_AFTER_GATE`; staging rehearsal обязательно, production запрещён.

## TASK 49.1 — Immutable staging artifact

Собрать artifact вне runtime host из exact main; checksum, release manifest,
atomic install и previous release сохранить.

## TASK 49.2 — Runtime surface

`nginx -t`, TLS, `/api/health`, `/`, Admin, HTML, robots, sitemap, static/media,
S3 upload/head, logs; `JOBS_AUTORUN=false`, noindex/nofollow.

## TASK 49.3 — Rollback and monitoring

Выполнить atomic rollback proof; зафиксировать systemd/Nginx health, log path и
минимальный server-side monitoring без обязательного внешнего SaaS.

## TASK 49.P — Runbook/code delivery

Зафиксировать artifact/install/runbook, выполнить RISKY gate и merge до deploy.

## TASK 49.O — Operational execution

Из exact merged SHA выполнить staging deploy, smoke и rollback proof.

## TASK 49.D — Evidence closeout

Сохранить staging identity/runtime ledger; docs-only PR по факту.

**Acceptance:** публичные preview routes не 503; health/runtime identity PASS;
noindex доказан; rollback PASS; S3 persistence PASS.

**Rollback:** atomic switch на previous release; schema не down-ить.
**Stop:** TLS/Nginx ambiguity, artifact SHA mismatch, DB migration not PASS,
повторяемый 5xx или service restart.

# EPIC 50 — LEADS PRODUCTION READINESS

**Outcome:** canonical `POST /api/public/leads` безопасно сохраняет заявки в
Payload, оператор видит их в Admin, а production abuse/PII contract доказан.

**Entry:** v2 APPROVED. **Wave:** A. **Risk:** RISKY.
**Delivery:** `MERGE_AFTER_GATE`.

## TASK 50.1 — Canonical intake decision

Зафиксировать локальный Payload endpoint как production intake. Внешний AMS
Leads API и notification channel выключены до отдельной интеграции.

## TASK 50.2 — Trusted client and rate limit

Не доверять произвольным forwarded headers; определить trusted proxy boundary.
Default: Nginx `limit_req` на canonical leads route + application limiter;
effective policy `5 requests/minute/client`, burst `5`, excess → HTTP 429.
Client IP принимается только от локального trusted Nginx proxy; spoofed external
forwarded headers игнорируются. Добавить детерминированный denied-path proof.

## TASK 50.3 — Anti-bot and privacy

Default provider: Cloudflare Turnstile. Site/secret keys живут только в Secret
Master. Сначала read-only обнаружить existing Cloudflare project/API access;
при наличии автономно создать widget exact hostnames `moreigori.ru` и
`more-previu.tw1.ru`; при отсутствии сформировать один consolidated owner action
до RC. Rotation/rollback: новый widget/secret → consumer smoke → revoke old;
при fail форма disabled. До появления account/keys публичная форма остаётся disabled и не
блокирует read-only launch; сохранить honeypot/minimum-fill, выполнить
PII-log/analytics scan и retention proof.

## TASK 50.4 — E2E

Browser submit → transactional save → Admin visibility → duplicate/retry/error
behavior. Реальный outbound channel не требуется.

## TASK 50.D — Delivery

Security/data diff review, RISKY gate, merge; enabled/disabled form state записать.

**Acceptance:** форма получает terminal state `ENABLED_PASS` либо
`DISABLED_NO_CAPTCHA`; для enabled allowed/denied E2E PASS, spoof закрыт, PII не
попадает в logs/analytics, заявка доступна оператору.
**Stop:** запрещено включать форму без Turnstile keys; остальная программа продолжается.
**Rollback:** disable public form, вернуть previous trusted-proxy/Nginx config;
уже принятые leads сохраняются и не удаляются.

# EPIC 51 — CONTENT FACT FOUNDATION

**Outcome:** все публикуемые business claims имеют единый доказательный пакет;
неизвестные факты не выдумываются.

**Entry:** v2 APPROVED. **Wave:** A. **Risk:** STANDARD.
**Delivery:** `MERGE_AFTER_GATE`.

## TASK 51.1 — Autonomous evidence inventory

Собрать существующие sources, claims, routes, projects, team/methodology gaps и
легальные placeholders; research не становится Source of Truth автоматически.

## TASK 51.2 — CONTENT_FACT_PACKET

Один консолидированный owner packet вместо серии вопросов: юридические/public
contacts, команда, модель вознаграждения/disclosure, методика/stop factors,
география, реальные проекты/кейсы и допустимые claims.

## TASK 51.3 — Fail-closed mapping

До получения факта соответствующая entity остаётся draft/unpublished/noindex;
остальная программа продолжается.

## TASK 51.D — Delivery

Claim/fact ledger review, STANDARD gate и merge без публикации unknown entities.

**Acceptance:** claim ledger содержит source/status/owner; один пакет вопросов;
каждая entity имеет terminal state `FACT_PASS`, `UNPUBLISHED_NO_FACT` либо
`DEFERRED_OUT_OF_RELEASE`; нулевые unsupported published claims.
**Late owner gate:** только факты, которые невозможно доказать из project evidence.
**Rollback:** entity возвращается в draft/unpublished; source ledger сохраняется.
**Stop:** конфликт источников останавливает только соответствующую row; unknown
fact переводит row в `UNPUBLISHED_NO_FACT`, независимая работа продолжается.

# EPIC 52 — CONTENT / TRUST / EDITORIAL COMPLETION

**Outcome:** коммерческие, региональные и аналитические страницы содержательно
уникальны, доказательны и готовы к page-level index gate.

**Entry:** EPIC 51 для конкретного факта; независимый sourced content может идти
раньше. **Wave:** B. **Risk:** STANDARD. **Delivery:** `MERGE_AFTER_GATE`.

Scope: launch cohort из доказанных регионов/страниц, методика, команда/trust/legal,
статьи, реальные паспорта и media,
sources/`verifiedAt`, legacy URL inventory/direct redirects, editorial/legal QA.

Minimum non-empty launch cohort, non-waivable:

```text
/
/investicionnaya-nedvizhimost/
/metodika/
/podbor/
/o-kompanii/
/kontakty/
/privacy/
/consent/
```

Региональные/объектные/аналитические rows входят только при `FACT_PASS`.
Если любая страница minimum cohort не достигает PASS, EPIC 52/RC не закрывается.

## TASK 52.1 — Content matrix and launch cohort

Создать row для каждого route/entity, собрать source/fact status и определить
terminal launch state без выдумывания данных.

## TASK 52.2 — Sourced content implementation

Завершить только доказанные регионы, trust/legal, methodology, articles,
passports и media; неизвестные entity оставить unpublished.

## TASK 52.3 — Editorial / legal / redirect QA

Проверить уникальность, claims, disclosures, dates, legacy redirects и visible sources.

## TASK 52.D — Delivery

Content diff review, STANDARD gate, merge; приложить terminal matrix.

**Acceptance:** каждая content row terminal: `PASS`, `UNPUBLISHED_NO_FACT` или
`DEFERRED_OUT_OF_RELEASE`; release cohort состоит только из `PASS`; нет template
duplicates и фиктивных проектов/доходности; sources видимы; dates factual.
**Stop:** неполученный факт блокирует только зависимую entity.

**Rollback:** снять entity с publication/index; не удалять factual source history.

# EPIC 53 — INDEX / STRUCTURED DATA / PERFORMANCE GATE

**Outcome:** индексируются только доказанные content-complete pages; видимая
страница, metadata, sitemap и structured data согласованы.

**Entry:** EPIC 49 + 52. **Wave:** C. **Risk:** STANDARD.
**Delivery:** `MERGE_AFTER_GATE`.

Scope: page matrix только для `PASS` launch cohort; index/sitemap activation;
canonical/robots; structured data;
390/768/1024/1440/1920 browser/a11y; Project Passport first screen ≤1.5 MB;
TBT ≤200 ms; post-launch INP target measured separately.

## TASK 53.1 — Index and sitemap activation

Включить index/sitemap только для terminal `PASS` rows; остальные остаются noindex.

## TASK 53.2 — Structured data and browser matrix

Сверить visible content/schema и выполнить responsive/accessibility proof.

## TASK 53.3 — Content-complete performance

Измерить asset/page budgets на итоговом launch cohort; failure возвращает row
в noindex либо требует scoped optimization.

## TASK 53.D — Delivery

SEO/UI diff review, STANDARD gate, merge; приложить page-level evidence matrix.

**Acceptance:** каждая indexed page имеет PASS row; failed rows остаются
noindex; весь minimum launch cohort PASS; schema соответствует visible content;
budgets доказаны на content-complete build.

**Rollback:** вернуть конкретную failed row в noindex/sitemap exclusion.
**Stop:** metadata/schema mismatch, budget failure или browser/a11y regression.

# EPIC 54 — RELEASE CANDIDATE

**Outcome:** один exact main SHA и immutable artifact готовы к production без
повторного изменения кода между staging и rollout.

**Entry:** EPIC 45, 48, 49, 50, 53. **Wave:** D. **Risk:** RISKY.
**Delivery:** `MERGE_AFTER_GATE`; production запрещён.

Scope: final diff review; `pnpm verify`; schema; production-like browser,
Nginx, leads, restore evidence; exact-head SourceCraft RISKY gate; artifact,
checksum/manifest и rollback candidate; docs exact-main closeout.

## TASK 54.1 — Evidence aggregation

Проверить non-waivable prerequisites и exact merged SHAs без повторения valid suites.

## TASK 54.2 — Final verification and artifact

Собрать один immutable artifact exact EPIC 54 candidate, установить тот же
digest на staging, повторить только invalidated production-like proofs после
EPIC 50–53, затем freeze digest для production promotion без rebuild.

## TASK 54.3 — Release docs closeout

Обновить delivery state/release checklist на exact main и candidate digest.

## TASK 54.D — Delivery

Final review, один RISKY exact-head gate, merge; затем exact-main candidate proof.

**Acceptance:** gate PASS exact SHA; staging digest и candidate digest один.
Non-waivable PASS: minimum launch cohort, migration chain, credential rotation,
full restore, preview runtime, production env, exact artifact и enabled leads.
Excludable only:
feed/outbound notification/maps disabled и entities terminal
`UNPUBLISHED_NO_FACT`/`DEFERRED_OUT_OF_RELEASE`.

**Rollback:** candidate не продвигается; исправление только новым PR/SHA.
**Stop:** digest/SHA drift, missing non-waivable evidence или gate не PASS.

# RELEASE 55 — PRODUCTION ROLLOUT

**Outcome:** exact EPIC 54 artifact работает на production contour с применённой
migration chain и готовым rollback.

**Entry:** EPIC 54 + явная команда `Выпускаем production`. **Wave:** E.
**Risk:** PRODUCTION/RISKY. **Delivery:** release runbook, не feature PR.

Scope: preflight, recovery point, backward-compatible expand/contract migrations
либо exact per-migration recovery plan, inactive install,
Host-header smoke, atomic switch, health, controlled jobs-owner decision;
`JOBS_AUTORUN=false`, feed/outbound channel disabled по V2-OD-04/V2-OD-08.

## TASK 55.1 — Release preflight

Подтвердить exact main/gate/artifact, recovery point, migration plan и inactive target.

## TASK 55.2 — Migration and inactive rollout

Применить reviewed migration plan, установить тот же digest, выполнить local
Host-header/health smoke до public switch.

## TASK 55.3 — Atomic switch and observation

Переключить symlink/service; golden routes обязаны вернуть ожидаемые 2xx/3xx,
любой 5xx или health fail запускает допустимый rollback. Наблюдение 15 минут;
rollback trigger: любой повторяемый 5xx golden route, service restart либо DB error.

**Acceptance:** release identity/SHA/digest доказаны; health + changed scenarios
PASS; previous release сохранён; error spike отсутствует.
**Automatic rollback:** только artifact/symlink при доказанной schema
compatibility. Production migration никогда автоматически не down-ится; DDL
anomaly = stop + restore/forward-fix по exact recovery plan.

**Stop:** backup/recovery point отсутствует, migration anomaly, health fail,
повторяемый 5xx, DB error или artifact identity mismatch.

# RELEASE 56 — DNS / TLS CUTOVER / LIVE PROOF

**Outcome:** `moreigori.ru` обслуживает проверенный release, а полный live
contract и rollback window зафиксированы.

**Entry:** EPIC 55 PASS. **Wave:** F. **Risk:** PRODUCTION/RISKY.

Scope: DNS, TLS, Nginx canonical host; 200/404/redirect/sitemap/robots/form;
mobile/visual/log smoke; canonical/index validation; rollback observation
window; final `DELIVERY_STATE` и Release Checklist closeout.

## TASK 56.1 — DNS/TLS preflight and cutover

Снизить TTL заранее, проверить certificate readiness и переключить canonical host.

## TASK 56.2 — Live proof

Проверить golden routes, form state, mobile/visual, logs, canonical/robots/sitemap.

## TASK 56.3 — Observation and closeout

Наблюдать 30 минут. Rollback trigger: TLS/canonical failure, повторяемый 5xx,
форма теряет данные, DB error или service restart. При trigger вернуть DNS/Nginx
и previous release по runbook; затем обновить final state/evidence.

**Acceptance:** domain/TLS/canonical PASS; form persists; no PII/error spike;
rollback remains executable; Task Manager release nodes have evidence.

**Rollback:** DNS/Nginx возвращаются на previous known-good target; previous
artifact сохраняется до окончания 30-minute window.
**Stop:** TLS/canonical failure, DNS target ambiguity, repeated 5xx, DB error,
data-loss symptom или inability to execute rollback.

## V2 preliminary Architect audit

Это assembly finding register, не финальный readiness verdict.

| Pass | Результат |
|---|---|
| Logic / completeness | v1 EPIC 44 placeholder недостаточен; EPIC 44–56 покрывают весь обнаруженный остаток |
| Architecture / data / security | Критичные области изолированы: historical migrations, DB control plane, credential rotation, trusted leads boundary, content facts |
| Dependencies / autonomy | Cycles 0; четыре независимых старта Wave A; локальный content/DB blocker не останавливает другие ветки |
| Executability / evidence | Для каждого epic заданы observable outcome, acceptance, risk, delivery и stop; production вынесен в 55–56 |

Current Night Run Readiness: `NOT_READY` до законченного assembly round,
ValidateDraft, явного перехода к финальному audit и approval exact v2.

Expected after approval: `READY_WITH_LIMITS`. Неизбежные поздние gates:

1. единый `CONTENT_FACT_PACKET` только для недоказуемых business facts;
2. CAPTCHA account/secret, если безопасный self-contained вариант отсутствует;
3. external control-plane failure после safe retries;
4. destructive live-data anomaly;
5. одна явная production-команда перед EPIC 55.

## V2 Definition of Done

```text
[ ] new Plan ID mg4 imported/reconciled CLEAN; v1 records immutable
[ ] legacy open records superseded/closed with replacement evidence
[ ] EPIC 44 migration baseline repair merged
[ ] EPIC 45 canonical docs/Task Manager/worktree hygiene complete
[ ] EPIC 46 isolated staging/restore control plane available within spend cap
[ ] EPIC 47 credentials rotated and runtime env complete
[ ] EPIC 48 clean/upgrade/full restore/DB-backed proofs PASS
[ ] EPIC 49 preview public runtime PASS, noindex, rollback proven
[ ] EPIC 50 leads terminal state recorded; enabled form passes security/E2E
[ ] EPIC 51–52 all fact/content rows terminal
[ ] EPIC 53 only PASS cohort indexed; schema/browser/performance PASS
[ ] EPIC 54 exact-main release candidate, one RISKY gate and immutable digest PASS
[ ] EPIC 55–56 excluded from implementation graph until release command
[ ] after release command, release graph evidence proves rollout/cutover/rollback window
```

**Конец документа — План №3 v2 REVIEW.**
