import test from "node:test";

import { assertEpic32Proof } from "./lib/epic-32-proof.mjs";

test("EPIC 32 proof 14.H records injected-clock retention", () => {
  assertEpic32Proof("docs/proofs/32.H-retention.md", [
    "day 100",
    "PII anonymized",
    "recovery period",
    "day 300",
    "purge",
    "lead retention policy keeps PII for 100 days and recoverable history for 300 total days",
    "lead retention cleanup anonymizes PII first, then purges lead and deliveries after total retention",
  ]);
});
