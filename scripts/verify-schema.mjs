import { cpSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const verificationRoot = mkdtempSync(path.join(tmpdir(), "moreigori-schema-"));
const payloadBin = path.join(root, "node_modules", "payload", "bin.js");
const verificationEnv = {
  ...process.env,
  AMS_PROFILE: process.env.AMS_PROFILE ?? "REALTY_BASE",
  AMS_RUNTIME_CONTOUR: process.env.AMS_RUNTIME_CONTOUR ?? "staging",
  DATABASE_URI: process.env.DATABASE_URI ?? "postgresql://verify:verify@127.0.0.1:5432/moreigori_verify",
  JOBS_AUTORUN: process.env.JOBS_AUTORUN ?? "false",
  NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL ?? "http://127.0.0.1:4311",
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ?? "ci-validation-only-payload-secret-not-for-production",
  TZ: process.env.TZ ?? "Europe/Moscow",
};

function run(args) {
  return spawnSync(process.execPath, [payloadBin, ...args], {
    cwd: root,
    encoding: "utf8",
    env: { ...verificationEnv, PAYLOAD_SCHEMA_VERIFY_DIR: verificationRoot },
  });
}

function snapshot(directory) {
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const file = path.join(entry.parentPath, entry.name);
      return [path.relative(directory, file), readFileSync(file, "utf8")];
    })
    .sort(([left], [right]) => left.localeCompare(right));
}

function normalizeLineEndings(content) {
  return content.replaceAll("\r\n", "\n");
}

try {
  cpSync(path.join(root, "migrations"), path.join(verificationRoot, "migrations"), { recursive: true });

  const types = run(["generate:types"]);
  process.stdout.write(types.stdout ?? "");
  process.stderr.write(types.stderr ?? "");
  if (types.error) throw types.error;
  if (types.status !== 0) throw new Error("Payload type generation failed.");
  if (
    normalizeLineEndings(readFileSync(path.join(verificationRoot, "payload-types.ts"), "utf8")) !==
    normalizeLineEndings(readFileSync(path.join(root, "src", "payload-types.ts"), "utf8"))
  ) {
    throw new Error("Payload generated types drift from the committed src/payload-types.ts.");
  }

  const before = JSON.stringify(snapshot(path.join(verificationRoot, "migrations")));
  const migration = run(["migrate:create", "schema-drift", "--skip-empty"]);
  process.stdout.write(migration.stdout ?? "");
  process.stderr.write(migration.stderr ?? "");
  if (migration.error) throw migration.error;
  const after = JSON.stringify(snapshot(path.join(verificationRoot, "migrations")));
  const completedGeneration = migration.stdout.includes("Migration DOWN statements generation complete");
  if ((migration.status !== 0 && !completedGeneration) || before !== after) {
    throw new Error("Payload schema drift detected; generate and review a migration.");
  }

  console.log("Payload schema verification passed.");
} finally {
  rmSync(verificationRoot, { recursive: true, force: true });
}
