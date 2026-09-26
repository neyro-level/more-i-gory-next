import test from "node:test";

import { assertEpic32Proof } from "../../scripts/lib/epic-32-proof.mjs";

test("EPIC 32 proof 14.D records fixture ingest scenarios", () => {
  assertEpic32Proof("docs/proofs/32.D-ingest.md", [
    "baseline",
    "idempotent rerun",
    "304",
    "changed item",
    "manual ownership protection",
    "different feed protection",
    "truncated feed",
    "suspicious deactivation",
    "run-bound approval",
    "interrupted import",
    "recovery",
    "Proof A/C/D: fixture ingest covers baseline, 304, change, safety gate, interrupt and recovery",
    "304 response is a no-op and does not count as a business write",
    "manual property wins and feed cannot update it",
    "§18.5 multi-feed independence: Feed A cannot touch Feed B rows or fields",
    "consumed or rejected approval blocks mass deactivation as suspicious",
    "jobsJanitor marks stale running import as interrupted without touching baseline or deactivation",
  ]);
});
