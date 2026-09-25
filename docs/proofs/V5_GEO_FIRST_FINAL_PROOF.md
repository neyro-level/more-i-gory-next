# GEO-first V5 — final candidate proof

**Plan:** `AMS-MORE-I-GORY-GEO-FIRST-INVESTMENT-REMEDIATION` v1 APPROVED  
**Closeout epic:** 86  
**Reconciled:** 2026-09-25  
**Production:** NOT AUTHORIZED / NOT RUN

## Exact candidate

- SourceCraft repository: `integrator-p/more-i-gory-next`;
- merged runtime candidate after EPIC 85:
  `7d373c3e621d72040aef3480f9b5564b926acefc`;
- EPIC 86 changes documentation/evidence only; its exact PR head and final merge
  SHA are recorded in the Task Manager delivery ledger and SourceCraft gate,
  because a Git commit cannot contain its own SHA;
- EPIC 68–85 are present in ancestry of the runtime candidate through PR
  111–128. Merge order is visible in `git log origin/main`.

## Verification result

| Evidence | Result |
|---|---|
| `pnpm verify` on EPIC 85 candidate | PASS: typecheck, lint (0 errors), contract tests, content/SEO validation, production build and `next start` crawl |
| `pnpm verify:schema` | PASS: Payload type/schema generation, migration diff and RouteIdentity grammar 6/6 |
| SourceCraft exact-head gate | PASS: RISKY run 198 on `a7d002de6ca45495abcfcc2762b262ecf90836af`; PR 128 merged as runtime candidate `7d373c3e…` |
| UI drift | PASS: P0/P1 findings `0` |
| Bundle budget | PASS: maximum initial route JavaScript 206 KB gzip ≤ 210 KB; largest chunk 70 KB gzip |

EPIC 86 repeats `pnpm verify` and `pnpm verify:schema` on the documentation-only
candidate before its exact-head SourceCraft gate. That final evidence belongs to
the immutable delivery ledger rather than this self-referential file.

## Route matrix

| Surface | Runtime owner | Effective candidate state |
|---|---|---|
| `/` | static public route + SEO registry | available; noindex while Content Gate is closed |
| `/investicionnaya-nedvizhimost/` | federal comparison hub | available; noindex while market facts are incomplete |
| `/krym/` | shared GEO route/CMS region | target R1 route exists; index activation gated |
| `/krym/{yalta,sevastopol,evpatoriya,alushta}/` | shared city contract | target routes exist; factual gates remain closed |
| `/arkhyz/`, `/altay/` | shared future-region mechanism | prepared routes; hidden/noindex until publication |
| `/sochi/` | shared GEO mechanism | honest 200 noindex stub; no child SEO tree |
| `/obekty/` | curated manual passport catalog | query/filter states noindex and canonical to root |
| `/obekty/{project}/` | global project entity | published passports only; canonical contains no GEO segment |
| `/novostroyki/**` | feed-backed newbuild inventory | separate inventory role; not a replacement for `/obekty/` |
| `/analitika/**` | analytics/article lifecycle | published/reviewed content only; draft/review excluded from sitemap |
| unknown GEO or unsupported city×category | App Router/RouteIdentity fail-closed | real 404 |
| preview fixtures | explicit technical routes | staging noindex; production 404 |

## SEO and crawl invariants

- metadata, robots and sitemap use one effective SEO state;
- every sitemap URL is crawled and must return 200, self-canonical, index/follow
  and exactly one H1;
- noindex, draft/review and preview URLs cannot enter sitemap;
- Breadcrumb JSON-LD is checked against the visible breadcrumb hierarchy;
- query-state `/obekty/?city=yalta` is noindex and canonical to `/obekty/`;
- operational Public Gateway failure is not materialized as cacheable 404;
- public navigation excludes `PREPARED_OFF` GEO and unsupported city×category
  routes;
- analytics dimensions are allowlisted slug-safe identifiers without PII.

Observed production-like local crawl:

```text
runtime = next start
requiredRoutes = 17
manifestRoutes = 13
sitemapUrls = 0
sitemapMismatchCount = 0
status = PASS
```

`sitemapUrls = 0` is the correct fail-closed result for the seeded candidate:
the factual Content Gates are not satisfied, so no unverified commercial route
is advertised to search engines.

## Redirect result

- migration manifest coverage: 16/16 patterns;
- actions: 6 `KEEP`, 7 `REDIRECT_301`, 3 `NOINDEX_RETAIN`;
- redirect chains: `0`;
- duplicate current canonicals or redirect targets: `0` within route classes;
- no bulk redirect to `/` or `/obekty/`;
- a redirect materializes only after the exact target is published or available
  in the editorial preview contour;
- legacy PAGE-024/PAGE-025 keep their explicit noindex behavior and do not gain
  an invented replacement.

## Reconciliation result

The following owners agree on the GEO-first target model:

- `docs/02_PRODUCT_STRUCTURE.md` — intent and URL ownership;
- `docs/03_ARCHITECTURE.md` — Payload/Public Gateway/runtime boundaries;
- `src/seo/registry.json` and SeoState resolver — metadata/index/sitemap state;
- RouteIdentity builder/parser — canonical URL grammar;
- `docs/migration/V5_URL_MANIFEST.json` — legacy action ownership;
- Payload regions/project relations and public DTOs — factual GEO context;
- public navigation/breadcrumb graph — crawlable links without hidden routes;
- automated tests and production-like HTTP crawl — executable proof.

No superseded IA is presented as current in active project documents. Files in
`docs/research/legacy/` remain historical evidence only.

## Open owner gates

| Gate | State | Required owner input |
|---|---|---|
| Factual content | BLOCKED EXTERNALLY | verified facts, sources, review and launch cohort |
| Index activation | NOT AUTHORIZED | Content Gate PASS followed by a repeated sitemap/crawl proof |
| Recovery readiness | NOT PROVEN | release-only ephemeral restore rehearsal |
| Production | NOT AUTHORIZED | separate explicit `Выпускаем production` command and release runbook |

## Final verdict

Technical GEO-first V5 candidate: **PASS**.  
Open P0/P1 implementation findings: **0**.  
Production-ready claim: **NO** — factual, recovery and explicit owner release
gates intentionally remain open.
