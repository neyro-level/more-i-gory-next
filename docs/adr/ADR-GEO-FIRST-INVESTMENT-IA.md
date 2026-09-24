# ADR: GEO-first Investment IA

Status: Accepted
Date: 2026-09-24

## Context

Прежнее дерево помещало Крым под федеральный хаб и подразумевало одинаковую
глубину для нескольких регионов. Это размывало owner регионального интента и
создавало риск шаблонных city/category страниц без фактического покрытия.

## Decision

Зафиксировать единственных owners:

```text
/                               brand/trust
/investicionnaya-nedvizhimost/ federal market comparison
/krym/                          Crimea R1 market
/krym/{city}/                   local Crimea market from registry
```

Крым — первичный SEO-рынок R1. Будущий регион появляется только через registry,
PAGE-ID, Content Gate и отдельное решение об индексации. Архыз, Алтай и Сочи не
обязаны повторять глубину Крыма. City×category URL не генерируются автоматически.

## Consequences

- старые Crimea URL остаются migration candidates до EPIC 70;
- отсутствие business facts блокирует index activation, но не route contracts;
- один intent не может иметь двух активных page owners.

## Revisit When

Свежие SERP evidence и реальное продуктовое покрытие доказывают отдельный intent,
который нельзя корректно обслужить существующим owner.
