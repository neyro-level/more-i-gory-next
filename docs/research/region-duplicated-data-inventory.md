# Region duplicated data inventory

**Дата:** 2026-09-19  
**Задача:** TASK 29.1  
**Статус:** Evidence only

Сравнение четырёх источников. Это не ownership decision (TASK 29.2).

## Sources

| Source | Path | Role today |
|---|---|---|
| Payload regions | `src/project/collections/regions.ts` + seed `scripts/seed-regions.mjs` | CMS schema and seedable documents: title, slug, kind, parent, order, lead, investmentThesis, riskSummary, heroMedia, blocks, seo, status |
| Code route plan | `src/content/regions/region-route-plan.ts` | Routing/composition: key, pageId, slug, parentKey, computed path, related-link graph |
| CMS seed content | `src/content/regions/region-seed-content.ts` | Bootstrap copy for `regions:seed` and DTO package; not the live UI source |
| Code DTOs | `src/content/regions/region-dtos.ts` | Transfer DTO mapped from route plan + seed content, not from live Payload |
| SEO registry | `src/seo/registry.json` | Explicit index/sitemap/title/h1/canonical/contentGate; metadata via `getStaticMetadata(pageId)` |

TASK 29.3: live hub/home/catch-all pages read Payload through Public Gateway (`listPublicHubRegions` / `getPublicRegionByPath`). Route plan remains routing/composition. Seed content is CMS bootstrap, not the public body.

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
| title (short) | yes | no | yes (seed) | different full SEO title | live UI uses Payload; seed/DTO still duplicate until seed freeze |
| slug | yes | yes | yes | inside canonical | sibling uniqueness is CMS-side; path composition is code |
| kind | yes | no | no | no | live UI uses Payload |
| parent / parentKey | yes | yes (until 29.4) | parentPageId derived | path encodes parent | two hierarchy encodings remain for routing |
| order | yes | no | no | no | Payload-owned |
| lead | yes | no | yes (seed) | no | live UI uses Payload |
| investmentThesis | yes | no | yes (seed) | no | live UI uses Payload |
| riskSummary | yes | no | yes (seed) | no | live UI uses Payload |
| media | heroMedia relation | no | heroMediaId from seed | no | live UI uses Payload media |
| status | yes | no | mapped draft/review/published | index/sitemap gates | live UI uses Payload; Sochi stub page remains a dedicated route |
| seo.priority | seed from plan | seoPriority | no | priority | **PAGE-009: plan P1 vs registry P2** |
| seo.robots | seed always noindex-follow | no | no | index gate/noindex | seed robots not the registry gate |
| primaryQuery | no | yes | yes | yes | duplicated plan vs registry |
| path / canonical | not stored (ADR-006) | computed | copied | canonical | computed path must match registry |
| pageId | no | yes | yes | yes | join key plan↔registry |
| blocks | required CMS | synthesized at seed | no | no | CMS-only after seed |

## Runtime vs CMS

ADR-006 says Payload owns regional content; path is computed, not stored. After TASK 29.3 live UI reads Public Gateway. Hardcoded route plan still owns path composition until TASK 29.4. Seed content remains a bootstrap copy, not a second live database.

## Not duplicated here

- PAGE-026 `/novostroyki/` is the newbuild catalog, not a region document.
- Hub PAGE-002 has no `regions` row.
