import test from "node:test";

import { assertEpic32Proof } from "./lib/epic-32-proof.mjs";

test("EPIC 32 proof 14.K records runtime log scan with zero PII markers", () => {
  assertEpic32Proof("docs/proofs/32.K-pii-logs.md", [
    "phone",
    "email",
    "name",
    "message",
    "token",
    "chat id",
    "runtime lead cycle logs contain zero PII markers",
    "# fail 0",
  ]);
});
