# ADR-005: Crimea-core IA and Sochi Stub

Status: Accepted
Date: 2026-09-15

## Context

Production не публиковался, поэтому URL-схему можно один раз исправить без
redirect debt. Достаточная глубина подтверждена для Крыма; контент и inventory
Сочи пока не проходят gate.

## Decision

Крым становится SEO-ядром: hub, Ялта, Севастополь, Евпатория, Алушта,
`krym/novostroyki` и `krym/apartamenty`. Архыз и Алтай остаются P2.

Сочи сохраняет только PAGE-003 со `status=stub`: HTTP 200, `noindex`, вне sitemap
и navigation, с честным сообщением «регион в проработке» и CTA на подбор.
PAGE-004, PAGE-005 и PAGE-006 удаляются и никогда не переиспользуются. Новые
сегменты Крыма получают PAGE-024 и PAGE-025.

## Alternatives Considered

- оставить одинаковую глубину всех регионов;
- удалить маршрут Сочи полностью;
- перенести старые Sochi PAGE-ID на крымские страницы;
- автоматически создавать комбинации «локация × тип».

## Consequences

- `docs/02_PRODUCT_STRUCTURE.md` является URL и metadata source of truth;
- thin pages и автоматические комбинации запрещены, expansion проходит URL gate;
- после EPIC 14 изменение опубликованного URL требует redirect.

## Revisit When

Сочи получит самостоятельный подтверждённый контент и owner отдельно разрешит
вывести регион из `stub`.
