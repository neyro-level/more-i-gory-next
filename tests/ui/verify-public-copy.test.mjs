import assert from "node:assert/strict";
import test from "node:test";

import { collectPublicCopyViolations, verifyPublicCopy } from "../../scripts/verify-public-copy.mjs";

test("public copy rejects internal editorial language", () => {
  const violations = collectPublicCopyViolations('<p>Материал остаётся draft до content gate</p>');
  assert.deepEqual(violations.map(({ term }) => term).sort(), ["content gate", "draft"]);
});

test("technical identifiers are not treated as rendered copy", () => {
  assert.deepEqual(collectPublicCopyViolations('const slug = "draft"; import x from "@/seo/metadata";'), []);
});

test("current public source tree contains no internal editorial copy", () => {
  assert.deepEqual(verifyPublicCopy(), []);
});
