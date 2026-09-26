# Night hardening v1 — technical preview run report

**Date:** 2026-09-26 (Europe/Moscow)

**Plan:** `AMS-MORE-I-GORY-NIGHT-HARDENING-PREVIEW-2026-09` v1

**Scope:** `more-previu.tw1.ru` technical preview only

**Final verdict:** `ROLLBACK PASS`; candidate live proof is incomplete

## Delivered code

| Scope | PR / gate | Merged main |
|---|---|---|
| EPIC 87 control baseline | PR 130 | `2ed55a64cd01a84dd37950e37edfde97e396c990` |
| EPIC 88 runtime, SEO and Payload preview | PR 131 / RISKY run 207 | `2abd966e92d9271365ba1b2fc8e1763efba7930c` |
| EPIC 89 UI, public copy, tests and CI hygiene | PR 132 / RISKY run 208 | `d40aa5479bf90c70ba8a24ab5af148759f3cd37c` |
| Release bootstrap/order fixes | PR 133–134 / RISKY runs 210 and 212 | `5660a99b82737365dd9b8309d7948b8cf8a92bdd` |
| Stable S3 schema fields and migration 29 | PR 135 / RISKY run 214 | `b98c416507ab1c4c1836fb80c010382ecd387555` |

Runs 209 and 211 failed before artifact creation and were superseded by PR 133
and PR 134. Run 213 built the superseded `5660a99…` candidate; it was never
installed. Final exact-main run 215 passed.

The report-only closeout was delivered by
[PR 136](https://sourcecraft.dev/integrator-p/more-i-gory-next/pr/136), passed
[STANDARD run 217](https://api.sourcecraft.tech/repos/integrator-p/more-i-gory-next/cicd/runs/217)
at exact head `5ef21f8c295aa9a1f3c7b7bb73f95ae1d7996d4b`, and merged as
`56e6d53b3c52d995012c2aa73162f1225954c61f`. That docs commit was not installed
on preview.

## Candidate tuple

| Field | Evidence |
|---|---|
| Candidate SHA | `b98c416507ab1c4c1836fb80c010382ecd387555` |
| Release build | SourceCraft run 215, `success` |
| Artifact digest | `2ce20887be87ed59194875a5c773c080f17eee0a16164bb3b29313ddbe5dfbd0` |
| Draft release | `preview-b98c416507ab1c4c1836fb80c010382ecd387555` |
| Installed path | `/opt/moreigory/releases/b98c416507ab1c4c1836fb80c010382ecd387555` |
| Pre-switch release | `cfcc784f61bf9cbfe03f06dc4b724c8dac8b3452` |
| Final active release | `cfcc784f61bf9cbfe03f06dc4b724c8dac8b3452` after rollback |
| Rollback unit retained | candidate `b98c416…` is the `previous` pointer |

The archive checksum and embedded release manifest passed before installation.
The runtime host did not build application code.

Release evidence is retained in draft tag
`preview-b98c416507ab1c4c1836fb80c010382ecd387555`; the authenticated SourceCraft
[run evidence](https://api.sourcecraft.tech/repos/integrator-p/more-i-gory-next/cicd/runs/215)
and [artifact index](https://api.sourcecraft.tech/repos/integrator-p/more-i-gory-next/cicd/artifacts/215/release-single-build/exact-sha-release-unit/build-pack-rehearse)
contain `release.tar.gz`, its SHA-256 sidecar, `RELEASE_EVIDENCE.json` and
`PACK_RESULT.json`.

## Database and seed evidence

- Preflight: PostgreSQL 18, 148 public tables, 28 applied migrations, geo
  migration present, S3 migration and both S3 columns absent.
- Applied additive migration
  `20260926_070539_add_s3_storage_fields`; final ledger is 29/29 and both
  `media.prefix` and `media._objectkey` exist.
- Missing-only seeds created four media records in `staging/media` and ten
  region records. No destructive migration, schema push, second database or
  restore was used.
- The additive database changes remain after application rollback and are
  compatible with the restored release; health is green.

## Switch, smoke and rollback

| Check | Result |
|---|---|
| Immutable install and initial loopback health | PASS |
| Service after switch | PASS, `active` |
| Extended DB-backed smoke | FAIL; fail-closed script redacted the exact assertion |
| Read-only diagnostic | owner login `200`, Admin `200`; the technical published proof route returned `404` under the resulting DB/runtime state |
| Mandatory rollback | PASS |
| Restored SHA / service / loopback health | `cfcc784f…` / `active` / `{"ok":true}` |
| Env rollback | PASS; candidate-only `AMS_EDITORIAL_PREVIEW` override removed |

The approved stop rule was followed: no second candidate switch was attempted.
Consequently baseline URL parity, full canonical/OG crawl, reversible region
title proof, browser lead-request proof and candidate Lighthouse measurements
are `NOT RUN AFTER STOP`, not PASS.

Candidate screenshots were not produced after the mandatory stop. EPIC 89 local
browser and Lighthouse artifacts remain separate pre-release evidence and are
not presented as candidate live screenshots.

## Boundary proof

- `moreigori.ru`, DNS, TLS cutover and production were not changed.
- Jobs, feeds, outbound channels, public lead intake and index activation stayed
  disabled.
- No secret or PII value was written to Git or this report.
- The candidate remains available for a future, separately approved diagnostic
  stream; this report does not authorize another switch.

## Remaining owner gate

Before another preview attempt, approve a narrow diagnostic plan for the
Payload-backed published-proof/publication contract, then require a new exact
main SHA, one fresh artifact and the complete post-switch smoke matrix. A
production release remains a separate explicit decision.
