# Plan №4 — final verification evidence

Date: 2026-09-23 (Europe/Moscow)

Candidate base: `cfcc784f61bf9cbfe03f06dc4b724c8dac8b3452`

## Final local gates

| Gate | Result | Evidence |
|---|---|---|
| Full project verification | PASS | `pnpm verify`, exit 0; full test matrix, application build and runtime verification completed |
| Dependency audit | PASS | `pnpm audit --audit-level high`, exit 0; 0 high/critical, 2 low and 3 moderate findings remain below the approved stop threshold |
| Lint | PASS with warnings | 0 errors; 4 pre-existing unused-variable warnings |
| Production boundary | PASS | No production release, domain cutover, feed activation, lead outbound activation or `JOBS_AUTORUN=true` action was executed |

## Cross-epic requirements review

| Scope | Result | Evidence |
|---|---|---|
| EPIC 60 — execution control | PASS | PR 102 merged; canonical SourceCraft/main and Task Manager graph established |
| EPIC 61 — security upgrade | PASS | Next `16.3.6` and Payload family `3.90.1`; PR 103, RISKY run 153 |
| EPIC 62 — Payload runtime proof | PASS | origin/auth/Admin/media/migration/runtime contract merged by PR 105, RISKY run 156 |
| EPIC 63 — ingest safety | PASS | source-scoped identity, normalized writes, full-run baseline, job-aware janitor and bounded 2000-offer proof; PR 107, RISKY run 160 |
| EPIC 64 — leads backend | PASS | missing trusted IP fails closed without shared bucket, store is bounded, diagnostics redact secrets/PII, channels remain empty; PR 108, RISKY run 162 |
| EPIC 65 — repository/UI hygiene | PASS | canonical primitive tree and deterministic verification runner; PR 104, RISKY run 154 |
| EPIC 66 — delivery/recovery contract | PASS | single build/install/rollback path, no permanent staging contour, release-only restore/jobs gates; PR 106, RISKY run 157 |

## Candidate restrictions

- This is a technical-preview candidate, not a production-ready declaration.
- Business facts, commercial model, methodology, launch geography and public pages remain frozen.
- Feed schedules, lead outbound channels and automatic jobs remain disabled.
- Production and domain cutover require a separate owner release command.

## Immutable preview artifact

| Field | Evidence |
|---|---|
| Candidate SHA | `cfcc784f61bf9cbfe03f06dc4b724c8dac8b3452` |
| Exact-main gate | SourceCraft RISKY run 163 — PASS |
| Single build | SourceCraft `release-single-build` run 164 — PASS |
| SHA-256 | `18a0eee21e8725dae3fcafbfdd18db825d6fa839e02d6afd44a64277685757b3` |
| Installed path | `/opt/moreigory/releases/cfcc784f61bf9cbfe03f06dc4b724c8dac8b3452` |
| Active pointer | `/opt/moreigory/current` resolves to the installed path |
| Rollback pointer | `/opt/moreigory/previous` preserves `21e484c98503550dbfbcbef38eb2e9eecd8d8308` |
| Install proof | Checksum and release manifest PASS; `moreigory.service` active; loopback `/api/health` PASS |

## Technical preview migration and live smoke

| Check | Result |
|---|---|
| Migration status before apply | 26 applied; only `20260923_141141_add_reset_password_requested_at` pending |
| Migration apply | PASS; additive column migration completed in 7 ms; ledger now 27/27 |
| Health / home / Admin | `200 / 200 / 200` |
| Owner login | `200` after migration |
| Anonymous Payload REST | `403` |
| Disabled public lead intake | `503` (`not_configured`) |
| Jobs / leads / outbound | `JOBS_AUTORUN=false`; `NEXT_PUBLIC_LEADS_ENABLED=false`; `LEAD_CHANNELS` empty |
| Indexing and headers | `X-Robots-Tag: noindex, nofollow`; HSTS and `nosniff` present; robots disallow present |

No production release, domain cutover, page/content change, feed activation or
outbound delivery was performed.
