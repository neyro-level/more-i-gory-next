import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const proof = readFileSync("docs/proofs/42-final-platform-proofs.md", "utf8");

test("EPIC 42 records exact-SHA evidence for every final platform boundary", () => {
  assert.match(proof, /Проверенный code SHA:.*`[0-9a-f]{40}`/);
  for (const command of [
    "test:final-public-boundary",
    "test:safe-outbound",
    "test:feed-same-hash-unchanged",
    "test:suspicious-baseline-regression",
    "test:heartbeat-visibility",
    "test:lead-delivery-migration",
    "test:lead-delivery-task",
    "test:jobs-handover",
  ]) {
    assert.ok(proof.includes(command), `proof missing ${command}`);
  }
  assert.doesNotMatch(proof, /DEFERRED/);
  assert.match(proof, /production не затронут/i);
});
