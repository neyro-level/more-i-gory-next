# ADR-004: Static Export to Realty Platform Runtime

Status: Accepted
Date: 2026-09-15
Supersedes: ADR-001; ADR-002 implementation boundary

## Context

Проект вырос из статического preview в коммерческую платформу с Payload Admin,
Managed PostgreSQL, S3, заявками, jobs и будущими XML-фидами. Static export не
может обеспечить request-time API, публикационный workflow, транзакции и единый
jobs-active runtime.

## Decision

Перейти на `AMS_PROFILE=REALTY_BASE`: Next.js и Payload работают в одном Node.js
runtime за Nginx; данные хранятся в Managed PostgreSQL, media — в S3. Production
получает immutable artifact и ровно один jobs owner.

В EPIC 1 прекращают существовать `output: 'export'`, export image optimizer,
`serve-static`, `strip-static-route-js`, статический `out/` как production
artifact и запреты на server runtime API. Payload не входит в EPIC 1 и
подключается отдельно в EPIC 2.

Для content/data boundary сохраняется принцип изоляции presentation от
persistence, но прежняя цепочка `ContentService → ContentRepository → Adapter`
заменяется на `Public Gateway → serializable DTO → presentation`. Server-only
Payload types не выходят за gateway; старые service/repository/adapters удаляются
в EPIC 8.

## Alternatives Considered

- сохранить static export и вынести все серверные функции во внешние сервисы;
- поддерживать одновременно static и Node.js production modes;
- перейти на отдельную CMS без общего runtime contract.

## Consequences

- появляется server runtime, миграции, healthcheck, backup и rollback runbook;
- публикация больше не обязана пересобирать весь статический сайт;
- старые static-only guards должны быть удалены синхронно, без второго pipeline;
- ADR-001 остаётся историей исходного решения, но больше не задаёт целевой runtime.

## Revisit When

Только при смене класса продукта или доказанной невозможности поддерживать
Realty Platform runtime.
