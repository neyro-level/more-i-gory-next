# ADR-009: Deferred XML Ingest Subsystem

Status: Accepted
Date: 2026-09-15

## Context

Ожидаются один-два XML-фида новостроек Крыма ориентировочно через два месяца,
но сейчас нет первого реального feed contract. Ранняя реализация importer будет
строиться на предположениях.

## Decision

Не активировать ingest subsystem в Realty Base foundation. Триггер запуска —
получен первый реальный XML feed и зафиксированы source, market, identity и
deactivation rules. В EPIC 15 закладывается unpublished newbuild schema, в EPIC
16 — feed sources, import runs, issues, normalization и idempotent import.

Scope деактивации обязателен:
`origin='feed' AND feedSource=<id> AND market=<source.market>`. Import никогда
не изменяет `origin=manual`. Raw payload ограничен retention и не публикуется.

## Alternatives Considered

- реализовать generic importer заранее;
- создать вторую collection для feed inventory;
- запускать импорт синхронно через public request;
- отказаться от staging/dry-run.

## Consequences

- до trigger нет feed routes, jobs и фиктивных schemas;
- manual passports и feed inventory остаются в единой `properties`, разделённой
  `origin` и `market` predicates;
- EPIC 16 требует fixture, idempotency и safe-deactivation proofs.

## Revisit When

Получен первый XML-фид или owner явно отменил feed roadmap.
