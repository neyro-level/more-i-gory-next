import test from "node:test";

import { assertEpic32Proof } from "../../scripts/lib/epic-32-proof.mjs";

test("EPIC 32 proof 14.J records representative-page browser and a11y contracts", () => {
  assertEpic32Proof("docs/proofs/32.J-browser.md", [
    "/obekty/",
    "/novostroyki/",
    "/podbor/",
    "/privacy/",
    "/consent/",
    "console",
    "hydration",
    "keyboard",
    "responsive",
    "forms",
    "canonical",
    "noindex",
    "images",
    "performance",
    "representative widths keep overflow, CTA, keyboard, labels and reduced motion contracts",
    "manual passport metadata uses facts only: title, description, canonical, robots, OG and JSON-LD",
    "lead form uses canonical shadcn primitives without native control markup",
  ]);
});
