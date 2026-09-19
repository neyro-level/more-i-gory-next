import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const proofsDir = path.join(root, "docs", "proofs");

test("EPIC 32 has zero DEFERRED proofs and TASK 34.3 records the inventory", () => {
  const epic32 = readdirSync(proofsDir)
    .filter((name) => /^32\.[A-K]-.+\.md$/.test(name))
    .sort();

  assert.equal(epic32.length, 11);

  for (const name of epic32) {
    const text = readFileSync(path.join(proofsDir, name), "utf8");
    assert.match(text, /\*\*Verdict:\*\* PASS/);
    assert.doesNotMatch(text, /\*\*Verdict:\*\* DEFERRED/);
    assert.match(text, /# fail 0/);
  }

  const closure = readFileSync(path.join(proofsDir, "34.3-deferred-closure.md"), "utf8");
  assert.match(closure, /\*\*Verdict:\*\* PASS/);
  assert.match(closure, /`DEFERRED` proofs из EPIC 32: \*\*0\*\*/);
  assert.match(closure, /13\.9-restore\.md/);
  assert.match(closure, /Accepted-risk marker was not applied/);

  for (const name of epic32) {
    assert.ok(closure.includes(`docs/proofs/${name}`), `closure missing ${name}`);
  }
});
