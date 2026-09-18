# ADR-001: Static Next.js Export as Public Site Runtime Model

Status: Superseded
Superseded by: ADR-004
History: retained; do not delete this file
Date: 2026-09-10

## Context

Первый релиз содержит ограниченный курируемый каталог, заранее известные SEO-страницы и контент, который может собираться заранее. Нет требования auth, realtime inventory, request-time personalization или server-side workflow.

## Decision

Использовать Next.js App Router в static export mode. Production раздаёт готовый artifact через Nginx. Заявки идут в отдельный AMS Leads API.

## Alternatives Considered

- full Next.js server runtime;
- Payload + PostgreSQL;
- WordPress;
- static generator other than Next.js.

## Rationale

- SEO content in HTML;
- минимальный production runtime;
- rollback;
- меньше operational complexity;
- соответствует размеру catalog;
- позволяет позже заменить source content через Adapter.

## Consequences

Плюсы:
- простая эксплуатация;
- быстрый rollback;
- низкий runtime risk.

Ограничения:
- no request-time dynamic features;
- publication requires rebuild;
- realtime feeds require architecture class change.

## Revisit When

- hundreds of frequently changing projects/lots;
- auth;
- user cabinet;
- server-side filters;
- workflow/roles;
- automated feeds;
- background jobs.

## Supersession Note

Условия пересмотра наступили: приняты Payload Admin, PostgreSQL, server-side
leads, jobs и будущие feeds. ADR-004 сохраняет историю static preview, но задаёт
единственный целевой production runtime.
