# Region duplicated data inventory

**Дата:** 2026-09-19  
**Задача:** TASK 29.1  
**Статус:** Evidence only

Сравнение четырёх источников. Это не ownership decision (TASK 29.2).

## Sources

| Source | Path | Role today |
|---|---|---|
| Payload regions | `src/project/collections/regions.ts` + seed `scripts/seed-regions.mjs` | CMS schema and seedable documents: title, slug, kind, parent, order, lead, investmentThesis, riskSummary, heroMedia, blocks, seo, status |
| Code route plan | `src/content/regions/region-route-plan.ts` | Live public routing and page body: path from slug+parent, hub cards, related links, invalidation path lookup |
| Code DTOs | `src/content/regions/region-dtos.ts` | Transfer DTO mapped only from the route plan, not from Payload |
| SEO registry | `src/seo/registry.json` | Explicit index/sitemap/title/h1/canonical/contentGate; metadata via `getStaticMetadata(pageId)` |

Public region pages (`src/app/(site)/investicionnaya-nedvizhimost/[...path]/page.tsx`) read **route plan + SEO registry + media assets**. They do not read Payload `regions`.

## Shared keys (10 routes)

| key | pageId | path | Payload seed | route plan | DTO | SEO registry |
|---|---|---|---|---|---|---|
| krym | PAGE-007 | `/investicionnaya-nedvizhimost/krym/` | yes | yes | yes | yes |
| yalta | PAGE-008 | `/investicionnaya-nedvizhimost/krym/yalta/` | yes | yes | yes | yes |
| sevastopol | PAGE-009 | `/investicionnaya-nedvizhimost/krym/sevastopol/` | yes | yes | yes | yes |
| evpatoriya | PAGE-010 | `/investicionnaya-nedvizhimost/krym/evpatoriya/` | yes | yes | yes | yes |
| alushta | PAGE-011 | `/investicionnaya-nedvizhimost/krym/alushta/` | yes | yes | yes | yes |
| krym-novostroyki | PAGE-024 | `/investicionnaya-nedvizhimost/krym/novostroyki/` | yes | yes | yes | yes |
| krym-apartamenty | PAGE-025 | `/investicionnaya-nedvizhimost/krym/apartamenty/` | yes | yes | yes | yes |
| arkhyz | PAGE-012 | `/investicionnaya-nedvizhimost/arkhyz/` | yes | yes | yes | yes |
| altay | PAGE-013 | `/investicionnaya-nedvizhimost/altay/` | yes | yes | yes | yes |
| sochi | PAGE-003 | `/investicionnaya-nedvizhimost/sochi/` | yes | stub | yes | noindex, sitemap=no |

PAGE-002 (`/investicionnaya-nedvizhimost/`) is the hub page, not a `regions` document.

## Overlapping fields

| Field | Payload | route plan | DTO | SEO registry | Drift |
|---|---|---|---|---|---|
| title (short) | yes | yes | yes | different full SEO title | three copies of short title; registry has its own title/h1 |
| slug | yes | yes | yes | inside canonical | sibling uniqueness is CMS-side; path composition is code |
| kind | yes | yes | no | no | duplicated schema+code |
| parent / parentKey | yes | yes | parentPageId derived | path encodes parent | two hierarchy encodings |
| order | yes | yes | no | no | duplicated |
| lead | yes | **public body** | yes | no | duplicated; live UI uses code |
| investmentThesis | yes | **public body** | yes | no | duplicated; live UI uses code |
| riskSummary | yes | **public body** | yes | no | duplicated; live UI uses code |
| media | heroMedia relation | mediaSourceLabel | heroMediaId | no | three encodings; live UI uses code media assets |
| status | yes | yes | mapped draft/review/published | index/sitemap gates | stub Sochi is code+registry; Payload seed copies stub |
| seo.priority | seed from plan | seoPriority | no | priority | **PAGE-009: plan P1 vs registry P2** |
| seo.robots | seed always noindex-follow | no | no | index gate/noindex | seed robots not the registry gate |
| primaryQuery | no | yes | yes | yes | duplicated plan vs registry |
| path / canonical | not stored (ADR-006) | computed | copied | canonical | computed path must match registry |
| pageId | no | yes | yes | yes | join key plan↔registry |
| blocks | required CMS | synthesized at seed | no | no | CMS-only after seed |

## Runtime vs CMS

ADR-006 says Payload owns regional route **inputs** and path is computed, not stored. Current runtime still treats the hardcoded route plan as the public database. Payload is seeded from that plan and then unused on the public route.

## Not duplicated here

- PAGE-026 `/novostroyki/` is the newbuild catalog, not a region document.
- Hub PAGE-002 has no `regions` row.
