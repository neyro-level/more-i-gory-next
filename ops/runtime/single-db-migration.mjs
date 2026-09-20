#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const EXPECTED_DATABASE = "default_db";
export const EXPECTED_POSTGRES_MAJOR = 18;
export const EXPECTED_MIGRATION_COUNT = 26;
export const EXPECTED_PUBLIC_TABLE_COUNT = 148;
export const APPLY_CONFIRMATION = "APPLY_SINGLE_DB_MIGRATIONS";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function fail(message) {
  throw new Error(message);
}

export function parseArguments(argv) {
  const [mode = "preflight", ...options] = argv;
  if (!new Set(["preflight", "apply"]).has(mode)) fail("Mode must be preflight or apply.");

  const values = new Map();
  for (const option of options) {
    const match = /^--([a-z-]+)=(.*)$/.exec(option);
    if (!match) fail(`Unsupported argument: ${option}`);
    if (values.has(match[1])) fail(`Duplicate argument: --${match[1]}`);
    values.set(match[1], match[2]);
  }

  const expectedSha = values.get("expected-sha") ?? "";
  if (!/^[0-9a-f]{40}$/.test(expectedSha)) fail("--expected-sha must be a full lowercase Git SHA.");
  if (mode === "apply" && values.get("confirm") !== APPLY_CONFIRMATION) {
    fail(`Apply requires --confirm=${APPLY_CONFIRMATION}.`);
  }
  if (mode === "preflight" && values.has("confirm")) fail("Preflight does not accept --confirm.");
  for (const key of values.keys()) {
    if (!new Set(["expected-sha", "confirm"]).has(key)) fail(`Unsupported argument: --${key}`);
  }
  return { mode, expectedSha };
}

export function assertGitState({ actualSha, expectedSha, status }) {
  if (actualSha !== expectedSha) fail("Checkout HEAD does not match --expected-sha.");
  if (status.trim()) fail("Checkout is not clean; refusing database operation.");
}

export function parseSingleJsonLine(stdout, label) {
  const lines = stdout.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean);
  if (lines.length !== 1) fail(`${label} returned an ambiguous result.`);
  try {
    return JSON.parse(lines[0]);
  } catch {
    fail(`${label} did not return valid JSON.`);
  }
}

export function validatePreflightRecord(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) fail("Preflight result is malformed.");
  if (record.database !== EXPECTED_DATABASE) fail("Database identity mismatch.");
  const versionNumber = Number(record.server_version_num);
  if (!Number.isInteger(versionNumber) || Math.floor(versionNumber / 10000) !== EXPECTED_POSTGRES_MAJOR) {
    fail("PostgreSQL major version mismatch.");
  }
  if (Number(record.public_tables) !== 0) fail("Public tables already exist; stop before DDL.");
  if (record.migration_table !== false) fail("Migration history exists or is ambiguous; stop before DDL.");
  return { database: record.database, postgresMajor: EXPECTED_POSTGRES_MAJOR, publicTables: 0 };
}

export function readRegisteredMigrationNames(indexSource) {
  const names = [...indexSource.matchAll(/name:\s*'([^']+)'/gu)].map((match) => match[1]);
  if (names.length !== EXPECTED_MIGRATION_COUNT) fail("Committed migration count mismatch.");
  if (new Set(names).size !== names.length) fail("Committed migration names are not unique.");
  return names;
}

export function validatePostMigrationState(record, appliedNames, expectedNames) {
  if (record.database !== EXPECTED_DATABASE) fail("Post-migration database identity mismatch.");
  if (Number(record.public_tables) !== EXPECTED_PUBLIC_TABLE_COUNT) fail("Post-migration table count mismatch.");
  if (record.migration_table !== true) fail("Payload migration ledger is absent after apply.");
  if (!Array.isArray(appliedNames) || appliedNames.length !== expectedNames.length) {
    fail("Applied migration ledger count mismatch.");
  }
  if (appliedNames.some((name, index) => name !== expectedNames[index])) {
    fail("Applied migration ledger order/content mismatch.");
  }
}

export function buildPsqlEnvironment(databaseUri, baseEnv = process.env) {
  if (!databaseUri) fail("DATABASE_URI is required.");
  let url;
  try {
    url = new URL(databaseUri);
  } catch {
    fail("DATABASE_URI is not a valid URL.");
  }
  if (!new Set(["postgres:", "postgresql:"]).has(url.protocol)) fail("DATABASE_URI must use PostgreSQL.");
  const database = decodeURIComponent(url.pathname.replace(/^\//u, ""));
  if (!url.hostname || !url.username || !url.password || !database) fail("DATABASE_URI is incomplete.");

  const env = {
    ...baseEnv,
    PGHOST: url.hostname,
    PGPORT: url.port || "5432",
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
    PGDATABASE: database,
  };
  const sslMode = url.searchParams.get("sslmode");
  if (sslMode) env.PGSSLMODE = sslMode;
  return env;
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 4 * 1024 * 1024,
    ...options,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) fail(`${command} failed with exit code ${result.status}.`);
  return result.stdout ?? "";
}

function query(sql, env) {
  const psql = process.platform === "win32" ? "psql.exe" : "psql";
  return parseSingleJsonLine(
    run(psql, ["-X", "-q", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-c", sql], { env }),
    "Database query",
  );
}

function inspectTarget(env) {
  return query(
    `SELECT json_build_object(
      'database', current_database(),
      'server_version_num', current_setting('server_version_num')::int,
      'public_tables', (SELECT count(*)::int FROM pg_tables WHERE schemaname = 'public'),
      'migration_table', to_regclass('public.payload_migrations') IS NOT NULL
    )::text;`,
    env,
  );
}

function inspectAppliedNames(env) {
  return query(
    `SELECT coalesce(json_agg(name ORDER BY batch, id), '[]'::json)::text
     FROM public.payload_migrations;`,
    env,
  );
}

export function main(argv = process.argv.slice(2), environment = process.env) {
  const { mode, expectedSha } = parseArguments(argv);
  const actualSha = run("git", ["rev-parse", "HEAD"]).trim();
  const status = run("git", ["status", "--porcelain=v1", "--untracked-files=all"]);
  assertGitState({ actualSha, expectedSha, status });

  const expectedNames = readRegisteredMigrationNames(readFileSync(path.join(root, "migrations/index.ts"), "utf8"));
  const pgEnv = buildPsqlEnvironment(environment.DATABASE_URI, environment);
  const before = validatePreflightRecord(inspectTarget(pgEnv));

  if (mode === "preflight") {
    process.stdout.write(`${JSON.stringify({ verdict: "PASS", mode, head: actualSha, ...before, migrations: expectedNames.length })}\n`);
    return;
  }

  const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  run(pnpm, ["payload:migrate"], { env: environment, stdio: "inherit" });
  const after = inspectTarget(pgEnv);
  const appliedNames = inspectAppliedNames(pgEnv);
  validatePostMigrationState(after, appliedNames, expectedNames);
  process.stdout.write(`${JSON.stringify({
    verdict: "PASS",
    mode,
    head: actualSha,
    database: EXPECTED_DATABASE,
    postgresMajor: EXPECTED_POSTGRES_MAJOR,
    migrations: expectedNames.length,
    publicTables: Number(after.public_tables),
  })}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`single-db-migration: ${error instanceof Error ? error.message : "unknown failure"}\n`);
    process.exitCode = 1;
  }
}
