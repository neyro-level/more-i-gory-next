import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const sha = "a".repeat(40);
const previousSha = "b".repeat(40);

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "moreigory-release-evidence-"));
  const artifact = join(root, "release.tar.gz");
  const out = join(root, "RELEASE_EVIDENCE.json");
  writeFileSync(artifact, "immutable-release-fixture");
  const checksum = createHash("sha256").update(readFileSync(artifact)).digest("hex");
  writeFileSync(`${artifact}.sha256`, `${checksum}  release.tar.gz\n`);
  return { artifact, checksum, out };
}

test("release evidence binds gate, exact SHA, checksum, durable store and rollback identity", () => {
  const data = fixture();
  execFileSync(process.execPath, [
    "scripts/write-release-evidence.mjs",
    "--artifact", data.artifact,
    "--sha", sha,
    "--gate-run", "156",
    "--previous-sha", previousSha,
    "--store-release-tag", `candidate-${sha}`,
    "--out", data.out,
  ]);
  const evidence = JSON.parse(readFileSync(data.out, "utf8"));
  assert.equal(evidence.source.sha, sha);
  assert.equal(evidence.gate.runSlug, "156");
  assert.equal(evidence.artifact.sha256, data.checksum);
  assert.equal(evidence.durableStore.kind, "sourcecraft-draft-release-attachment");
  assert.equal(evidence.rollback.previousSha, previousSha);
  assert.deepEqual(evidence.production, { authorized: false, deployed: false });
});

test("release evidence fails closed on checksum drift", () => {
  const data = fixture();
  writeFileSync(`${data.artifact}.sha256`, `${"0".repeat(64)}  release.tar.gz\n`);
  const result = spawnSync(process.execPath, [
    "scripts/write-release-evidence.mjs",
    "--artifact", data.artifact,
    "--sha", sha,
    "--gate-run", "156",
    "--previous-sha", previousSha,
    "--store-release-tag", `candidate-${sha}`,
    "--out", data.out,
  ], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /checksum sidecar does not match/u);
});
