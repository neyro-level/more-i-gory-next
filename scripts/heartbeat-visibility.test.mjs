import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import test from "node:test";

const databaseUri = process.env.HEARTBEAT_TEST_DATABASE_URI;
const psql = process.env.PSQL_BIN ?? "psql";

function runSql(sql) {
  const result = spawnSync(psql, [databaseUri, "-X", "-v", "ON_ERROR_STOP=1", "-tAc", sql], {
    encoding: "utf8",
  });
  if (result.status !== 0) throw new Error(result.stderr || "psql failed");
  return result.stdout.trim();
}

test("heartbeat is visible through an independent connection before ingest commit", { skip: !databaseUri }, async () => {
  runSql(`
    DROP TABLE IF EXISTS epic38_ingest_work;
    DROP TABLE IF EXISTS epic38_import_runs;
    CREATE TABLE epic38_import_runs (id text PRIMARY KEY, heartbeat_at timestamptz);
    CREATE TABLE epic38_ingest_work (id integer PRIMARY KEY, value text);
    INSERT INTO epic38_import_runs (id) VALUES ('run-1');
  `);

  const longTransaction = spawn(psql, [
    databaseUri,
    "-X",
    "-v",
    "ON_ERROR_STOP=1",
    "-c",
    "BEGIN; INSERT INTO epic38_ingest_work VALUES (1, 'pending'); SELECT pg_sleep(4); COMMIT;",
  ], { stdio: "ignore" });

  await new Promise((resolve) => setTimeout(resolve, 500));
  const startedAt = Date.now();
  runSql("UPDATE epic38_import_runs SET heartbeat_at = '2026-09-19T12:00:00Z' WHERE id = 'run-1';");
  const heartbeat = runSql("SELECT heartbeat_at IS NOT NULL FROM epic38_import_runs WHERE id = 'run-1';");

  assert.equal(heartbeat, "t");
  assert.equal(longTransaction.exitCode, null);
  assert.ok(Date.now() - startedAt < 2500, "heartbeat must not wait for ingest transaction commit");
  await new Promise((resolve, reject) => {
    longTransaction.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`long transaction exited ${code}`)));
  });
  assert.equal(runSql("SELECT count(*) FROM epic38_ingest_work;"), "1");
});
