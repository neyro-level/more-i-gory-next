import test from "node:test";

import { assertEpic32Proof } from "./lib/epic-32-proof.mjs";

test("EPIC 32 proof 14.E records mutation invalidation for fresh public pages", () => {
  assertEpic32Proof("docs/proofs/32.E-cache.md", [
    "mutation",
    "invalidation",
    "fresh public page",
    "B2 proof: CMS mutation HTTP-revalidates so the next public request sees fresh data",
    "CMS collection hook invalidates after commit and does not throw on cache failure",
    "internal revalidate sends one approved batch to the invalidator",
    "invalidate-cache stage sends one post-commit batch and keeps the terminal run status",
  ]);
});
