import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { ImportRuns } from "../src/project/collections/import-runs.ts";

test("persisted import-run statuses are canonical", () => {
  const status = ImportRuns.fields.find((field) => "name" in field && field.name === "status");
  const values = status.options.map((option) => option.value);
  assert.deepEqual(values, ["queued", "running", "success", "unchanged", "suspicious", "failed", "interrupted"]);
  assert.equal(values.includes("completed"), false);
  assert.equal(values.includes("skipped"), false);
});

test("runtime finalizers persist success or unchanged but never completed or skipped", () => {
  const source = readFileSync(new URL("../src/core/data-access/system/import-feed-run.ts", import.meta.url), "utf8");
  assert.match(source, /status:\s*"unchanged"/);
  assert.doesNotMatch(source, /status:\s*"completed"/);
  assert.doesNotMatch(source, /status:\s*"skipped"/);
});

test("canonical status migration is registered after earlier Plan migrations", () => {
  const index = readFileSync(new URL("../migrations/index.ts", import.meta.url), "utf8");
  assert.match(index, /20260919_.*import_run_canonical_status/);
  assert.ok(index.indexOf("20260918_190215_deactivation_approval") < index.indexOf("import_run_canonical_status"));
});
