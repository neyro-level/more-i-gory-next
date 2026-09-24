# ADR-006: Project-owned Regions Collection

Status: Accepted
Date: 2026-09-15; amended 2026-09-24 by EPIC 74

## Context

Realty Base не требует отдельную коллекцию `regions`, но этому проекту нужна
редактируемая иерархия region, locality и segment с разными status и SEO gates.
Хранение пути в нескольких registry создаст drift.

## Decision

Добавить project-owned Payload collection `regions` с полями `slug`, `title`,
`kind`, self-relation `parent`, typed `pageKey=REGION|CITY`, `verifiedAt`,
`order`, контентными полями, SEO group и `status=published|hidden|stub`;
drafts включены.

Публичный canonical вычисляется из typed `RouteIdentity`, `slug` и parent chain
через общий builder. Третье поле с полным path не хранится. `REGION` не имеет
parent, `CITY` требует parent; legacy `segment` не получает новый canonical.
Public Gateway выдаёт только разрешённые статусы; published entity требует
`verifiedAt`, stub использует отдельный presentation contract.

Это осознанное owner-решение за пределами минимального списка Realty Base, а не
активация расширенного profile.

## Alternatives Considered

- code-owned JSON registry;
- моделировать регионы обычными pages;
- хранить полный URL отдельным полем;
- отдельные collections для region, locality и segment.

## Ownership (TASK 29.2)

```text
Payload = domain/content owner
Code = routing/composition policy
SEO registry = explicit index policy
```

- Payload `regions` владеет title, lead, investment thesis, risk summary, media, blocks, status, kind, parent, pageKey, verifiedAt, order и slug.
- Код владеет вычислением path из RouteIdentity+hierarchy, composition внутренних ссылок и stub presentation. Полный path в CMS не хранится.
- SEO registry владеет явным index/sitemap/canonical/priority/contentGate. Это не дубль доменного текста.

Перенос живого UI на Payload — TASK 29.3; это решение фиксирует владельцев, а не текущий runtime drift.

## Consequences

- одна иерархическая collection владеет региональными route inputs;
- manual `properties` passport обязан ссылаться на region и может отдельно
  ссылаться на city/area; feed ownership и existing complex relation не меняются;
- cycle, sibling slug uniqueness и status predicates требуют validation;
- URL всё равно сначала утверждается в Product Structure.

## Revisit When

Только если фактическая модель перестанет быть иерархической или collection
создаст измеренный bottleneck.
