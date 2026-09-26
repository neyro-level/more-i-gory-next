import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  buildImportStatusMigrationPreflight,
  unchanged304Summary,
} from "../../src/core/ingest/import-status-migration.ts";

const databaseUri = process.env.IMPORT_STATUS_TEST_DATABASE_URI;
const psql = process.env.PSQL_BIN ?? "psql";
const migrationSource = readFileSync(
  new URL("../../migrations/20260919_114121_import_run_canonical_status.ts", import.meta.url),
  "utf8",
);

function migrationSql(direction) {
  const match = migrationSource.match(
    new RegExp("export async function " + direction + "[\\s\\S]*?sql`([\\s\\S]*?)`\\)"),
  );
  assert.ok(match, `${direction} migration SQL must be extractable`);
  return match[1];
}

function runSql(sql, expectSuccess = true) {
  const result = spawnSync(psql, [databaseUri, "-X", "-v", "ON_ERROR_STOP=1", "-tAc", sql], { encoding: "utf8" });
  if (expectSuccess && result.status !== 0) throw new Error(result.stderr || "psql failed");
  return result;
}

test("preflight maps only proven historical status semantics", () => {
  const report = buildImportStatusMigrationPreflight([
    { id: 1, status: "completed", summary: "Run completed." },
    { id: 2, status: "skipped", summary: unchanged304Summary },
    { id: 3, status: "failed", summary: "network" },
  ]);

  assert.equal(report.safeToMigrate, true);
  assert.deepEqual(report.mappings, { completedToSuccess: 1, skipped304ToUnchanged: 1 });
  assert.deepEqual(report.counts, { completed: 1, skipped: 1, failed: 1 });
});

test("preflight reports ambiguous skipped rows and is repeat-safe", () => {
  const rows = [
    { createdAt: "2026-09-01T00:00:00.000Z", id: "ambiguous", offeredCount: 7, status: "skipped" },
  ];
  const first = buildImportStatusMigrationPreflight(rows);
  const second = buildImportStatusMigrationPreflight(rows);

  assert.equal(first.safeToMigrate, false);
  assert.deepEqual(first, second);
  assert.deepEqual(first.ambiguousSkipped, rows);
});

test("PostgreSQL migration blocks ambiguity and repeatably maps only proven rows", { skip: !databaseUri }, () => {
  runSql(`
    DROP TABLE IF EXISTS import_runs;
    DROP TYPE IF EXISTS enum_import_runs_status;
    CREATE TYPE enum_import_runs_status AS ENUM ('queued','running','completed','suspicious','failed','skipped','interrupted');
    CREATE TABLE import_runs (
      id serial PRIMARY KEY,
      status enum_import_runs_status NOT NULL DEFAULT 'queued',
      summary text
    );
    INSERT INTO import_runs (status, summary) VALUES
      ('completed', 'Run completed.'),
      ('skipped', '${unchanged304Summary}'),
      ('skipped', 'historical meaning unknown');
  `);

  const blocked = runSql(migrationSql("up"), false);
  assert.notEqual(blocked.status, 0);
  assert.match(blocked.stderr, /ambiguous skipped rows/);
  assert.equal(runSql("SELECT count(*) FROM import_runs WHERE status = 'skipped';").stdout.trim(), "2");

  runSql("DELETE FROM import_runs WHERE summary = 'historical meaning unknown';");
  runSql(migrationSql("up"));
  assert.equal(
    runSql("SELECT string_agg(status::text, ',' ORDER BY id) FROM import_runs;").stdout.trim(),
    "success,unchanged",
  );

  runSql(migrationSql("down"));
  runSql(migrationSql("up"));
  assert.equal(
    runSql("SELECT string_agg(status::text, ',' ORDER BY id) FROM import_runs;").stdout.trim(),
    "success,unchanged",
  );
});
