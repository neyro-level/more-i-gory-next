# Content launch matrix

**Status:** TASK 52.1 evidence
**Plan:** `more-i-gory-production-readiness-2026-09` v2
**Snapshot:** `c824e9fa02ecfe370c859a851e3c0e0cedd48667`
**Date:** 2026-09-20

This matrix assigns one terminal launch state to every current public route and
fact-bearing content entity. It does not promote research to Source of Truth and
does not authorize indexing or production. A later verified owner response to
`CONTENT_FACT_PACKET.md` may move only the affected row to `PASS`.

Allowed terminal states:

- `PASS` — the route/entity can enter its declared launch behavior using current evidence;
- `UNPUBLISHED_NO_FACT` — required facts are absent, so the row stays draft,
  gated or unavailable;
- `DEFERRED_OUT_OF_RELEASE` — intentionally excluded from this release.

## Owner decision: editorial preview is visible

Решение владельца 2026-09-20 разделяет preview visibility и release state.
Каждая запланированная route/entity открывается в local/staging как честный
`200 + noindex` scaffold и доступна из меню `Все страницы`, даже если terminal
state остаётся `UNPUBLISHED_NO_FACT` или `DEFERRED_OUT_OF_RELEASE`. В production
такие строки сохраняют прежний fail-closed контракт. Технические fixture routes
для project/complex/developer возвращают `404` вне editorial preview.

## Minimum non-waivable cohort

| PAGE | Route | Evidence and fact status | Terminal launch state | Current behavior / missing gate |
|---|---|---|---|---|
| PAGE-001 | `/` | Positioning is `FACT_PASS`; team, methodology and four project passports are absent | `UNPUBLISHED_NO_FACT` | Keep `gate`, no sitemap/index activation |
| PAGE-002 | `/investicionnaya-nedvizhimost/` | Route intent is sourced; comparable regional facts and real projects are absent | `UNPUBLISHED_NO_FACT` | Keep `gate` |
| PAGE-018 | `/metodika/` | Existing page is an explicit scaffold; approved version, date, stop factors and reviewer are absent | `UNPUBLISHED_NO_FACT` | Keep `gate`; do not present scaffold as approved method |
| PAGE-019 | `/podbor/` | Process shell exists; responsible person, SLA, fee model and disclosure are absent | `UNPUBLISHED_NO_FACT` | Keep `gate`; do not promise response time, price or live delivery |
| PAGE-020 | `/o-kompanii/` | Legal founder/director identity is sourced; team biographies, experience and strong claims are absent | `UNPUBLISHED_NO_FACT` | Keep `trust_gate`; only existing restrained positioning is allowed |
| PAGE-021 | `/kontakty/` | Contact values exist in `LEGAL_DETAILS.md`; channel availability and address/hours verification are absent | `UNPUBLISHED_NO_FACT` | Keep `trust_gate` until operational contact proof |
| PAGE-022 | `/privacy/` | Operator, legal details and version `privacy-2026-09-17` are sourced | `PASS` | Launch as `noindex`, outside sitemap; recheck against final form/channels |
| PAGE-023 | `/consent/` | Operator and version `pdn-consent-2026-09-17` are sourced | `PASS` | Launch as `noindex`, outside sitemap; consent link remains mandatory |

Current minimum cohort result: **2/8 `PASS`**. EPIC 52 and the release
candidate cannot close until the other six rows receive sufficient evidence;
their absence does not block unrelated technical work.

## Other route rows

| PAGE | Route | Source/fact status | Terminal launch state | Decision |
|---|---|---|---|---|
| PAGE-003 | `/investicionnaya-nedvizhimost/sochi/` | Product Structure fixes a stub; no release facts | `DEFERRED_OUT_OF_RELEASE` | Preview `200 + noindex`; production release deferred |
| PAGE-007 | `/investicionnaya-nedvizhimost/krym/` | Hidden seed; no three sourced cities or four passports | `UNPUBLISHED_NO_FACT` | Preview `200 + noindex`; production/index gated |
| PAGE-008 | `/investicionnaya-nedvizhimost/krym/yalta/` | Hidden seed; no passport or local analysis | `UNPUBLISHED_NO_FACT` | Preview `200 + noindex`; production/index gated |
| PAGE-009 | `/investicionnaya-nedvizhimost/krym/sevastopol/` | Hidden seed; no passport, coverage proof or demand model | `UNPUBLISHED_NO_FACT` | Preview `200 + noindex`; production/index gated |
| PAGE-010 | `/investicionnaya-nedvizhimost/krym/evpatoriya/` | Hidden seed; no passport or unique sourced facts | `UNPUBLISHED_NO_FACT` | Preview `200 + noindex`; production/index gated |
| PAGE-011 | `/investicionnaya-nedvizhimost/krym/alushta/` | Hidden seed; no passport or unique sourced facts | `UNPUBLISHED_NO_FACT` | Preview `200 + noindex`; production/index gated |
| PAGE-012 | `/investicionnaya-nedvizhimost/arkhyz/` | Hidden seed; no sourced project/operator/economics | `UNPUBLISHED_NO_FACT` | Preview `200 + noindex`; production/index gated |
| PAGE-013 | `/investicionnaya-nedvizhimost/altay/` | Hidden seed; no sourced projects or legal/economic model | `UNPUBLISHED_NO_FACT` | Preview `200 + noindex`; production/index gated |
| PAGE-024 | `/investicionnaya-nedvizhimost/krym/novostroyki/` | Hidden segment; project documents and comparison facts absent | `UNPUBLISHED_NO_FACT` | Preview `200 + noindex`; production/index gated |
| PAGE-025 | `/investicionnaya-nedvizhimost/krym/apartamenty/` | Hidden segment; rights, contracts, costs and operators absent | `UNPUBLISHED_NO_FACT` | Preview `200 + noindex`; production/index gated |
| PAGE-026 | `/novostroyki/` | The route contract is proven, but there are no published complexes or a non-empty factual catalog | `UNPUBLISHED_NO_FACT` | Keep the runtime shell fail-closed; do not treat or index the empty catalog as content-ready |
| PAGE-014 | `/obekty/` | No eight verified passports | `UNPUBLISHED_NO_FACT` | Keep `gate`; no invented showcase/filter claims |
| PAGE-015 | `/obekty/<project-slug>/` | No project has two sources, review and current `verifiedAt` | `UNPUBLISHED_NO_FACT` | Preview-only technical exemplar; real slug remains `published`-only |
| PAGE-016 | `/analitika/` | Five drafts exist, none has source IDs; four editorial PASS items absent | `UNPUBLISHED_NO_FACT` | Keep `gate`; do not index an empty/thin rubric |
| PAGE-017 | `/analitika/<article-slug>/` | All current articles are draft and unsourced | `UNPUBLISHED_NO_FACT` | Five seed drafts open in preview; no index/sitemap |

## Region entity rows

| Entity | Current source state | Terminal launch state | Required evidence to change state |
|---|---|---|---|
| `region-krym` | seed `hidden` | `UNPUBLISHED_NO_FACT` | Regional sources plus eligible child locations and passports |
| `region-yalta` | seed `hidden` | `UNPUBLISHED_NO_FACT` | Local analysis and at least one verified passport |
| `region-sevastopol` | seed `hidden` | `UNPUBLISHED_NO_FACT` | Coverage proof, demand model and at least one passport |
| `region-evpatoriya` | seed `hidden` | `UNPUBLISHED_NO_FACT` | Unique local facts and at least one passport |
| `region-alushta` | seed `hidden` | `UNPUBLISHED_NO_FACT` | Unique local facts and at least one passport |
| `region-krym-novostroyki` | seed `hidden` | `UNPUBLISHED_NO_FACT` | Verified projects, documents, dates and ownership model |
| `region-krym-apartamenty` | seed `hidden` | `UNPUBLISHED_NO_FACT` | Verified rights, contracts, operating costs and management |
| `region-arkhyz` | seed `hidden` | `UNPUBLISHED_NO_FACT` | Projects, operator, seasonality and exit evidence |
| `region-altay` | seed `hidden` | `UNPUBLISHED_NO_FACT` | Projects, rights, infrastructure and exit evidence |
| `region-sochi` | seed `stub` | `DEFERRED_OUT_OF_RELEASE` | Separate owner decision and a new content/template gate |

## Article entity rows

All five rows have `status: draft` and `sourceIds: []`.

| Entity / route | Terminal launch state | Missing evidence |
|---|---|---|
| `article-sochi-ili-krym` — `/analitika/sochi-ili-krym/` | `UNPUBLISHED_NO_FACT` | Comparable regional sources and editorial review |
| `article-kak-schitat-chistuyu-dohodnost` — `/analitika/kak-schitat-chistuyu-dohodnost/` | `UNPUBLISHED_NO_FACT` | Calculation sources, assumptions and qualified review |
| `article-riski-kurortnyh-apartamentov` — `/analitika/riski-kurortnyh-apartamentov/` | `UNPUBLISHED_NO_FACT` | Legal/operational sources and editorial review |
| `article-kak-proverit-operatora` — `/analitika/kak-proverit-operatora/` | `UNPUBLISHED_NO_FACT` | Operator criteria sources and editorial review |
| `article-likvidnost-i-vyhod` — `/analitika/likvidnost-i-vyhod/` | `UNPUBLISHED_NO_FACT` | Market/liquidity sources, assumptions and editorial review |

## Remaining fact-bearing entities

| Entity class | Source/fact status | Terminal launch state | Enforcement |
|---|---|---|---|
| Project passports | No confirmed project rows, two-source theses or media rights | `UNPUBLISHED_NO_FACT` | Public Gateway exposes only `published`; no invented cards |
| Residential complexes / developers / properties | Target database has no migrated published business records | `UNPUBLISHED_NO_FACT` | Empty public inventory is preserved |
| Team members beyond sourced founder/director identity | Biography, experience, photo rights and permitted wording absent | `UNPUBLISHED_NO_FACT` | No team cards or experience counters |
| Cases, testimonials and performance figures | No consent, source, period or verified outcome | `UNPUBLISHED_NO_FACT` | No case or return claims |
| Methodology version | Required criteria, stop factors, calculations, reviewer and update cycle absent | `UNPUBLISHED_NO_FACT` | Existing route remains gated |
| Commercial model and partner disclosure | Fee, payment moment, commissions and conflict disclosure absent | `UNPUBLISHED_NO_FACT` | No price, independence or compensation claims |
| Contact readiness and SLA | Values are canonical, operational proof is absent | `UNPUBLISHED_NO_FACT` | Do not promise availability or response time |

## Launch cohort and owner gate

The current eligible cohort contains only `PASS` rows:

```text
/privacy/                 noindex, no sitemap
/consent/                 noindex, no sitemap
```

This is not enough to close EPIC 52 because the eight-route minimum cohort is
non-waivable. The single late owner gate remains the already consolidated
`CONTENT_FACT_PACKET.md`; this matrix creates no additional question stream.
Until verified answers arrive, each dependent row stays fail-closed while the
program continues through independent ready work.
