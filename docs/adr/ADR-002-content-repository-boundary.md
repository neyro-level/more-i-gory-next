# ADR-002: Content Repository Boundary

Status: Accepted
Date: 2026-09-10

## Context

Первый релиз хранит контент локально, но проект может позже получить CMS. Прямая зависимость UI от файлов/Velite создаст дорогую миграцию.

## Decision

Использовать:

```text
Page/UI
→ Content Service
→ Repository Contract
→ Adapter
→ Local content now / CMS later
```

## Alternatives Considered

- direct file imports in pages;
- direct Velite imports;
- CMS from day one.

## Rationale

Контракт сохраняет URL/UI/domain model при смене storage/editor tooling.

## Consequences

Появляется небольшой дополнительный слой кода, но снижается архитектурная связность.

## Revisit When

Только если слой объективно создаёт больше сложности, чем ценности, и это подтверждено реальной реализацией.
