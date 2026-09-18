import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationName = "20260918_190215_deactivation_approval";

test("clean installs and existing databases share one registered upgrade migration", () => {
  const index = readFileSync(path.join(root, "migrations/index.ts"), "utf8");
  assert.match(index, new RegExp(`name: '${migrationName}'`));
  assert.ok(index.trimEnd().endsWith("];"));
  assert.match(index, new RegExp(`${migrationName}[\\s\\S]*\\];\\s*$`));

  const sql = readFileSync(path.join(root, `migrations/${migrationName}.ts`), "utf8");
  assert.match(sql, /CREATE TYPE "public"."enum_feed_sources_deactivation_approval_decision"/);
  assert.match(sql, /ALTER TABLE "feed_sources" ADD COLUMN "deactivation_approval_run_id"/);
  assert.match(sql, /ALTER TABLE "feed_sources" DROP COLUMN "deactivation_approval"/);
  assert.match(sql, /DROP TYPE "public"."enum_feed_sources_deactivation_approval"/);
});

test("schema snapshot keeps run-bound approval indexes and enum constraints", () => {
  const snapshot = JSON.parse(readFileSync(path.join(root, `migrations/${migrationName}.json`), "utf8"));
  const table = snapshot.tables["public.feed_sources"];
  const columns = table.columns;

  assert.equal(columns.deactivation_approval, undefined);
  assert.equal(columns.deactivation_approval_run_id?.type, "varchar");
  assert.equal(columns.deactivation_approval_consumed_at?.type, "timestamp(3) with time zone");
  assert.equal(columns.deactivation_approval_decision?.type, "enum_feed_sources_deactivation_approval_decision");
  assert.equal(
    table.indexes.feed_sources_deactivation_approval_deactivation_approval_idx?.columns[0].expression,
    "deactivation_approval_run_id",
  );
  assert.deepEqual(snapshot.enums["public.enum_feed_sources_deactivation_approval_decision"].values, [
    "approved",
    "rejected",
  ]);
  assert.equal(snapshot.enums["public.enum_feed_sources_deactivation_approval"], undefined);
});
