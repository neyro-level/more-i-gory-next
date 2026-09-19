import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

export function readProof(relativePath) {
  return readFileSync(join(root, relativePath), "utf8");
}

export function assertEpic32Proof(relativePath, snippets) {
  const text = readProof(relativePath);
  assert.match(text, /\*\*SHA:\*\* `[a-f0-9]{40}`/);
  assert.match(text, /\*\*Дата:\*\* \d{4}-\d{2}-\d{2}T/);
  assert.match(text, /\*\*Verdict:\*\* PASS/);
  assert.match(text, /# fail 0/);
  assert.doesNotMatch(text, /# fail [1-9]/);
  for (const snippet of snippets) {
    assert.match(text, new RegExp(snippet));
  }
}
