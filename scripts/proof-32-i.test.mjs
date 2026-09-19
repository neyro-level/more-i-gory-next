import test from "node:test";

import { assertEpic32Proof } from "./lib/epic-32-proof.mjs";

test("EPIC 32 proof 14.I records jobs owner, recovery and no cron storm", () => {
  assertEpic32Proof("docs/proofs/32.I-jobs.md", [
    "one owner",
    "no cron storm",
    "orphan recovery",
    "stale running recovery",
    "no catch-up storm",
    "jobs owner contract allows exactly one JOBS_AUTORUN=true in steady state",
    "maintenance and dispatcher cron expressions are not per-second and use 0/N steps",
    "jobsJanitor marks orphan queued import after threshold and ignores fresh queued imports",
    "calculateNextDueAt advances from now when missed intervals are behind",
  ]);
});
