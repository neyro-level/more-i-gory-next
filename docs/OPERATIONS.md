# Operations — «Море и Горы»

**Статус:** Draft skeleton — заполняется в EPIC 13
**Режим:** BUILD
**Production:** не выпускался

Документ станет единственным проектным runbook для эксплуатации. Пока runtime,
окружения и доступы не реализованы, команды и реквизиты не выдумываются.

## Deploy

'TODO EPIC 13': exact-main artifact, migrations, versioned release, atomic
switch, Nginx reload и live smoke. Build на production host запрещён.

## Rollback

'TODO EPIC 13': переключение на known-good release без rebuild. Destructive
migration требует отдельного recovery plan и явного решения владельца.

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
