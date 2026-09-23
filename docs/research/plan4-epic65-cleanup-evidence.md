# EPIC 65 repository cleanup evidence

**Статус:** Evidence only
**Дата:** 2026-09-23
**Scope:** TASK 65.4

## Property enum drift

- `pnpm report:property-enum-drift` выполнен без `DATABASE_URI`.
- Отчёт: `docs/research/property-enum-drift-report.md`.
- Production и тестовая БД не подключались по решению владельца.
- SQL из отчёта не выполнялся; DDL и mutation не запускались.
- Фактический row-level drift остаётся `not queried`, поэтому отдельная mutation
  task не создаётся и enum conversion не разрешается.

## Dependency report

- Framework entrypoints: Next.js App Router, Payload config/Admin/jobs,
  Velite, `scripts/**`, `ops/**`, Node test scripts и workspace contracts.
- `pnpm quality:dead-code` использует Knip `6.35.0` в dependency-only режиме.
- Payload plugin не исполняет runtime config при анализе: `payload.config.ts`
  остаётся статическим entrypoint через `knip.json`.
- Подтверждённых unused или unlisted dependencies после исправления: `0`.
- Найденный phantom import `postgres` в enum reporter исправлен exact direct
  dependency `postgres@3.4.9`; import smoke PASS.
- Файлы/exports автоматически не удалялись: CLI, runbook, framework entrypoints
  и публичные barrels требуют отдельной предметной классификации.

## Physical paths and history

- Approved UI mapping записан в `docs/DESIGN.md`.
- `src/components/**` — единое project-owned UI tree.
- `src/app/(site)/globals.css` — единственный numeric token source.
- Plan №2 и Plan №3 сохранены на исходных путях; move/rename не выполнялся.
