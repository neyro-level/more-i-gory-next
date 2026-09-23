import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { assertGitState } from "../ops/runtime/single-db-migration.mjs";

export const SEED_CONFIRMATION = "SEED_TECHNICAL_PREVIEW_DB_PROOF";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

function fail(message) {
  throw new Error(message);
}

export function parseSeedArguments(argv) {
  const values = new Map();
  for (const option of argv) {
    const match = /^--([a-z-]+)=(.*)$/u.exec(option);
    if (!match) fail(`Unsupported argument: ${option}`);
    if (values.has(match[1])) fail(`Duplicate argument: --${match[1]}`);
    values.set(match[1], match[2]);
  }
  const expectedSha = values.get("expected-sha") ?? "";
  if (!/^[0-9a-f]{40}$/u.test(expectedSha)) fail("--expected-sha must be a full lowercase Git SHA.");
  if (values.get("confirm") !== SEED_CONFIRMATION) fail(`Seed requires --confirm=${SEED_CONFIRMATION}.`);
  for (const key of values.keys()) {
    if (!new Set(["expected-sha", "confirm"]).has(key)) fail(`Unsupported argument: --${key}`);
  }
  return { expectedSha };
}

function git(args) {
  const result = spawnSync("git", args, { encoding: "utf8", windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) fail(`git failed with exit code ${result.status}.`);
  return result.stdout ?? "";
}

export function assertPreviewContour(source) {
  if (source.AMS_RUNTIME_CONTOUR !== "staging") fail("Preview proof seed requires AMS_RUNTIME_CONTOUR=staging.");
  if (source.NEXT_PUBLIC_SERVER_URL !== "https://more-previu.tw1.ru") {
    fail("Preview proof seed is pinned to https://more-previu.tw1.ru.");
  }
}

export async function seedPreviewDbProof(argv = process.argv.slice(2), source = process.env) {
  const { expectedSha } = parseSeedArguments(argv);
  assertPreviewContour(source);
  assertGitState({
    actualSha: git(["rev-parse", "HEAD"]).trim(),
    expectedSha,
    status: git(["status", "--porcelain=v1", "--untracked-files=all"]),
  });

  const [{ getPayload }, { default: config }, { upsertPreviewProofRecords }] = await Promise.all([
    import("payload"),
    import("../payload.config.ts"),
    import("../src/core/data-access/system/seed-preview-proof.ts"),
  ]);
  const payload = await getPayload({ config });
  try {
    const result = await upsertPreviewProofRecords(payload);
    process.stdout.write(`${JSON.stringify({
      draft: result.draft.outcome,
      published: result.published.outcome,
      verdict: "PASS",
    })}\n`);
  } finally {
    await payload.destroy();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await seedPreviewDbProof();
  } catch {
    process.stderr.write("seed-preview-db-proof: operation failed; details redacted\n");
    process.exitCode = 1;
  }
}
