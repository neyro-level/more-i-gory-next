# ADR index — «Море и Горы»

**Дата проверки:** 2026-09-24 (EPIC 69)
**Правило:** superseded static ADR не удаляются; статус указывает на действующий runtime ADR.

| ID | Тема | Status | Notes |
|---|---|---|---|
| [ADR-001](ADR-001-static-next-export.md) | Static Next.js export as public runtime | **Superseded** by [ADR-004](ADR-004-realty-platform-runtime.md) | История static preview сохранена |
| [ADR-002](ADR-002-content-repository-boundary.md) | Content repository boundary (static-era wording) | **Superseded** by [ADR-004](ADR-004-realty-platform-runtime.md) | Принцип изоляции UI от persistence жив; действующий public read — Public Gateway + DTO |
| [ADR-003](ADR-003-canonical-seo-url-model.md) | Canonical SEO URL model | Partially superseded | GEO-first заменил региональный pattern; глобальный project canonical действует |
| [ADR-004](ADR-004-realty-platform-runtime.md) | Realty Platform Node runtime | Accepted | Текущий runtime ADR: Next standalone + Payload + PostgreSQL + S3 |
| [ADR-005](ADR-005-crimea-core-ia.md) | Crimea-core IA / Sochi stub | Accepted | Действует |
| [ADR-006](ADR-006-regions-collection.md) | Project-owned `regions` | Accepted | Действует |
| [ADR-007](ADR-007-link-runtime-policy.md) | Retire static route stripping / StaticLink | Accepted | Текущий navigation ADR, не история |
| [ADR-008](ADR-008-image-pipeline.md) | next/image, sharp, S3 | Accepted | Действует |
| [ADR-009](ADR-009-deferred-ingest.md) | Deferred XML ingest | Accepted | EPIC 26: fixture+freeze; ADR не удалять |
| [ADR-010](ADR-010-analytics-journal-module.md) | Analytics URL as journal namespace | Accepted | Действует |
| [ADR-011](ADR-011-lead-delivery-duplicates.md) | Lead delivery duplicates | Accepted | Recipient dedup is not guaranteed; operator uses deliveryId |
| [ADR-012](ADR-012-no-separate-staging.md) | Temporary no-separate-staging exception | Accepted / time-boxed | Preview is a production candidate only; expires at domain cutover |
| [ADR-013](ADR-013-http-lifecycle-and-read-failures.md) | HTTP lifecycle and Public Gateway failures | Accepted | `gone` → real 404, permanent route redirect → 308, DB failure → operational error |
| [ADR GEO-first](ADR-GEO-FIRST-INVESTMENT-IA.md) | GEO-first IA and intent ownership | Accepted | Крым R1, registry-driven regions, no auto city×category |
| [ADR global entity](ADR-GLOBAL-INVESTMENT-ENTITY-URL.md) | Global investment project URL | Accepted | `/obekty/{project}/` не зависит от geo |
| [ADR SEO state](ADR-SEO-STATE-ENGINE.md) | Unified SEO state contract | Accepted | Fail-closed index/sitemap activation |
| [ADR newbuild role](ADR-NEWBUILD-INVENTORY-ROLE.md) | Newbuild inventory vs investment catalog | Accepted | `/novostroyki/` не заменяет `/obekty/` |

Static-export contract задавал только ADR-001 (и частично формулировки ADR-002). Оба помечены superseded ADR-004. Файлы на месте.
