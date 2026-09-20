import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

test("EPIC 48 runbook keeps mutation behind exact SHA, confirmation and single-DB boundaries", () => {
  const operations = read("docs/OPERATIONS.md");
  const migration = read("ops/runtime/single-db-migration.mjs");
  const seed = read("scripts/seed-preview-db-proof.mjs");

  assert.match(operations, /TASK 48\.O from the exact merged TASK 48\.P/);
  assert.match(operations, /db:single:preflight/);
  assert.match(operations, /APPLY_SINGLE_DB_MIGRATIONS/);
  assert.match(operations, /SEED_TECHNICAL_PREVIEW_DB_PROOF/);
  assert.match(operations, /before-restart/);
  assert.match(operations, /after-restart/);
  assert.match(operations, /do not create a\s+second database/i);
  assert.match(migration, /EXPECTED_DATABASE = "default_db"/);
  assert.match(migration, /EXPECTED_POSTGRES_MAJOR = 18/);
  assert.match(migration, /EXPECTED_MIGRATION_COUNT = 26/);
  assert.match(migration, /EXPECTED_PUBLIC_TABLE_COUNT = 148/);
  assert.match(seed, /AMS_RUNTIME_CONTOUR !== "staging"/);
  assert.match(seed, /https:\/\/more-previu\.tw1\.ru/);
});

test("package aliases expose only the approved migrate, seed and smoke operators", () => {
  const scripts = JSON.parse(read("package.json")).scripts;
  assert.equal(scripts["db:single:preflight"], "node ops/runtime/single-db-migration.mjs preflight");
  assert.equal(scripts["db:single:apply"], "node ops/runtime/single-db-migration.mjs apply");
  assert.equal(
    scripts["db:single:seed-proof"],
    "node --conditions=react-server node_modules/payload/bin.js run scripts/run-preview-db-proof.mjs",
  );
  assert.equal(
    scripts["bootstrap:owner"],
    "node --conditions=react-server node_modules/payload/bin.js run scripts/bootstrap-owner.mjs",
  );
  for (const name of Object.keys(scripts)) {
    assert.equal(/migrate:(?:fresh|down)|db:(?:drop|reset)|restore/i.test(name), false, `Forbidden DB alias: ${name}`);
  }
});
