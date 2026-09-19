import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const uiContract = JSON.parse(readFileSync(new URL("./ui-upstream-exceptions.json", import.meta.url), "utf8"));

test("upstream exception manifest is exact, pinned, and evidence-backed", () => {
  assert.equal(uiContract.shadcnVersion, "4.21.0");
  assert.equal(uiContract.preset, "base-nova");
  assert.equal(uiContract.consumerPath, "@/components/ui/*");
  assert.ok(uiContract.exceptions.length > 0);

  for (const entry of uiContract.exceptions) {
    assert.equal(entry.pattern, "exact");
    assert.equal(entry.shadcnVersion, uiContract.shadcnVersion);
    assert.equal(entry.preset, uiContract.preset);
    assert.match(entry.verificationMethod, /shadcn add .* --diff/);
    assert.ok(entry.reason.length > 10);
    const source = readFileSync(new URL(`../${entry.file}`, import.meta.url), "utf8");
    assert.equal(source.includes(entry.literal), true, `${entry.file} must contain ${entry.literal}`);
  }
});

test("manifest has no duplicate file and literal registrations", () => {
  const keys = uiContract.exceptions.map((entry) => `${entry.file}\u0000${entry.literal}`);
  assert.equal(new Set(keys).size, keys.length);
});
