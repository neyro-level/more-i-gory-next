# ADR: Newbuild Inventory Role

Status: Accepted
Date: 2026-09-24

## Context

`/novostroyki/` и `/obekty/` могут выглядеть как конкурирующие каталоги, а
PAGE-024 создавал третий owner для близкого интента.

## Decision

- `/novostroyki/` — опубликованный operational inventory ЖК и его структура;
- `/obekty/` — редакционно отобранные инвестиционные сущности;
- `/obekty/{project}/` — единственный инвестиционный паспорт проекта;
- `/novostroyki/` не заменяет `/obekty/`;
- PAGE-024 не является обязательным standalone SEO owner и остаётся migration
  candidate до evidence-driven решения EPIC 70.

Связь newbuild с инвестиционным проектом явная и не создаёт второй canonical.

## Consequences

Feed completeness не означает инвестиционную рекомендацию. Индексация каждой
поверхности определяется её собственным publication/content contract.

## Revisit When

Продуктовая модель объединит inventory и инвестиционный отбор в одну сущность с
одним пользовательским интентом.
