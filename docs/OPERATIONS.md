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

The only build-and-pack implementation is the manual SourceCraft workflow
`release-single-build`. It requires the exact candidate SHA, the API-verified
Merge Gate run, the previous rollback SHA and a release-store tag. The workflow
builds once, reuses that output for runtime checks, creates one archive plus
checksum and evidence, and stops before any server connection or deploy. It is
never triggered by push or Pull Request; running it still requires a separate
owner release command. A durable-store upload is a later operator step and must
stop if the SourceCraft attachment API has not been verified at execution time.

Build happens off the runtime host. Pack with
`node scripts/pack-release.mjs --from <linux-build> --sha <40-char> --out <dir>`,
verify the emitted `<dir>.tar.gz.sha256`, then install `<dir>.tar.gz` with
`ops/runtime/install-release.sh`. The packer preserves pnpm relative symlinks
verbatim and rejects absolute or dangling links before creating the archive.
The installer independently verifies the SHA-256 sidecar and structured release
manifest, extracts into an incoming directory, refuses to overwrite an existing
release SHA, and atomically switches the `current` symlink while preserving the
former target as `previous`.

Layout:

```text
/opt/moreigory/releases/<sha>/
/opt/moreigory/current → /opt/moreigory/releases/<sha>
/opt/moreigory/shared/next-cache/  # writable by the runtime user
```

Each immutable release contains `.next/cache` as a symlink to the shared
runtime-owned cache directory. The installer creates and validates this link;
do not make a whole release writable to repair cache permissions.

Artifact contents:

- `.next/standalone/`;
- `.next/static/`;
- `public/`;
- release metadata with artifact version, Node major and exact git SHA;
- a tar.gz archive and SHA-256 sidecar outside the release directory.

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

The rollback switch is transactional: after restart it gives the loopback
health endpoint up to 30 seconds to become ready. A failed readiness smoke
restores the original `current` pointer and restarts it. On success, `previous`
becomes the former current release, so the operation remains reversible without
database down/restore.

The first EPIC 49 rollout may roll back once to the already proven legacy
standalone release whose manifest predates `artifactVersion` and `nodeMajor`.
That compatibility path still requires exact directory SHA and
`layout: next-standalone`; all newly packed releases require the full v1
manifest.

Minimal server-side monitoring uses `moreigory-healthcheck.service` and
`moreigory-healthcheck.timer`: loopback health runs every five minutes and its
result is retained in the systemd journal. Runtime logs are read with
`journalctl -u moreigory`; health timer failures with
`journalctl -u moreigory-healthcheck`; Nginx logs remain
`/var/log/nginx/access.log` and `/var/log/nginx/error.log`.

## Migrations

Payload является единственным schema owner; `push:false`, schema меняется только
committed migrations. `pnpm verify:schema` генерирует types и проверяет drift во
временной директории, не загрязняя checkout. Clean local PostgreSQL 18 proof
выполнен в EPIC 2. In-place preview migration/runtime proof выполняет EPIC 48;
production rollout не разрешён.

### EPIC 48 single-database operation

This procedure is allowed only by TASK 48.O from the exact merged TASK 48.P
`main` SHA. It runs from a clean exact checkout on the preview server; installing
the locked production dependencies for this migration runner is not an
application build or release. Never use `migrate:fresh`, `migrate:down`, schema
push, reset, dump or restore.

```text
load /etc/moreigory/app.env without printing values
→ confirm exact merged SHA and clean checkout
→ db:single:preflight (default_db, PostgreSQL 18, 0 public tables, no ledger)
→ db:single:apply with explicit confirmation
→ bootstrap:owner with ephemeral Secret Master credentials
→ db:single:seed-proof with explicit confirmation
→ before EPIC 49, start an exact-code loopback rehearsal against the same DB
→ single-db-application-smoke before-restart and after a full process restart
→ verify 26 migration rows, 148 public tables and two technical proof records
```

Commands use the exact merged SHA as `<sha>`:

```text
pnpm db:single:preflight -- --expected-sha=<sha>
pnpm db:single:apply -- --expected-sha=<sha> --confirm=APPLY_SINGLE_DB_MIGRATIONS
pnpm bootstrap:owner
pnpm db:single:seed-proof -- --expected-sha=<sha> --confirm=SEED_TECHNICAL_PREVIEW_DB_PROOF
node ops/runtime/single-db-application-smoke.mjs \
  --base-url=https://more-previu.tw1.ru \
  --published-slug=db-proof-published \
  --draft-slug=db-proof-draft \
  --expected-title="Техническая проверка DB" \
  --phase=before-restart
# fully stop/start the exact-code loopback process, then repeat with --phase=after-restart
```

Before EPIC 49 installs the matching immutable preview artifact, set
`DB_SMOKE_TRANSPORT_BASE_URL=http://127.0.0.1:<port>` and run the exact-main
application through a loopback-only process with a private SSH tunnel to the
same managed database. In this mode the smoke proves application reads and
restart persistence; Nginx `noindex` is explicitly `NOT_APPLICABLE_LOOPBACK`.
Public artifact installation, Nginx/noindex proof and service-level rollback
remain EPIC 49 and must not be simulated here.

`BOOTSTRAP_OWNER_EMAIL`, `BOOTSTRAP_OWNER_PASSWORD`, `DB_SMOKE_OWNER_EMAIL` and
`DB_SMOKE_OWNER_PASSWORD` are ephemeral process variables sourced from Secret
Master. They are never written to `/etc/moreigory/app.env`, repository files or
evidence. The seed is idempotent and creates only two clearly technical preview
records: one published proof and one unpublished boundary proof.

Stop before DDL on any identity/history/table mismatch. After successful DDL,
recovery is forward-fix only: keep preview in maintenance, diagnose the exact
failed step and finish the committed migration/seed/smoke chain. Do not create a
second database and do not restore over `default_db`.

## Backup and recovery boundary

Timeweb Managed PostgreSQL keeps provider backups. Restore proof is a
**release-only owner gate**: implementation and preview work must not run it.
It starts only after the owner gives the exact command `Выпускаем production`
and approves the provider cost, backup identifier and cleanup window.

The proof must use a newly created **ephemeral recovery target** with separate
credentials. Record the source backup identifier/time, target identity,
migration/schema result and application read smoke without copying credentials
or data into evidence. Never restore over `default_db` and never reuse preview
as the recovery target. Delete the temporary target after evidence is accepted;
failure to delete it is an incident and a cost blocker for release completion.

Stop without production rollout if the provider cannot create an isolated
target, the expected backup is unavailable, schema/migration identity differs,
application read smoke fails, or cleanup cannot be guaranteed. No standing
staging/test/restore database is created by this plan.

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

Jobs-owner activation is also release-only. Until the owner gives the exact
command `Выпускаем production`, every candidate and preview runtime keeps
`JOBS_AUTORUN=false`; implementation may validate only the handover contract.
The release operator must prove zero owners before activation and exactly one
owner after it. Any ambiguous, duplicate or unreachable owner is a hard stop;
do not start jobs and do not continue rollout.

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
(EPIC 10–12). Canonical production intake — локальный
`POST /api/public/leads` → Payload Local API transaction → collection `leads`.
RUNTIME NOT PROVEN E2E. Внешний AMS Leads API и канал оповещений DISABLED:
`LEAD_CHANNELS` пуст, delivery rows/jobs не создаются, оператор смотрит заявки в
Payload Admin. PRODUCTION NOT PROVEN. PII и secrets в логи не попадают.

Не включать `LEAD_CHANNELS`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` и внешнюю
маршрутизацию для первого release candidate. Их подключение — отдельная
integration task, а не условие локального сохранения заявки.

Trusted client/rate-limit boundary: публичный Nginx перезаписывает
`X-Moreigory-Client-IP` значением `$remote_addr`; приложение игнорирует входящие
`Forwarded`, `X-Forwarded-For` и `X-Real-IP`. Edge и application policy:
`5 requests/minute/client`, Nginx burst `5`, excess → HTTP `429`.

External CAPTCHA не используется и не требует аккаунта или secret. Anti-spam
контур первого релиза: server validation, trusted-client rate limit на Nginx и в
приложении, honeypot и minimum-fill. `NEXT_PUBLIC_LEADS_ENABLED` включается после
успешного E2E локальной записи в Payload; при fail форма остаётся disabled.

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

Preview использует ту же единственную project-owned database identity. Постоянная
вторая database/user запрещена. Единственное исключение — краткоживущий
изолированный recovery target во время явно разрешённого production release по
процедуре выше; отдельного preview provisioning script нет.

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
