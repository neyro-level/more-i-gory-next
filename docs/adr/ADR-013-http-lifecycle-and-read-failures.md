# ADR-013 — HTTP lifecycle and Public Gateway failure semantics

**Status:** Accepted  
**Date:** 2026-09-24  
**Scope:** EPIC 73

## Context

App Router page components safely materialize `404` through `notFound()` and
permanent redirects through `permanentRedirect()`, which returns `308`. They do
not expose a supported page-level API for a real `410` response. Rendering
`data-archive-status="410"` produced HTTP 200 and was therefore false transport
semantics.

Public Gateway readers also converted Payload/PostgreSQL failures into ordinary
`[]`, `null` or static fallback values. When wrapped by `unstable_cache`, that
made infrastructure failure indistinguishable from a valid empty read and could
cache a false 404.

## Decision

- `gone` remains a `410` domain/SEO intent, but the Next page adapter
  materializes it as an explicit real `404` via `notFound()`;
- route-level permanent redirects use Next `permanentRedirect()` and are
  described and tested as `308`, never as `301`;
- trailing-slash normalization remains framework behavior and is not an SEO
  migration redirect;
- Public Gateway operational failures are logged with a safe reader identifier
  and rethrown as `PublicReadOperationalError`;
- valid zero-row reads remain `[]`/`null`; only successful reads may enter
  `unstable_cache`;
- no entity detail, catalog or sitemap reader converts an operational failure
  into absence;
- project-owned fallback is allowed only outside `unstable_cache` for
  presentation chrome, CMS enhancement and the known region navigation list.

## Consequences

- a temporary database outage produces an operational error/5xx instead of a
  cacheable false 404;
- expired archived passports without a unique replacement return real 404;
- a unique active replacement returns real 308;
- a true 410 would require a supported transport boundary such as Nginx or a
  Route Handler and is deferred unless that boundary becomes necessary.
