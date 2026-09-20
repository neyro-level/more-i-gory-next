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

Build happens off the runtime host. Pack with
`node scripts/pack-release.mjs --from <linux-build> --sha <40-char> --out <dir>`,
then install with `ops/runtime/install-release.sh`.

Layout:

```text
/opt/moreigory/releases/<sha>/
/opt/moreigory/current → /opt/moreigory/releases/<sha>
```

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
is the only public listener: TLS, security headers, `/api` and `/admin`
proxying, and `/_next/static/` cache live in
`ops/nginx/more-previu.tw1.ru.conf`. Node binds `127.0.0.1:3000`. The static-export sample
`ops/nginx/legacy/moreigori-static.example.conf` is not current.
`moreigori.ru` is not pointed to this server until the owner approves the final
domain cutover.

## Target topology

Preview/staging and later production use the same hop chain. Node is not a
public listener: only Nginx terminates TLS and proxies to loopback.

```text
Internet
→ Nginx TLS
→ 127.0.0.1:<app-port>
→ Next standalone + Payload
→ Managed PostgreSQL
→ S3
```

Pinned preview values:

```text
public host     : more-previu.tw1.ru
TLS terminator  : Nginx (ops/nginx/more-previu.tw1.ru.conf)
app bind        : HOSTNAME=127.0.0.1 PORT=3000
process         : Next standalone + Payload in one Node runtime
database        : Timeweb Managed PostgreSQL via DATABASE_URI in /etc/moreigory/app.env
media           : Timeweb S3 bucket moreigory-media (not VPS disk)
```

Canonical database secret route:

```text
Secret Master more-i-gory-server/prod/MOREIGORY_DATABASE_URL
→ /etc/moreigory/app.env:DATABASE_URI
→ Next.js + Payload
```

The legacy `DATABASE_URL` and `POSTGRESQL_*` duplicates were removed during
TASK 47.O. Project code consumes only the `DATABASE_URI` value rendered from
`MOREIGORY_DATABASE_URL`; `MOREIGORY_STAGING_DATABASE_URL` must not be created.

### In-place database credential rotation

The minimum Timeweb PostgreSQL preset permits one database and one user. The
credential is therefore rotated on the existing administrator; a parallel user,
second database or tariff increase is not part of this project.

The operation is allowed only by TASK 47.O from the exact merged EPIC 47 SHA:

```text
verify cluster 4210557 + one administrator + current consumer smoke
→ generate replacement password in process
→ change the existing administrator password in Timeweb
→ update Secret Master MOREIGORY_DATABASE_URL and password component
→ atomically render /etc/moreigory/app.env with LF endings
→ remove legacy DATABASE_URL and stale CAPTCHA/second-DB variables
→ validate env names without printing values
→ controlled restart of preview moreigory.service
→ /api/health + database consumer smoke
→ prove the previous password is rejected
→ record redacted evidence
```

The preview maintenance window starts when Timeweb accepts the new password and
ends after the health and database smoke pass. `moreigori.ru`, DNS, TLS and
production rollout are outside this operation.

Before the provider change, any ambiguous cluster, administrator or permission
is a hard stop with no mutation. After the provider change, recovery is a
forward-fix: finish propagation of the new credential or assign another new
password to the same exact administrator and repeat Secret Master/env delivery.
Never restore an unrecorded old password. If health or database smoke fails,
retain preview maintenance and diagnose before any further rollout.

## Runtime supervisor

Chosen supervisor: `systemd` unit `moreigory.service`
(`ops/systemd/moreigory.service`).

```text
Type=simple
Restart=always
RestartSec=3
bind=127.0.0.1:3000
```

Container orchestration is not used for this host. The process is a single
Node runtime behind Nginx.

## Rollback

Rollback is `ops/runtime/rollback-release.sh`:

```text
current → previous release
restart
smoke
```

It does not rebuild the application. Destructive migration requires a separate
recovery plan and explicit owner decision.

## Migrations

Payload является единственным schema owner; `push:false`, schema меняется только
committed migrations. `pnpm verify:schema` генерирует types и проверяет drift во
временной директории, не загрязняя checkout. Clean local PostgreSQL 18 proof
выполнен в EPIC 2. In-place preview migration/runtime proof выполняет EPIC 48;
production rollout не разрешён.

## Backup and recovery boundary

Timeweb Managed PostgreSQL keeps provider backups. A separate restore database,
backup/restore rehearsal and production disaster-recovery proof are explicitly
outside approved plan v3 and do not block the technical preview. No project
script provisions a restore target or dumps application data.

S3 media (TASK 31.5):

```text
versioning     : enabled on moreigory-media (Timeweb S3 capability; operator must keep it on)
retention      : noncurrent versions at least 30 days; never empty-bucket as cleanup
independent    : required — ru-1 is a single region; copy media/ off Timeweb — IMPROVEMENT / owner
restore        : restore VersionId onto the same key; do not pull files from the VPS disk
```

Provider backup availability is recorded, but restore readiness is not claimed.

## Jobs runtime

Один jobs-capable runtime есть; `JOBS_AUTORUN=true` только у единственного
jobs-active process после production jobs gate (EPIC 44). Machine-lock не
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
ops/runtime/jobs-handover.sh assert-none false
ops/runtime/jobs-handover.sh smoke
# stop old owner, then:
ops/runtime/jobs-handover.sh assert-none false,false
# production contour only:
ops/runtime/jobs-handover.sh assert-steady false,true
ops/runtime/jobs-handover.sh smoke
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
Каталог из фида заморожен до отдельной команды. Autorun DISABLED: `dispatchDueFeeds`
без cron, очередь `imports` с `disableScheduling: true`. `FEED_SOURCE_*` не обязательны
и после деплоя сами не запускают импорт. Без configured source и без отдельной команды
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
smoke 2026-09-18). Object SoT: `disableLocalStorage: true`, path-style URL
`https://s3.twcstorage.ru/moreigory-media/media/<filename>`. Restart/redeploy
VPS не должен удалять объекты: они не пишутся на диск приложения. RUNTIME
upload→HeadObject на живом runtime — TAP 14.G; PRODUCTION NOT PROVEN.
VPS disk не является source of truth.

## Staging

This preview host **is** the staging contour (TASK 13.7). `moreigori.ru` cutover
is later and is not this task.

```text
публичный хост     : more-previu.tw1.ru
runtime            : тот же сервер, отдельный release-каталог / unit moreigory.service
база               : единственная существующая default_db на cluster 4210557; сейчас 0 public tables
S3                 : bucket moreigory-media, prefix staging/media
secrets            : MOREIGORY_DATABASE_URL renders runtime DATABASE_URI;
                     отдельный staging/restore secret запрещён
индексация         : X-Robots-Tag noindex, nofollow; robots.txt disallow
jobs ingest        : JOBS_AUTORUN=false; feed catalog remains frozen
```

Preview использует ту же единственную project-owned database identity. Создание
второй database/user и restore rehearsal исключены утверждённым v3; отдельного
provisioning script нет.

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
