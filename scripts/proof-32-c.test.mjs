import test from "node:test";

import { assertEpic32Proof } from "./lib/epic-32-proof.mjs";

test("EPIC 32 proof 14.C records crash-after-commit recovery", () => {
  assertEpic32Proof("docs/proofs/32.C-crash-window.md", [
    "lead committed",
    "process dies before enqueue",
    "recovery",
    "queue unavailable and crash-after-commit stay after the committed delivery row",
    "recoverLeadDeliveries updates recovered rows and controlled requeues them",
    "recover plan returns stale sending and orphan pending actions only",
  ]);
});
