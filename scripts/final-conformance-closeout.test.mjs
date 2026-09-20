import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (file) => readFileSync(file, "utf8");

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
  assert.match(readme, /task-manager-inventory\.plan3\.v2\.json/);
  assert.match(readme, /Invoke-AmsMasterPlan\.ps1.*Beads/);
  assert.match(state, /c824e9fa02ecfe370c859a851e3c0e0cedd48667/);
  assert.doesNotMatch(state, /842b0cce/);
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
