# ADR: SEO State Engine

Status: Accepted
Date: 2026-09-24

## Context

Существование route, готовность контента, robots, canonical и sitemap нельзя
управлять независимыми флагами: это создаёт противоречивые состояния и риск
индексации пустой страницы.

## Decision

Ввести единый SEO state contract в последующем implementation-эпике. Состояние
вычисляется из PAGE registry, publication state и Content Gate и одновременно
определяет metadata, robots, canonical и sitemap eligibility.

До реализации engine действует fail-closed правило: отсутствующие business
facts или неподтверждённый контент означают `noindex` и отсутствие в sitemap.
Route/contract work при этом разрешён. Выдумывать claims для открытия Gate
запрещено.

## Consequences

- один resolver становится владельцем SEO-решения;
- HTTP adapter/cache не меняют бизнес-решение resolver;
- index activation требует отдельного доказуемого перехода состояния.

## Revisit When

Появится новый publication lifecycle, который текущая state machine не выражает.
