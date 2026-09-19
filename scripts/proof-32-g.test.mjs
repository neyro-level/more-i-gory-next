import test from "node:test";

import { assertEpic32Proof } from "./lib/epic-32-proof.mjs";

test("EPIC 32 proof 14.G records Timeweb S3 object contract", () => {
  assertEpic32Proof("docs/proofs/32.G-s3.md", [
    "upload",
    "page image",
    "redeploy",
    "still works",
    "media upload does not use VPS disk as source of truth",
    "Timeweb S3 recovery uses versioning and does not restore from VPS disk",
    "Timeweb S3 uses path-style addressing on the approved endpoint and region",
    "missing image uses one canonical registered fallback",
  ]);
});
