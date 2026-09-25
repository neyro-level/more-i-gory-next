import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ci = await readFile(new URL("../.sourcecraft/ci.yaml", import.meta.url), "utf8");
const workspace = await readFile(new URL("../pnpm-workspace.yaml", import.meta.url), "utf8");
const releaseScript = await readFile(new URL("./ci/sourcecraft-release.sh", import.meta.url), "utf8");
const runtimeRelease = await readFile(new URL("./verify-runtime-release.mjs", import.meta.url), "utf8");

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

test("one manual release workflow owns the single-build artifact path", () => {
  assert.equal(ci.match(/^  release-single-build:\s*$/gmu)?.length, 1);
  const release = workflow("release-single-build");
  assert.match(release, /expected_commit_sha/);
  assert.match(release, /gate_run_slug/);
  assert.match(release, /previous_release_sha/);
  assert.match(release, /target_server_url/);
  assert.match(releaseScript, /NEXT_PUBLIC_SERVER_URL="\$TARGET_SERVER_URL"/);
  assert.match(release, /bash scripts\/ci\/sourcecraft-release\.sh/);
  for (const artifact of [
    "release.tar.gz",
    "release.tar.gz.sha256",
    "RELEASE_EVIDENCE.json",
    "PACK_RESULT.json",
  ]) {
    assert.ok(release.includes(`dist/sourcecraft-release/${artifact}`));
  }
  assert.doesNotMatch(release, /\b(?:ssh|scp|rsync|docker\s+(?:build|compose)|kubectl)\b/);
  assert.equal(ci.match(/bash scripts\/ci\/sourcecraft-release\.sh/g)?.length, 1);
  assert.equal(releaseScript.match(/pnpm verify:risk:runtime-release/g)?.length, 1);
  assert.equal(releaseScript.match(/node scripts\/pack-release\.mjs/g)?.length, 1);
  assert.equal(runtimeRelease.match(/^  "build",$/gmu)?.length, 1);
  assert.doesNotMatch(releaseScript, /\b(?:ssh|scp|rsync|docker\s+(?:build|compose)|kubectl)\b/);
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
