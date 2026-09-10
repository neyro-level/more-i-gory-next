# Release Checklist — «Море и Горы»

**Статус:** Active
**Версия:** 1.5
**Дата:** 2026-09-10

`N/A` допустимо только с явным объяснением.

## 1. Documentation

- [ ] Canonical docs = Active.
- [ ] No unresolved contradiction between PRD, Product Structure, Architecture and Scope.
- [ ] All release tasks = DONE.
- [ ] ADR status актуален.
- [ ] Tech Debt updated.

## 2. Code

- [ ] main/release branch актуальна.
- [ ] frozen install passes.
- [ ] lint passes.
- [ ] typecheck passes.
- [ ] tests pass.
- [ ] production build passes.
- [ ] `pnpm verify` passes.
- [ ] `pnpm verify:artifact` passes.

## 3. Content

- [ ] Published routes pass schema.
- [ ] No broken relations.
- [ ] No draft content in production.
- [ ] Every Project Passport has sources and verifiedAt.
- [ ] Sensitive financial claims have status/source/date.
- [ ] No template-only regional duplication.

## 4. SEO

- [ ] Unique title.
- [ ] Unique description.
- [ ] One logical H1.
- [ ] self-canonical.
- [ ] correct robots.
- [ ] sitemap matches published registry.
- [ ] breadcrumbs correct.
- [ ] structured data matches visible content.
- [ ] filter/query states do not create indexable duplicates.
- [ ] legacy redirects direct and chain-free.
- [ ] custom 404 returns 404.
- [ ] trailing slash policy consistent.
- [ ] old important URLs checked individually.

## 5. Performance

- [ ] Initial JS budget passes.
- [ ] If Initial JS budget does not pass, current gzip value and reason are recorded before production.
- [ ] Lazy chunk budget passes.
- [ ] Project Passport transfer budget passes.
- [ ] LCP lab target reviewed.
- [ ] CLS lab target reviewed.
- [ ] TBT lab target reviewed.
- [ ] critical images optimized.
- [ ] no unintended third-party code on first load.

## 6. Hydration / Browser

- [ ] no hydration warnings.
- [ ] no uncaught runtime errors.
- [ ] hard reload works on representative routes.
- [ ] core content available with JS disabled.
- [ ] mobile menu works.
- [ ] filters work.
- [ ] gallery works.
- [ ] form works.
- [ ] deferred map fallback works.

Representative routes:
- `/`;
- `/investicionnaya-nedvizhimost/sochi/`;
- `/investicionnaya-nedvizhimost/sochi/apartamenty/`;
- `/investicionnaya-nedvizhimost/krym/yalta/`;
- one Project Passport;
- one Article;
- `/podbor/`.

## 7. Accessibility

- [ ] keyboard navigation.
- [ ] visible focus.
- [ ] meaningful alt.
- [ ] form labels/errors.
- [ ] contrast checked.
- [ ] links vs buttons semantically correct.
- [ ] no nested interactive controls.

## 8. Forms / Privacy

- [ ] Leads API test route passes.
- [ ] server validation active.
- [ ] rate limit active.
- [ ] captcha/anti-spam secret server-side.
- [ ] consent checkbox/text/version correct.
- [ ] privacy/consent pages published.
- [ ] analytics does not receive PII.
- [ ] error state preserves user context.

## 9. Security

- [ ] no secrets in repository/frontend bundle.
- [ ] security headers.
- [ ] CSP.
- [ ] TLS.
- [ ] raw HTML from Markdown impossible.
- [ ] dependency audit reviewed.

## 10. Infrastructure

- [ ] versioned release path.
- [ ] atomic switch tested.
- [ ] rollback tested.
- [ ] Nginx config validated.
- [ ] access/error logs.
- [ ] staging protected.
- [ ] staging noindex.

Database:
- [ ] N/A — first release has no database.

## 11. Post Deploy

Этот раздел выполняется только по отдельной команде владельца. PR-00..PR-12
заканчиваются release readiness и не разрешают production deploy.

- [ ] live smoke.
- [ ] representative redirects.
- [ ] sitemap accessible.
- [ ] robots accessible.
- [ ] 404 correct.
- [ ] form end-to-end.
- [ ] logs checked.
- [ ] critical pages visually checked on mobile.

## 12. Current PR-13 QA Snapshot

Дата: 2026-09-10.

- `pnpm verify`: PASS.
- Static artifact: `out/`, 30 generated app routes.
- `pnpm verify:artifact`: PASS.
- Initial route JS on `/`: 0 KB gzip after static no-JS export; target is 110 KB gzip.
- Largest lazy chunk on `/`: 0 KB gzip; target is 300 KB gzip.
- HTTP smoke on local static server:
  - `/`: 200, no `_next/static/chunks` scripts in HTML.
  - `/podbor/`: 200, form present, client runtime preserved.
  - `/kontakty/`: 200, client runtime preserved for form.
  - `/investicionnaya-nedvizhimost/sochi/`: 200.
  - `/analitika/sochi-ili-krym/`: 200.
  - `/privacy/`: 200, `noindex, follow`.
- Production release: NOT RUN.
- Leads API: NOT ENABLED; `NEXT_PUBLIC_LEADS_ENABLED` remains off until human gate.
- Legal texts: NOT APPROVED; `/privacy/` and `/consent/` are noindex gate pages, not final legal documents.
