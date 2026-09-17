# Operations — «Море и Горы»

**Статус:** Active technical preview runbook
**Режим:** BUILD
**Production:** technical preview domain `more-previu.tw1.ru`; final domain `moreigori.ru`
is reserved for a later cutover and is not changed by this runbook.

Документ станет единственным проектным runbook для эксплуатации. Пока runtime,
окружения и доступы не реализованы, команды и реквизиты не выдумываются.

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
выполнен в EPIC 2. Staging/production migration и restore остаются EPIC 13 gate.

## Backup and restore

'TODO EPIC 13': automatic Managed PostgreSQL backup, S3 versioning, retention,
provider-independent copy по ценности данных и фактический restore test.

Backup не считается доказанным без успешного restore evidence.

## Jobs runtime

'TODO EPIC 4/13': один jobs-active runtime с 'JOBS_AUTORUN=true'. Handover:
новый runtime стартует с 'false', проходит readiness, старый останавливается,
после подтверждения единственного владельца новый перезапускается с 'true'.

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

Не активны до EPIC 16 и появления фактического feed. Будущий runbook обязан
покрывать suspicious run, source isolation, deactivation approval, recovery и
запрет массовой деактивации после неполного feed.

## Leads

'TODO EPIC 10–12': intake, transactional outbox, Telegram delivery,
retry/recovery, retention и manual retry. PII и secrets в логи не попадают.

## S3 and media

'TODO EPIC 6/13': Payload upload → Timeweb S3, versioning, MIME/size policy,
restore/rollback procedure. VPS disk не является source of truth.

## Staging

'TODO EPIC 2/13': отдельные domain, database и non-production secrets; Basic
Auth, 'X-Robots-Tag: noindex, nofollow', без production PII dump.

## Monitoring and alerts

'TODO EPIC 13': внешний uptime/TLS monitor и агрегированные actionable alerts:
site down, jobs stalled, lead delivery outage, suspicious/overdue import и
backup failure. Provider и destination пока не утверждены.

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
