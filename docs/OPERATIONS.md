# Operations — «Море и Горы»

**Статус:** Active technical preview runbook
**Режим:** BUILD
**Production:** technical preview domain `more-previu.tw1.ru`; final domain `moreigori.ru`
is reserved for a later cutover and is not changed by this runbook.

Документ — runbook эксплуатации. Статусы честные:

```text
CODE EXISTS            код в main
RUNTIME NOT PROVEN     нет живого прогона на preview/staging
PRODUCTION NOT PROVEN  нет owner-approved production
```

Команды и реквизиты не выдумываются.

## Deploy

Production release uses an exact `main` SHA and a Linux-built Next.js
standalone artifact. The server receives the already built artifact, not source
that must resolve dependencies or build on the production host.

Artifact contents:

- `.next/standalone/`;
- `.next/static/`;
- `public/`;
- release metadata with the exact git SHA.

Runtime command:

```text
HOSTNAME=127.0.0.1 PORT=3000 NODE_ENV=production node server.js
```

The active release is selected by an atomic `current` symlink switch. Nginx
proxies `more-previu.tw1.ru` to the local runtime. `moreigori.ru` is not pointed
to this server until the owner approves the final domain cutover.

## Rollback

Rollback is an atomic switch of `current` to the previous successful release,
then service restart and live smoke. It does not rebuild the application.
Destructive migration requires a separate recovery plan and explicit owner
decision.

## Migrations

Payload является единственным schema owner; `push:false`, schema меняется только
committed migrations. `pnpm verify:schema` генерирует types и проверяет drift во
временной директории, не загрязняя checkout. Clean local PostgreSQL 18 proof
выполнен в EPIC 2. Staging/production migration: CODE EXISTS (процедура в
EPIC 13), RUNTIME NOT PROVEN, PRODUCTION NOT PROVEN.

## Backup and restore

CODE EXISTS на стороне Timeweb Managed PostgreSQL (провайдер умеет backup).
RUNTIME NOT PROVEN: фактический restore test ещё не выполнялся (EPIC 13).
PRODUCTION NOT PROVEN.

Backup не считается доказанным без успешного restore evidence.

## Jobs runtime

Один jobs-capable runtime есть; `JOBS_AUTORUN=true` только у единственного
jobs-active process после production jobs gate (EPIC 13). Machine-lock не
вводится (TASK 25.8 вариант 3): проверка — runbook + deploy-шаг.

Handover:

```text
new runtime JOBS_AUTORUN=false
→ readiness
→ stop old jobs owner
→ assert no owner
→ start new owner JOBS_AUTORUN=true
→ health
```

Deploy-шаг (обязателен перед тем как новый runtime станет jobs owner):

```bash
node scripts/assert-one-jobs-owner.mjs --mode=handover-none --values=<old>,<new>
node scripts/assert-one-jobs-owner.mjs --mode=steady --values=<old>,<new>
```

`--values` — фактические `JOBS_AUTORUN` всех Node runtime этого контура
(`true`/`false`). Можно передать env-файлы: `--from-env-files=.env.a,.env.b`.
Steady state обязан дать ровно один `true`. На шаге «assert no owner» —
`--mode=handover-none` и ноль `true`. Переключение `false → true` только
controlled restart, не live mutate.

### Payload jobs diagnostics

`payload-jobs` — внутренняя системная коллекция Payload Jobs Queue. Обычный
код проекта не читает и не меняет её напрямую: доверенный recovery-доступ
разрешён только в `src/core/data-access/system/jobs.ts`.

Owner-only read diagnostics включается через `jobsCollectionOverrides`, который
поддерживается pinned Payload `3.89.0`: в Admin коллекция видима владельцу
только для чтения. Create/update/delete для `payload-jobs` остаются запрещены.

Ручная процедура:

1. Проверить, что открыт именно production/staging контур задачи, а не соседний
   проект.
2. Смотреть только агрегированные поля jobs: `taskSlug`, `queue`,
   `processing`, `waitUntil`, `completedAt`, `hasError`, `totalTried`.
3. Не копировать в чат или issue raw `input`, `output`, `error` и `log`, если
   там может быть PII или техническая диагностика.
4. Recovery выполнять через штатные maintenance tasks и системные функции.
5. Raw SQL не является default-методом диагностики или восстановления; он
   требует отдельного incident/recovery plan и explicit owner decision.

## Imports

CODE EXISTS: коллекции и jobs ingest в `main`. RUNTIME NOT PROVEN на живом фиде.
Autorun DISABLED (freeze): без configured source и без отдельной команды
владельца ingest не включается. Runbook обязан покрывать suspicious run, source
isolation, deactivation approval, recovery и запрет массовой деактивации после
неполного feed.

## Leads

CODE EXISTS: intake, transactional outbox, retry/recovery и retention в `main`
(EPIC 10–12). RUNTIME NOT PROVEN E2E. Внешний канал оповещений DISABLED:
оператор смотрит заявки в Payload Admin. PRODUCTION NOT PROVEN. PII и secrets
в логи не попадают.

Дубли на стороне получателя не гарантируются (ADR-011). Если канал когда-нибудь
будет включён, два сообщения с одним `Delivery ID` — это повтор одной
`lead-deliveries` строки после retryable/unknown, а не две заявки. Сверять
`deliveryId` в тексте, затем `idempotencyKey` / `attemptLog` / `externalRef` в
Admin. Несколько `Lead ID` — разные заявки.

### Manual retry of abandoned deliveries

Path: Payload Admin as **owner** → collection `lead-deliveries` → open the
abandoned document → copy its ID → `POST /api/lead-deliveries/<id>/retry`
with the owner session. Optional JSON `{ "reasonRedacted": "…" }` (no PII).

Success returns `{ ok: true, status: "pending" }` and enqueues `deliverLead`.
Non-abandoned rows return `409 not_abandoned`. Editors and anonymous callers
get `403`. Do not flip `status` by hand in Admin; that skips audit and enqueue.

## S3 and media

CODE EXISTS: Payload upload adapter и бакет `moreigory-media` (EPIC 6 + API
smoke 2026-09-18). RUNTIME NOT PROVEN на VPS. PRODUCTION NOT PROVEN.
VPS disk не является source of truth.

## Staging

CODE EXISTS как контракт: `more-previu.tw1.ru`, отдельная database name, S3
prefix, noindex, без production PII. RUNTIME NOT PROVEN до EPIC 13.
PRODUCTION NOT PROVEN.

## Incident checklist

1. Остановить утечку или ошибочный процесс.
2. Отозвать затронутый secret.
3. Сохранить безопасные факты без PII и credentials.
4. Определить затронутые данные и операции.
5. Восстановить сервис проверенным способом.
6. Проверить юридические обязанности.
7. Зафиксировать root cause.
8. Добавить защиту от повторения.

## Human gates

- production hostname, TLS и staging identity;
- новые secrets и external accounts;
- production migration, restore, rollback и deploy;
- legal/PII decisions и retention;
- production release command владельца.
