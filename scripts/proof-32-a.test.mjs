import test from "node:test";

import { assertEpic32Proof } from "./lib/epic-32-proof.mjs";

test("EPIC 32 proof 14.A records access evidence with raw TAP output", () => {
  assertEpic32Proof("docs/proofs/32.A-access.md", [
    "raw anonymous REST denied",
    "Public Gateway works",
    "owner works",
    "private fields absent",
    "leads/deliveries denied",
    "anonymous GET leads and lead-deliveries is denied; owner is allowed",
    "Public Gateway uses explicit safe query options and returns DTOs only",
    "Guard 3 rejects private fields in public contracts",
  ]);
});
