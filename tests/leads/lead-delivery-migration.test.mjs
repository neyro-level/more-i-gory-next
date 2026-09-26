import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

const databaseUri = process.env.LEAD_DELIVERY_MIGRATION_TEST_DATABASE_URI;
const psql = process.env.PSQL_BIN ?? "psql";
const migrationUrl = new URL("../../migrations/20260919_123428.ts", import.meta.url);

function runSql(sql, { allowFailure = false } = {}) {
  const result = spawnSync(psql, [databaseUri, "-X", "-v", "ON_ERROR_STOP=1", "-tAc", sql], {
    encoding: "utf8",
  });
  if (!allowFailure && result.status !== 0) throw new Error(result.stderr || "psql failed");
  return result;
}

function migrationSql(direction) {
  const source = readFileSync(migrationUrl, "utf8");
  const start = source.indexOf(`export async function ${direction}`);
  const sqlStart = source.indexOf("sql`", start) + 4;
  const sqlEnd = source.indexOf("`)", sqlStart);
  assert.ok(start >= 0 && sqlStart > 3 && sqlEnd > sqlStart, `${direction} migration SQL is present`);
  return source.slice(sqlStart, sqlEnd);
}

test("lead delivery migration maps only sent and preserves rows, constraints and unknown historical time", { skip: !databaseUri }, () => {
  runSql(`
    DROP TABLE IF EXISTS lead_deliveries_attempt_log;
    DROP TABLE IF EXISTS lead_deliveries;
    DROP TYPE IF EXISTS enum_lead_deliveries_attempt_log_delivery_certainty;
    DROP TYPE IF EXISTS enum_lead_deliveries_attempt_log_outcome;
    DROP TYPE IF EXISTS enum_lead_deliveries_status;
    CREATE TYPE enum_lead_deliveries_status AS ENUM ('pending','sending','sent','failed','abandoned');
    CREATE TYPE enum_lead_deliveries_attempt_log_outcome AS ENUM ('pending','sending','sent','failed','abandoned');
    CREATE TABLE lead_deliveries (
      id serial PRIMARY KEY,
      lead_id integer NOT NULL,
      channel_id text NOT NULL,
      status enum_lead_deliveries_status DEFAULT 'pending' NOT NULL,
      next_attempt_at timestamptz
    );
    CREATE UNIQUE INDEX lead_deliveries_lead_channel_id_idx ON lead_deliveries (lead_id, channel_id);
    CREATE INDEX lead_deliveries_status_next_attempt_at_idx ON lead_deliveries (status, next_attempt_at);
    CREATE TABLE lead_deliveries_attempt_log (
      id serial PRIMARY KEY,
      outcome enum_lead_deliveries_attempt_log_outcome NOT NULL
    );
    INSERT INTO lead_deliveries (lead_id, channel_id, status) VALUES
      (1, 'pending', 'pending'),
      (2, 'sending', 'sending'),
      (3, 'sent', 'sent'),
      (4, 'failed', 'failed'),
      (5, 'abandoned', 'abandoned');
    INSERT INTO lead_deliveries_attempt_log (outcome) VALUES ('sent');
  `);

  runSql(migrationSql("up"));

  assert.equal(runSql("SELECT count(*) FROM lead_deliveries;").stdout.trim(), "5");
  assert.equal(
    runSql("SELECT string_agg(status::text, ',' ORDER BY id) FROM lead_deliveries;").stdout.trim(),
    "pending,sending,delivered,failed,abandoned",
  );
  assert.equal(runSql("SELECT count(*) FROM lead_deliveries WHERE delivered_at IS NOT NULL;").stdout.trim(), "0");
  assert.equal(
    runSql("SELECT outcome::text || ':' || delivery_certainty::text FROM lead_deliveries_attempt_log;").stdout.trim(),
    "delivered:unknown",
  );
  assert.equal(
    runSql("SELECT count(*) FROM pg_indexes WHERE tablename = 'lead_deliveries' AND indexname IN ('lead_deliveries_lead_channel_id_idx','lead_deliveries_status_next_attempt_at_idx');").stdout.trim(),
    "2",
  );
  assert.notEqual(
    runSql("INSERT INTO lead_deliveries (lead_id, channel_id, status) VALUES (1, 'pending', 'pending');", { allowFailure: true }).status,
    0,
  );

  runSql(migrationSql("down"));
  assert.equal(
    runSql("SELECT string_agg(status::text, ',' ORDER BY id) FROM lead_deliveries;").stdout.trim(),
    "pending,sending,sent,failed,abandoned",
  );
});

test("lead delivery migration is registered after the EPIC 38 import-status migration", () => {
  const index = readFileSync(new URL("../../migrations/index.ts", import.meta.url), "utf8");
  assert.ok(index.indexOf("20260919_123428") > index.indexOf("20260919_114121_import_run_canonical_status"));
});
