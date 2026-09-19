import test from "node:test";

import { assertEpic32Proof } from "./lib/epic-32-proof.mjs";

test("EPIC 32 proof 14.F records publish without rebuild", () => {
  assertEpic32Proof("docs/proofs/32.F-publishing.md", [
    "publish DB record",
    "no rebuild",
    "route 200",
    "sitemap updated",
    "published property, complex and developer appear in sitemap after CMS revalidate without rebuild",
    "sitemap route is dynamic and wired to the DB-backed source",
  ]);
});
