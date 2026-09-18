# ADR index — «Море и Горы»

**Дата проверки:** 2026-09-18 (TASK 19.6)  
**Правило:** superseded static ADR не удаляются; статус указывает на действующий runtime ADR.

| ID | Тема | Status | Notes |
|---|---|---|---|
| [ADR-001](ADR-001-static-next-export.md) | Static Next.js export as public runtime | **Superseded** by [ADR-004](ADR-004-realty-platform-runtime.md) | История static preview сохранена |
| [ADR-002](ADR-002-content-repository-boundary.md) | Content repository boundary (static-era wording) | **Superseded** by [ADR-004](ADR-004-realty-platform-runtime.md) | Принцип изоляции UI от persistence жив; public read всё ещё ContentService + local adapters |
| [ADR-003](ADR-003-canonical-seo-url-model.md) | Canonical SEO URL model | Accepted | Действует |
| [ADR-004](ADR-004-realty-platform-runtime.md) | Realty Platform Node runtime | Accepted | Текущий runtime ADR: Next standalone + Payload + PostgreSQL + S3 |
| [ADR-005](ADR-005-crimea-core-ia.md) | Crimea-core IA / Sochi stub | Accepted | Действует |
| [ADR-006](ADR-006-regions-collection.md) | Project-owned `regions` | Accepted | Действует |
| [ADR-007](ADR-007-link-runtime-policy.md) | Retire static route stripping / StaticLink | Accepted | Текущий navigation ADR, не история |
| [ADR-008](ADR-008-image-pipeline.md) | next/image, sharp, S3 | Accepted | Действует |
| [ADR-009](ADR-009-deferred-ingest.md) | Deferred XML ingest | Accepted | EPIC 27 сужает до fixture+freeze; ADR не удалять |
| [ADR-010](ADR-010-analytics-journal-module.md) | Analytics URL as journal namespace | Accepted | Действует |

Static-export contract задавал только ADR-001 (и частично формулировки ADR-002). Оба помечены superseded ADR-004. Файлы на месте.
