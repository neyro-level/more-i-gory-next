import test from "node:test";

import { assertEpic32Proof } from "../../scripts/lib/epic-32-proof.mjs";

test("EPIC 32 proof 14.B records lead intake and fake-channel delivery", () => {
  assertEpic32Proof("docs/proofs/32.B-leads.md", [
    "HTTP POST",
    "pending delivery",
    "outbound fake channel",
    "channel down",
    "public lead endpoint validates and creates a lead without returning PII",
    "createLead uses one Payload transaction for lead and pending deliveries",
    "fake transport success stores sent and externalRef",
    "fake transport 429 and 500 are retryable",
    "queue unavailable and crash-after-commit stay after the committed delivery row",
  ]);
});
