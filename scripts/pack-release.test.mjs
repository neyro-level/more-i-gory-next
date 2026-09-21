import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import test from "node:test";

import {
  assertOffHostBuild,
  assertPackedRelease,
  createReleaseArchive,
  packStandaloneRelease,
  releaseDirForSha,
  resetDir,
} from "./lib/pack-release.mjs";

const sha = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";

test("release path is /opt/moreigory/releases/<sha>", () => {
  assert.equal(releaseDirForSha(sha), `/opt/moreigory/releases/${sha}`);
});

test("packing on the runtime host is forbidden", () => {
  assert.throws(() => assertOffHostBuild({ cwd: "/opt/moreigory/current" }));
  assert.throws(() => assertOffHostBuild({ env: { MOREIGORY_RUNTIME_HOST: "1" } }));
});

test("packStandaloneRelease copies standalone, static, public and SHA metadata", () => {
  const source = mkdtempSync(join(tmpdir(), "mig-src-"));
  const dest = mkdtempSync(join(tmpdir(), "mig-dst-"));
  mkdirSync(join(source, ".next", "standalone"), { recursive: true });
  mkdirSync(join(source, ".next", "static", "chunks"), { recursive: true });
  mkdirSync(join(source, "public"), { recursive: true });
  writeFileSync(join(source, ".next", "standalone", "server.js"), "console.log('ok')\n");
  writeFileSync(join(source, ".next", "static", "chunks", "app.js"), "/* hashed */\n");
  writeFileSync(join(source, "public", "favicon.ico"), "x");

  resetDir(dest);
  packStandaloneRelease({ sourceRoot: source, destRoot: dest, sha });
  assertPackedRelease(dest, sha);

  const meta = JSON.parse(readFileSync(join(dest, "RELEASE.json"), "utf8"));
  assert.equal(meta.layout, "next-standalone");
  assert.equal(meta.artifactVersion, 1);
  assert.equal(meta.nodeMajor, 24);
  assert.equal(readFileSync(join(dest, "server.js"), "utf8").includes("ok"), true);
  assert.equal(readFileSync(join(dest, ".next", "static", "chunks", "app.js"), "utf8").includes("hashed"), true);
});

test("packStandaloneRelease rejects a non-empty output directory", () => {
  const source = mkdtempSync(join(tmpdir(), "mig-src-"));
  const dest = mkdtempSync(join(tmpdir(), "mig-dst-"));
  mkdirSync(join(source, ".next", "standalone"), { recursive: true });
  mkdirSync(join(source, ".next", "static"), { recursive: true });
  mkdirSync(join(source, "public"), { recursive: true });
  writeFileSync(join(source, ".next", "standalone", "server.js"), "console.log('ok')\n");
  writeFileSync(join(dest, "stale-file"), "stale\n");

  assert.throws(
    () => packStandaloneRelease({ sourceRoot: source, destRoot: dest, sha }),
    /must be empty/,
  );
});

test("packing preserves pnpm relative symlinks and rejects builder-absolute links", {
  skip: process.platform === "win32",
}, () => {
  const source = mkdtempSync(join(tmpdir(), "mig-link-src-"));
  const dest = mkdtempSync(join(tmpdir(), "mig-link-dst-"));
  const nextTarget = join(source, ".next", "standalone", "node_modules", ".pnpm", "next", "node_modules", "next");
  mkdirSync(nextTarget, { recursive: true });
  mkdirSync(join(source, ".next", "static"), { recursive: true });
  mkdirSync(join(source, "public"), { recursive: true });
  writeFileSync(join(source, ".next", "standalone", "server.js"), "require('next')\n");
  writeFileSync(join(nextTarget, "package.json"), "{}\n");
  symlinkSync(".pnpm/next/node_modules/next", join(source, ".next", "standalone", "node_modules", "next"));

  resetDir(dest);
  packStandaloneRelease({ sourceRoot: source, destRoot: dest, sha });
  assert.equal(readlinkSync(join(dest, "node_modules", "next")), ".pnpm/next/node_modules/next");
  assertPackedRelease(dest, sha);

  symlinkSync(source, join(dest, "node_modules", "absolute-builder-link"));
  assert.throws(() => assertPackedRelease(dest, sha), /absolute symlink/);
});

test("release archive has a SHA-256 sidecar", () => {
  const source = mkdtempSync(join(tmpdir(), "mig-archive-src-"));
  const archivePath = join(tmpdir(), `moreigory-${Date.now()}.tar.gz`);
  writeFileSync(join(source, "RELEASE.json"), "{}\n");
  const result = createReleaseArchive({ archivePath, destRoot: source });

  assert.equal(result.checksum.length, 64);
  assert.equal(existsSync(result.archivePath), true);
  assert.equal(readFileSync(result.checksumPath, "utf8"), `${result.checksum}  ${basename(archivePath)}\n`);
});
