# CURRENT STATE V5 — GEO-first baseline

**Plan:** `AMS-MORE-I-GORY-GEO-FIRST-INVESTMENT-REMEDIATION` v1 APPROVED  
**Epic:** 68 — Current state freeze / baseline intake  
**Observed main:** `b253bf50b40d76b75fdfe1aca235c55763db97a2`  
**Date:** 2026-09-24  
**Production mutation:** none

## Runtime baseline

- Next.js `16.3.6`, React `19.3.0`, Payload group `3.90.1`.
- Payload is the only CMS/auth/schema/migrations owner; Prisma is absent.
- Public reads use `src/core/data-access/public/**` and serializable DTOs.
- Runtime topology remains Next standalone + Payload in one Node process behind
  Nginx; preview host is `more-previu.tw1.ru`.
- Production, DNS, domain cutover and real traffic are outside this program.

## Current public route surfaces

Static pages exist for `/`, `/investicionnaya-nedvizhimost/`, `/analitika/`,
`/metodika/`, `/podbor/`, `/o-kompanii/`, `/kontakty/`, `/privacy/` and
`/consent/`.

Dynamic or catalog surfaces exist for:

- `/investicionnaya-nedvizhimost/**` through the current catch-all regional route;
- `/obekty/` and `/obekty/<slug>/`;
- `/novostroyki/` and `/novostroyki/<slug>/`;
- `/zastroyshchik/<slug>/`;
- `/analitika/<slug>/`.

Preview fixture routes remain explicit technical routes and must not enter
production sitemap or navigation.

## Current SEO/indexability behavior

`src/seo/registry.json` contains 23 entries:

- 18 use `index=gate`, `sitemap=gate`;
- 2 use `index=trust_gate`, `sitemap=gate`;
- 3 use `index=noindex`, `sitemap=no`.

Current metadata maps only literal `index=yes` to `index,follow`; `gate` and
`trust_gate` therefore produce `noindex,follow`. Static sitemap entries include
only literal `sitemap=yes && index=yes`, while DB-backed published regions,
projects, complexes, developers and supported CMS pages are merged by separate
rules. This split is the factual baseline for SEO-R01/R02/R03/R04.

## Current target drift

- Current canonical geo URLs remain nested under
  `/investicionnaya-nedvizhimost/**`; the approved target is `/krym/**` and
  root future-region hubs.
- PAGE-024/PAGE-025 remain registry owners although the approved plan requires
  explicit migration decisions instead of automatic survival.
- `/novostroyki/` remains an active feed/newbuild capability and has not yet
  been reconciled with the curated `/obekty/` SEO ownership model.
- Canonical construction is distributed; typed `RouteIdentity` grammar does not
  yet exist.
- `publicReadWithFallback` currently logs an operational failure and returns a
  fallback value, so callers can still collapse an outage into empty/null.

## Sitemap sources

The dynamic sitemap merges:

1. literal published registry entries;
2. supported published CMS pages;
3. published manual investment passports;
4. published residential complexes and developers;
5. published regions;
6. articles, currently represented by an empty sitemap source.

## Content/business-fact preflight

Status for Crimea, Yalta, Sevastopol, Evpatoriya and Alushta: `MISSING`.

Evidence: `docs/CONTENT_FACT_PACKET.md` still marks the packet deferred and the
geo rows have no supplied market thesis, source set, project coverage or owner
approval. Therefore:

- no factual claims may be invented;
- technical URL/DTO/resolver/noindex work may proceed;
- index activation and source-backed commercial copy receive task-local
  external blockers until evidence exists;
- absence of facts does not block independent technical waves.

## Known audit defects entering v1

- SEO-R01: registry gate and runtime use different effective rules;
- SEO-R02: DB-backed region sitemap eligibility can diverge from registry robots;
- SEO-R03: CMS SEO fields require one runtime ownership contract;
- SEO-R04: article lifecycle is not represented in sitemap output;
- SEO-R05/R06: real gone/redirect status must be verified by HTTP;
- SEO-R07: arbitrary CMS paths require a supported-path whitelist;
- SEO-R08: DB failure must not be cached as business absence.

## EPIC 68 exit evidence

- exact main recorded;
- package/runtime versions matched the approved plan;
- routes, registry, sitemap sources and runtime contour inventoried;
- Plan №4 remains completed and historical;
- current plan and inventory are canonical and linked;
- business-fact preflight is explicit;
- no route, schema, runtime or production behavior changed.
