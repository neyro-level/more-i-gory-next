import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  APPLY_CONFIRMATION,
  EXPECTED_MIGRATION_COUNT,
  EXPECTED_PUBLIC_TABLE_COUNT,
  assertGitState,
  buildPsqlEnvironment,
  parseArguments,
  parseSingleJsonLine,
  readRegisteredMigrationNames,
  validatePostMigrationState,
  validatePreflightRecord,
} from "../ops/runtime/single-db-migration.mjs";

const sha = "a".repeat(40);
const emptyTarget = {
  database: "default_db",
  server_version_num: 180006,
  public_tables: 0,
  migration_table: false,
};

test("operator defaults to read-only preflight and apply needs an explicit confirmation", () => {
  assert.deepEqual(parseArguments(["preflight", `--expected-sha=${sha}`]), { mode: "preflight", expectedSha: sha });
  assert.throws(() => parseArguments(["apply", `--expected-sha=${sha}`]), /Apply requires/);
  assert.deepEqual(
    parseArguments(["apply", `--expected-sha=${sha}`, `--confirm=${APPLY_CONFIRMATION}`]),
    { mode: "apply", expectedSha: sha },
  );
});

test("operator rejects wrong SHA and dirty checkout before database access", () => {
  assert.throws(() => assertGitState({ actualSha: "b".repeat(40), expectedSha: sha, status: "" }), /HEAD/);
  assert.throws(() => assertGitState({ actualSha: sha, expectedSha: sha, status: " M payload.config.ts" }), /not clean/);
  assert.doesNotThrow(() => assertGitState({ actualSha: sha, expectedSha: sha, status: "" }));
});

test("preflight accepts only the exact empty and unmigrated PostgreSQL 18 target", () => {
  assert.deepEqual(validatePreflightRecord(emptyTarget, "default_db"), {
    database: "default_db",
    postgresMajor: 18,
    publicTables: 0,
  });
  assert.throws(() => validatePreflightRecord({ ...emptyTarget, database: "other" }, "default_db"), /identity/);
  assert.throws(() => validatePreflightRecord({ ...emptyTarget, server_version_num: 170010 }, "default_db"), /version/);
  assert.throws(() => validatePreflightRecord({ ...emptyTarget, public_tables: 1 }, "default_db"), /Public tables/);
  assert.throws(() => validatePreflightRecord({ ...emptyTarget, migration_table: true }, "default_db"), /history/);
  assert.throws(() => validatePreflightRecord({ ...emptyTarget, migration_table: null }, "default_db"), /history/);
});

test("database query parser rejects malformed or extra output", () => {
  assert.deepEqual(parseSingleJsonLine('{"ok":true}\n', "fixture"), { ok: true });
  assert.throws(() => parseSingleJsonLine("{}\n{}\n", "fixture"), /ambiguous/);
  assert.throws(() => parseSingleJsonLine("not-json", "fixture"), /valid JSON/);
});

test("DATABASE_URI is required and credentials are moved to libpq environment", () => {
  assert.throws(() => buildPsqlEnvironment(""), /required/);
  const fixtureUri = ["postgresql://app", "p%40ss@127.0.0.1:5432/default_db?sslmode=require"].join(":");
  const env = buildPsqlEnvironment(fixtureUri, {});
  assert.deepEqual(
    { host: env.PGHOST, port: env.PGPORT, user: env.PGUSER, password: env.PGPASSWORD, database: env.PGDATABASE, ssl: env.PGSSLMODE },
    { host: "127.0.0.1", port: "5432", user: "app", password: "p@ss", database: "default_db", ssl: "require" },
  );
});

test("registered and applied migration ledgers must match exactly", () => {
  const indexSource = readFileSync(new URL("../migrations/index.ts", import.meta.url), "utf8");
  const names = readRegisteredMigrationNames(indexSource);
  assert.equal(names.length, EXPECTED_MIGRATION_COUNT);
  const after = { database: "default_db", public_tables: EXPECTED_PUBLIC_TABLE_COUNT, migration_table: true };
  assert.doesNotThrow(() => validatePostMigrationState(after, names, names, "default_db"));
  assert.throws(() => validatePostMigrationState({ ...after, public_tables: 1 }, names, names, "default_db"), /table count/);
  assert.throws(() => validatePostMigrationState(after, names.slice(1), names, "default_db"), /ledger count/);
  assert.throws(() => validatePostMigrationState(after, [...names].reverse(), names, "default_db"), /order\/content/);
});
