import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(file, "utf8");
const baselineSha = "53cabb8fde75188101900cf457b271a745551082";
const expectedMerged = new Map([
  ["EPIC-43", "78c2753efc48fb2abafd0527b8949e85af199762"],
  ["EPIC-44", "c824e9fa02ecfe370c859a851e3c0e0cedd48667"],
  ["EPIC-45", "3ae8f135cfe9fc6f504fef6d1db3fcc65df59f86"],
  ["EPIC-46", "ea27da151073861f1f9c695ce94dd5d9a61792cc"],
  ["EPIC-47", "7503ea2ddbdd68de917bf8ca4366284abc1c4382"],
  ["EPIC-48", "e4b0d006f279a1df9c788b826d151c7c6089545e"],
  ["EPIC-49", "fbc542392c9cfa01e48fe03483c0a3dbd443654b"],
  ["EPIC-50", "515db2520bb6dd6e4ecd0b7f91e21a030fa0551f"],
  ["EPIC-51", "dcd51ed2700e88492c32309725cf8754b442f016"],
  ["EPIC-52", "6d9d927a5535f903578ed9625c9c345a7ca704d5"],
  ["EPIC-53", baselineSha],
]);

test("Plan 3 canonical documents expose one unambiguous delivery state", () => {
  const state = read("docs/DELIVERY_STATE.yaml");
  const readme = read("docs/README.md");

  for (const key of [
    "code_baseline_sha:",
    "last_verified_main_sha:",
    "verification_date:",
    "current_status:",
    "next_step:",
    "production: not_authorized",
  ]) {
    assert.ok(state.includes(key), `DELIVERY_STATE missing ${key}`);
  }
  assert.doesNotMatch(state, /^canonical_main:/m);
  assert.match(readme, /MORE_I_GORY_PLAN_№ 3\.md/);
  assert.match(readme, /task-manager-inventory\.plan3\.v3\.json/);
  assert.doesNotMatch(readme, /task-manager-inventory\.plan3\.v2\.json/);
  assert.match(readme, /Invoke-AmsMasterPlan\.ps1.*Beads/);
  assert.match(state, new RegExp(baselineSha));
  assert.doesNotMatch(state, /842b0cce/);
  assert.match(state, /current_status: epic_54_exact_main_closeout_pending/);
  assert.match(state, /next_step: gate and squash-merge PR 100/);

  const mergedRows = [...state.matchAll(/epic:\s*(EPIC-\d+),\s*pr:\s*\d+,\s*sha:\s*([0-9a-f]{40})/g)];
  assert.equal(mergedRows.length, expectedMerged.size, "unexpected last_merged row count");
  assert.equal(new Set(mergedRows.map((row) => row[1])).size, expectedMerged.size, "duplicate epic in last_merged");

  for (const [, epic, sha] of mergedRows) {
    assert.equal(sha, expectedMerged.get(epic), `${epic} merge SHA drift`);
    execFileSync("git", ["cat-file", "-e", `${sha}^{commit}`], { stdio: "ignore" });
    execFileSync("git", ["merge-base", "--is-ancestor", sha, baselineSha], { stdio: "ignore" });
  }
});

test("project and design canon match implemented Plan 3 architecture", () => {
  const project = read("docs/PROJECT.md");
  const design = read("docs/DESIGN.md");
  const prd = read("docs/01_PRD.md");
  const productStructure = read("docs/02_PRODUCT_STRUCTURE.md");
  const architecture = read("docs/03_ARCHITECTURE.md");
  const backlog = read("docs/04_BACKLOG.md");
  const releaseChecklist = read("docs/05_RELEASE_CHECKLIST.md");
  const nextConfig = read("next.config.ts");

  assert.match(project, /AMS Realty Platform Core 5\.5/);
  assert.match(project, /EPIC 55–56/);
  assert.doesNotMatch(project, /NEEDS_OWNER.*Standard 3\.0/s);
  assert.match(design, /@\/components\/ui\/\*/);
  assert.match(design, /sm \| md \| lg \| hero/);
  assert.match(design, /globalNotFound/);
  assert.match(nextConfig, /globalNotFound:\s*true/);
  assert.ok(existsSync("src/app/global-not-found.tsx"));
  assert.match(architecture, /Payload transaction: lead \+ pending delivery records/);
  assert.match(backlog, /Payload intake/);
  assert.match(releaseChecklist, /Payload intake/);
  for (const canonicalDoc of [prd, productStructure, architecture, backlog, releaseChecklist]) {
    assert.doesNotMatch(canonicalDoc, /AMS Leads API/);
  }
});

test("all known release blockers remain explicit and stale root inventory is gone", () => {
  const queue = read("docs/OWNER_QUEUE.md");

  for (const marker of [
    "mg4-epic-52.1",
    "TASK 24.1b",
    "Credentials hygiene",
    "Domain cutover",
    "EPIC 55–56",
  ]) {
    assert.ok(queue.includes(marker), `OWNER_QUEUE missing ${marker}`);
  }
  assert.doesNotMatch(queue, /20260916_063247_pages_drafts_redirects/);
  assert.equal(existsSync("master-plan.inventory.json"), false);
});

test("closeout evidence preserves the owner-approved restore deferral", () => {
  const activeCloseout = [
    read("docs/README.md"),
    read("docs/04_BACKLOG.md"),
    read("docs/proofs/54.2-final-candidate-contract.md"),
  ].join("\n");

  assert.match(activeCloseout, /restore (?:явно )?отложен|restore deferred|restore deferral/i);
  assert.doesNotMatch(activeCloseout, /(?:full\s+)?single-DB restore(?:\s+proof)?/i);
});
