import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const rollback = readFileSync(new URL("../ops/runtime/rollback-release.sh", import.meta.url), "utf8");
const install = readFileSync(new URL("../ops/runtime/install-release.sh", import.meta.url), "utf8");
const operations = readFileSync(new URL("../docs/OPERATIONS.md", import.meta.url), "utf8");

test("rollback switches current to previous, restarts, and smokes without rebuild", () => {
  assert.match(rollback, /Atomic rollback: current → previous release, restart, smoke/);
  assert.match(rollback, /mv -Tf "\$CURRENT_CANDIDATE" "\$ROOT\/current"/);
  assert.match(rollback, /restoring the original current release/);
  assert.match(rollback, /systemctl restart moreigory/);
  assert.match(rollback, /curl -fsS -o \/dev\/null "\$SMOKE_URL"/);
  assert.doesNotMatch(rollback, /^\s*next build/m);
  assert.doesNotMatch(rollback, /^\s*pnpm /m);
  assert.match(install, /mv -Tf "\$PREVIOUS_CANDIDATE" "\$ROOT\/previous"/);
  assert.match(operations, /current → previous release/);
  assert.match(operations, /ops\/runtime\/rollback-release\.sh/);
});

function createRuntimeFixture() {
  const fixture = mkdtempSync(join(tmpdir(), "moreigory-rollback-"));
  const root = join(fixture, "runtime");
  const bin = join(fixture, "bin");
  const current = join(root, "releases", "a".repeat(40));
  const previous = join(root, "releases", "b".repeat(40));
  mkdirSync(current, { recursive: true });
  mkdirSync(previous, { recursive: true });
  mkdirSync(bin, { recursive: true });
  for (const release of [current, previous]) {
    writeFileSync(join(release, "server.js"), "fixture\n");
    writeFileSync(
      join(release, "RELEASE.json"),
      `${JSON.stringify({
        artifactVersion: 1,
        layout: "next-standalone",
        nodeMajor: 24,
        sha: release.split(/[\\/]/u).at(-1),
      })}\n`,
    );
  }
  symlinkSync(current, join(root, "current"));
  symlinkSync(previous, join(root, "previous"));
  writeFileSync(join(bin, "systemctl"), "#!/usr/bin/env bash\nexit 0\n");
  writeFileSync(join(bin, "curl"), "#!/usr/bin/env bash\nexit ${MOREIGORY_TEST_CURL_EXIT:-0}\n");
  chmodSync(join(bin, "systemctl"), 0o755);
  chmodSync(join(bin, "curl"), 0o755);
  return { bin, current, fixture, previous, root };
}

test("rollback swaps current and previous after a successful smoke", { skip: process.platform === "win32" }, () => {
  const fixture = createRuntimeFixture();
  execFileSync("bash", [new URL("../ops/runtime/rollback-release.sh", import.meta.url).pathname], {
    env: {
      ...process.env,
      MOREIGORY_ALLOW_NONCANONICAL_ROOT: "1",
      MOREIGORY_ROOT: fixture.root,
      PATH: `${fixture.bin}:${process.env.PATH}`,
    },
  });
  assert.equal(readlinkSync(join(fixture.root, "current")), fixture.previous);
  assert.equal(readlinkSync(join(fixture.root, "previous")), fixture.current);
});

test("failed rollback smoke restores the original current pointer", { skip: process.platform === "win32" }, () => {
  const fixture = createRuntimeFixture();
  const result = spawnSync("bash", [new URL("../ops/runtime/rollback-release.sh", import.meta.url).pathname], {
    encoding: "utf8",
    env: {
      ...process.env,
      MOREIGORY_ALLOW_NONCANONICAL_ROOT: "1",
      MOREIGORY_ROOT: fixture.root,
      MOREIGORY_TEST_CURL_EXIT: "1",
      PATH: `${fixture.bin}:${process.env.PATH}`,
    },
  });
  assert.notEqual(result.status, 0);
  assert.equal(readlinkSync(join(fixture.root, "current")), fixture.current);
  assert.equal(readlinkSync(join(fixture.root, "previous")), fixture.previous);
});
