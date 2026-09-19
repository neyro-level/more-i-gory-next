import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  assertOffHostBuild,
  assertPackedRelease,
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
  assert.equal(readFileSync(join(dest, "server.js"), "utf8").includes("ok"), true);
  assert.equal(readFileSync(join(dest, ".next", "static", "chunks", "app.js"), "utf8").includes("hashed"), true);
});
