# ADR-010: Analytics URL as Journal Module Namespace

Status: Accepted
Date: 2026-09-15

## Context

Публичное название раздела уже закреплено как «Аналитика» с URL
`/analitika/*`. В Realty Platform расширенный editorial module использует
collection `posts`; создание второго публичного `/journal/*` раздвоит канон.

## Decision

Активировать journal capability в EPIC 18 через collection `posts`, но
публиковать материалы только по `/analitika/<slug>/`. `/journal/*` остаётся
reserved-only и не получает routes, redirects, navigation или sitemap entries.

До EPIC 18 существует только hub `/analitika/`; article namespace зарезервирован
и не считается включённым модулем. Metadata и canonical URL принадлежат Product
Structure и Public Gateway.

## Alternatives Considered

- переименовать публичный раздел в «Журнал»;
- поддерживать `/journal/*` и `/analitika/*` одновременно;
- хранить аналитику как универсальные pages;
- включить `posts` до editorial scope.

## Consequences

- пользовательский язык и URL остаются стабильными;
- `posts` является data owner без второго публичного namespace;
- запуск статей требует EPIC 18 и индивидуального content/index gate.

## Revisit When

Owner отдельно меняет публичное позиционирование раздела и принимает URL
migration с redirect contract.
