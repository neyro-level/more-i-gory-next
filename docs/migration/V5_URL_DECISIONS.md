# V5 URL migration decisions

**Plan:** `AMS-MORE-I-GORY-GEO-FIRST-INVESTMENT-REMEDIATION` v1 APPROVED
**Epic:** 70
**Observed main:** `e3b99d117cb41a479614b70d03161d1910af280f`
**Date:** 2026-09-24
**Production/index evidence:** unavailable; production and domain cutover are
unauthorized. Decisions use repository runtime and technical-preview contracts.

The machine-readable source is [`V5_URL_MANIFEST.json`](V5_URL_MANIFEST.json).
This epic records decisions only; it does not add redirects, routes, canonical
switches or index activation.

## Decision rules

- no bulk redirect to `/` or `/obekty/`;
- a redirect is allowed only for the same intent/entity;
- a redirect cannot activate before its target route, target canonical and HTTP
  behavior exist;
- preview/noindex URLs receive no SEO redirect automatically;
- target URL must be its own target canonical;
- missing business facts keep affected routes noindex and outside sitemap.

## Current decisions

| Current pattern | Target | Action | Activation/evidence |
|---|---|---|---|
| `/` | `/` | KEEP | Same brand/trust owner |
| `/investicionnaya-nedvizhimost/` | same | KEEP | Same federal owner |
| `/investicionnaya-nedvizhimost/krym/` | `/krym/` | REDIRECT_301 | Activate only after EPIC 75 target HTTP proof |
| `/investicionnaya-nedvizhimost/krym/yalta/` | `/krym/yalta/` | REDIRECT_301 | Same city intent; target-first |
| `/investicionnaya-nedvizhimost/krym/sevastopol/` | `/krym/sevastopol/` | REDIRECT_301 | Same city intent; target-first |
| `/investicionnaya-nedvizhimost/krym/evpatoriya/` | `/krym/evpatoriya/` | REDIRECT_301 | Same city intent; target-first |
| `/investicionnaya-nedvizhimost/krym/alushta/` | `/krym/alushta/` | REDIRECT_301 | Same city intent; target-first |
| `/investicionnaya-nedvizhimost/krym/novostroyki/` | none | NOINDEX_RETAIN | PAGE-024 has no active standalone owner; `/novostroyki/` is a different inventory role |
| `/investicionnaya-nedvizhimost/krym/apartamenty/` | none | NOINDEX_RETAIN | Approved grammar has no region-segment identity; it cannot be disguised as CITY |
| `/investicionnaya-nedvizhimost/arkhyz/` | `/arkhyz/` | REDIRECT_301 | Same intent; target route and registry activation required |
| `/investicionnaya-nedvizhimost/altay/` | `/altay/` | REDIRECT_301 | Same intent; target route and registry activation required |
| `/investicionnaya-nedvizhimost/sochi/` | `/sochi/` | NOINDEX_RETAIN | Current stub is preview/noindex; no automatic SEO redirect |
| `/obekty/**` | same | KEEP | Approved global investment entity model |
| `/novostroyki/**` | same | KEEP | Published newbuild inventory role |
| `/zastroyshchik/**` | same | KEEP | No approved IA change |
| `/analitika/**` | same | KEEP | No approved IA change |

## Reports

### Duplicate canonical report

`PASS`: 16 current canonical declarations and 7 redirect targets are unique
within their route classes. Pattern entries (`/**`) describe separate entity
namespaces and do not claim a literal shared canonical.

### Redirect chain report

`PASS`: no `REDIRECT_301` target is another `REDIRECT_301` source. There is no
bulk redirect to the home page or `/obekty/`.

### Target existence report

- Existing now (6): `/`, federal hub, `/obekty/**`, `/novostroyki/**`,
  `/zastroyshchik/**`, `/analitika/**`.
- Planned and target-gated: `/krym/**`, `/arkhyz/` and `/altay/`.
- `/sochi/` is a planned target but the current stub remains `NOINDEX_RETAIN`
  until registry/content evidence permits a separate migration decision.

The validator fails any redirect to a missing target unless an explicit
`activationGate` is present. EPIC 75 must re-run the report after materializing
target routes and before enabling redirects.

## EPIC 70 DoD evidence

- all current SEO route patterns named by the approved plan are present in the
  manifest;
- every R1 Crimea source has a one-to-one `REDIRECT_301` decision and target
  activation gate; none remains `REVIEW`;
- current canonical/robots/sitemap facts are traced to repository sources;
- production/index evidence is explicitly absent rather than guessed;
- no runtime or production behavior changed.
