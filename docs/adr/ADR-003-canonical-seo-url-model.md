# ADR-003: Canonical SEO URL Model

Status: Partially superseded by ADR-GEO-FIRST-INVESTMENT-IA
Date: 2026-09-10

## Context

Live-сайт имеет пересекающиеся investment pages, WooCommerce product URLs и слабую региональную taxonomy. Новый проект строится вокруг search intent и investment selector model.

## Decision

Использовать каноническую модель:

```text
/investicionnaya-nedvizhimost/<region>/<optional-segment-or-area>/
/obekty/<project-slug>/
/analitika/<article-slug>/
```

Один Project = один индексируемый URL.

Lots, filters, sort states не индексируются.

## Alternatives Considered

- keep legacy WordPress URLs;
- put projects under region path;
- create indexable filters;
- create a page for every city/keyword.

## Rationale

- stable project URLs;
- clear intent hierarchy;
- controlled crawl/index footprint;
- avoids thin pages;
- supports region growth without moving project routes.

## Consequences

Региональный pattern superseded GEO-first contract; правило одного стабильного
`/obekty/<project-slug>/` остаётся действующим. Expansion requires explicit
Product Structure update and content/data gate.

## Revisit When

SERP evidence proves a materially different intent architecture or the product changes from curated selector to mass marketplace.
