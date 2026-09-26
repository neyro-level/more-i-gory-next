# EPIC 89 — UI, copy, tests and CI proof

Дата локальной проверки: `2026-09-26`.

## Scope evidence

- public copy guard проверяет шесть публичных source roots; результат — `0` нарушений;
- home разнесён на `src/components/pages/home/**`, статический контент —
  `src/content/home/**`, DTO/data access — в project core;
- public `<main>` имеют `id="main"`, skip-link расположен перед header;
- mobile navigation остаётся client leaf; SiteHeader остаётся Server Component;
- LeadForm, Card radius API, preview navigation и deprecated utilities приведены
  к утверждённому контракту;
- исторические планы №2–4 и root legacy plan перемещены в `docs/archive/`, ссылки
  обновлены;
- CI docs-presence вынесен в `scripts/ci/docs-presence.sh`; workflows остаются
  manual-only (`on: {}`), автоматические push/PR triggers не добавлены.

## Test conservation

| Point | Test files | Test cases | Passed | Skipped | Failed |
|---|---:|---:|---:|---:|---:|
| EPIC 87 recorded baseline | 165 | 681 | 671 | 10 | 0 |
| Before EPIC 89 move (after EPIC 88 additions) | 167 | — | — | — | — |
| EPIC 89 final | 168 | 697 | 687 | 10 | 0 |

Exact duplicate deletions: `0`. Перенос сохраняет все исходные test files и
добавляет один новый public-copy contract test.

## Local gates

- `pnpm verify` — PASS;
- `pnpm verify:schema` — PASS;
- `pnpm verify:ui-drift` — PASS, P0/P1/P2 findings отсутствуют;
- `pnpm test:ui` — PASS;
- `pnpm test:all` — PASS (`697`, pass `687`, skipped `10`, fail `0`);
- `pnpm quality:dead-code` — PASS, подтверждённых удалений нет;
- production build/runtime — PASS; maximum initial route JS `207 KB gzip`
  при budget `210 KB`, largest chunk `70 KB gzip`.

## Browser QA

Local production runtime, Chromium headless:

| Width | Horizontal overflow | Navigation | H1 | Main/skip-link |
|---:|---|---|---:|---|
| 360 | none | mobile | 1 | PASS |
| 768 | none | mobile | 1 | PASS |
| 1280 | none | desktop | 1 | PASS |

Keyboard flow: skip-link → brand → menu trigger; Space opens the modal sheet,
focus moves inside, Escape closes it and returns focus to the trigger. Screenshots
and raw browser/Lighthouse JSON were generated as local run artifacts and are not
committed as binaries.

## Lighthouse mobile local lab

Lighthouse `13.5.0`, mobile form factor, local production build,
`--throttling-method=provided` per project Release Checklist. Three successful
fixed runs used for evidence:

| Run | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 96 | 100 | 100 | 61 | 2216 ms | 0 | 0 ms |
| 2 | 96 | 100 | 100 | 61 | 2227 ms | 0 | 0 ms |
| 3 | 96 | 100 | 100 | 61 | 2222 ms | 0 | 0 ms |

- median LCP: `2222 ms` ≤ `2500 ms`;
- maximum LCP: `2227 ms` ≤ `2500 ms`;
- maximum CLS: `0` ≤ `0.1`;
- maximum TBT: `0 ms` ≤ `200 ms`.

SEO score is intentionally reduced by the staging `noindex` boundary and is not
an index-activation signal.

## Safety boundary

Production, `moreigori.ru`, DNS, jobs, feeds, outbound lead channels, public lead
intake and index activation were not changed or invoked.
