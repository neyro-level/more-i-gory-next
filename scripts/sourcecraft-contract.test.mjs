import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ci = await readFile(new URL("../.sourcecraft/ci.yaml", import.meta.url), "utf8");
const workspace = await readFile(new URL("../pnpm-workspace.yaml", import.meta.url), "utf8");

function workflow(name, nextName) {
  const start = ci.indexOf(`  ${name}:`);
  assert.notEqual(start, -1, `${name} workflow must exist`);
  const end = nextName ? ci.indexOf(`  ${nextName}:`, start + name.length + 3) : ci.length;
  assert.notEqual(end, -1, `${nextName} workflow must follow ${name}`);
  return ci.slice(start, end);
}

test("development CI remains manual-only", () => {
  assert.match(ci, /^on:\s*\{\}\s*$/mu);
  assert.doesNotMatch(ci, /^\s*(?:trigger|triggers|push|pull_request|merge_request|schedule):/mu);
  assert.match(ci, /^workflows:\s*$/mu);
});

test("both exact-head merge gates block high and critical dependency findings", () => {
  for (const [name, body] of [
    ["merge-standard", workflow("merge-standard", "merge-risky")],
    ["merge-risky", workflow("merge-risky")],
  ]) {
    assert.equal(body.match(/pnpm audit --audit-level high/g)?.length, 1, `${name} must run one high audit`);
    assert.ok(body.indexOf("pnpm install --frozen-lockfile") < body.indexOf("pnpm audit --audit-level high"));
    assert.ok(body.indexOf("pnpm audit --audit-level high") < body.indexOf("pnpm verify"));
    assert.match(body, /expected_commit_sha/);
  }
});

test("the emergency release-age exception is exact and limited to Next 16.3.6", () => {
  const required = [
    "@next/env",
    "@next/eslint-plugin-next",
    "@next/swc-darwin-arm64",
    "@next/swc-darwin-x64",
    "@next/swc-linux-arm64-gnu",
    "@next/swc-linux-arm64-musl",
    "@next/swc-linux-x64-gnu",
    "@next/swc-linux-x64-musl",
    "@next/swc-win32-arm64-msvc",
    "@next/swc-win32-x64-msvc",
    "eslint-config-next",
    "next",
  ];

  for (const packageName of required) {
    assert.match(workspace, new RegExp(`['\"]?${packageName.replaceAll("/", "\\/")}@16\\.3\\.6['\"]?`));
  }
  assert.doesNotMatch(workspace, /@next\/[a-z0-9-]+@(?:\*|\^|~|latest)/u);
});
