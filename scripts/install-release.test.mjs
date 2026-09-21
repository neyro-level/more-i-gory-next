import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const script = readFileSync(new URL("../ops/runtime/install-release.sh", import.meta.url), "utf8");
const operations = readFileSync(new URL("../docs/OPERATIONS.md", import.meta.url), "utf8");

test("install-release verifies and installs a tarball into /opt/moreigory/releases/<sha>", () => {
  assert.match(script, /DEST="\$ROOT\/releases\/\$SHA"/);
  assert.match(script, /artifact checksum mismatch/);
  assert.match(script, /artifact contains an unsafe path/);
  assert.match(script, /release manifest does not match the artifact contract/);
  assert.match(script, /mv -Tf "\$CURRENT_CANDIDATE" "\$ROOT\/current"/);
  assert.match(script, /Do not compile the app on the runtime host/);
  assert.doesNotMatch(script, /^\s*pnpm /m);
  assert.doesNotMatch(script, /^\s*next build/m);
  assert.match(operations, /\/opt\/moreigory\/releases\/<sha>/);
  assert.match(operations, /Build happens off the runtime host/);
});

function createArtifact(root, sha) {
  mkdirSync(root, { recursive: true });
  const release = join(root, "release");
  const archive = join(root, "release.tar.gz");
  mkdirSync(join(release, ".next", "static"), { recursive: true });
  mkdirSync(join(release, "public"), { recursive: true });
  writeFileSync(join(release, "server.js"), "console.log('fixture')\n");
  writeFileSync(
    join(release, "RELEASE.json"),
    `${JSON.stringify({ artifactVersion: 1, layout: "next-standalone", nodeMajor: 24, sha })}\n`,
  );
  execFileSync("tar", ["-czf", archive, "-C", release, "."]);
  const digest = createHash("sha256").update(readFileSync(archive)).digest("hex");
  writeFileSync(`${archive}.sha256`, `${digest}  release.tar.gz\n`);
  return archive;
}

test("installer verifies and atomically switches a valid immutable release", {
  skip: process.platform === "win32",
}, () => {
  const fixture = mkdtempSync(join(tmpdir(), "moreigory-install-"));
  const root = join(fixture, "runtime");
  const sha = "a".repeat(40);
  const archive = createArtifact(fixture, sha);

  execFileSync("bash", [new URL("../ops/runtime/install-release.sh", import.meta.url).pathname, sha, archive], {
    env: {
      ...process.env,
      MOREIGORY_ALLOW_NONCANONICAL_ROOT: "1",
      MOREIGORY_ROOT: root,
    },
  });

  assert.equal(readlinkSync(join(root, "current")), join(root, "releases", sha));
  assert.equal(JSON.parse(readFileSync(join(root, "current", "RELEASE.json"), "utf8")).sha, sha);

  const nextSha = "c".repeat(40);
  const nextArchive = createArtifact(join(fixture, "next"), nextSha);
  execFileSync("bash", [new URL("../ops/runtime/install-release.sh", import.meta.url).pathname, nextSha, nextArchive], {
    env: {
      ...process.env,
      MOREIGORY_ALLOW_NONCANONICAL_ROOT: "1",
      MOREIGORY_ROOT: root,
    },
  });
  assert.equal(readlinkSync(join(root, "current")), join(root, "releases", nextSha));
  assert.equal(readlinkSync(join(root, "previous")), join(root, "releases", sha));
});

test("installer fails closed before switching on checksum drift", {
  skip: process.platform === "win32",
}, () => {
  const fixture = mkdtempSync(join(tmpdir(), "moreigory-install-drift-"));
  const root = join(fixture, "runtime");
  const sha = "b".repeat(40);
  const archive = createArtifact(fixture, sha);
  writeFileSync(`${archive}.sha256`, `${"0".repeat(64)}  release.tar.gz\n`);

  const result = spawnSync("bash", [new URL("../ops/runtime/install-release.sh", import.meta.url).pathname, sha, archive], {
    encoding: "utf8",
    env: {
      ...process.env,
      MOREIGORY_ALLOW_NONCANONICAL_ROOT: "1",
      MOREIGORY_ROOT: root,
    },
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /checksum mismatch/);
});

test("installer rejects a checksum-valid artifact with the wrong manifest SHA", {
  skip: process.platform === "win32",
}, () => {
  const fixture = mkdtempSync(join(tmpdir(), "moreigory-install-manifest-"));
  const root = join(fixture, "runtime");
  const requestedSha = "d".repeat(40);
  const archive = createArtifact(fixture, "e".repeat(40));
  const result = spawnSync(
    "bash",
    [new URL("../ops/runtime/install-release.sh", import.meta.url).pathname, requestedSha, archive],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        MOREIGORY_ALLOW_NONCANONICAL_ROOT: "1",
        MOREIGORY_ROOT: root,
      },
    },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /release manifest does not match/);
});
