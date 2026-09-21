import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

export const RUNTIME_RELEASE_ROOT = "/opt/moreigory/releases";
export const RUNTIME_CURRENT_LINK = "/opt/moreigory/current";

const SHA_RE = /^[0-9a-f]{40}$/i;

function assertPortableSymlinks(root) {
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const entryPath = join(root, entry.name);
    const stat = lstatSync(entryPath);
    if (stat.isSymbolicLink()) {
      const target = readlinkSync(entryPath);
      if (isAbsolute(target)) {
        throw new Error(`Packed release contains an absolute symlink: ${entryPath} -> ${target}`);
      }
      if (!existsSync(resolve(dirname(entryPath), target))) {
        throw new Error(`Packed release contains a dangling symlink: ${entryPath} -> ${target}`);
      }
      continue;
    }
    if (stat.isDirectory()) assertPortableSymlinks(entryPath);
  }
}

export function assertOffHostBuild({ cwd = process.cwd(), env = process.env } = {}) {
  const normalized = cwd.replaceAll("\\", "/");
  if (normalized === "/opt/moreigory" || normalized.startsWith("/opt/moreigory/")) {
    throw new Error("Build on the runtime host is forbidden. Pack a Linux standalone elsewhere.");
  }
  if (env.MOREIGORY_RUNTIME_HOST === "1") {
    throw new Error("MOREIGORY_RUNTIME_HOST=1 forbids packing a new build on this machine.");
  }
}

export function releaseDirForSha(sha) {
  if (!SHA_RE.test(sha)) {
    throw new Error(`Release SHA must be a 40-character git SHA, got ${sha}`);
  }
  return `${RUNTIME_RELEASE_ROOT}/${sha.toLowerCase()}`;
}

export function packStandaloneRelease({ sourceRoot, destRoot, sha }) {
  assertOffHostBuild();
  if (!SHA_RE.test(sha)) {
    throw new Error(`Release SHA must be a 40-character git SHA, got ${sha}`);
  }

  const standalone = join(sourceRoot, ".next", "standalone");
  const staticDir = join(sourceRoot, ".next", "static");
  const publicDir = join(sourceRoot, "public");

  if (!existsSync(join(standalone, "server.js"))) {
    throw new Error("Missing .next/standalone/server.js — run a Linux next build first.");
  }
  if (!existsSync(staticDir)) {
    throw new Error("Missing .next/static");
  }
  if (!existsSync(publicDir)) {
    throw new Error("Missing public/");
  }
  if (existsSync(destRoot) && readdirSync(destRoot).length > 0) {
    throw new Error(`Release output directory must be empty: ${destRoot}`);
  }

  mkdirSync(destRoot, { recursive: true });
  cpSync(standalone, destRoot, { recursive: true, verbatimSymlinks: true });
  mkdirSync(join(destRoot, ".next", "static"), { recursive: true });
  cpSync(staticDir, join(destRoot, ".next", "static"), { recursive: true });
  cpSync(publicDir, join(destRoot, "public"), { recursive: true });
  writeFileSync(
    join(destRoot, "RELEASE.json"),
    `${JSON.stringify({ artifactVersion: 1, layout: "next-standalone", nodeMajor: 24, sha: sha.toLowerCase() }, null, 2)}\n`,
  );

  return destRoot;
}

export function assertPackedRelease(destRoot, sha) {
  const meta = JSON.parse(readFileSync(join(destRoot, "RELEASE.json"), "utf8"));
  if (meta.sha !== sha.toLowerCase()) {
    throw new Error(`RELEASE.json sha ${meta.sha} does not match ${sha}`);
  }
  if (!existsSync(join(destRoot, "server.js"))) {
    throw new Error("Packed release is missing server.js");
  }
  if (!existsSync(join(destRoot, ".next", "static"))) {
    throw new Error("Packed release is missing .next/static");
  }
  if (!existsSync(join(destRoot, "public"))) {
    throw new Error("Packed release is missing public/");
  }
  assertPortableSymlinks(destRoot);
}

export function createReleaseArchive({ archivePath, destRoot }) {
  const result = spawnSync("tar", ["-czf", archivePath, "-C", destRoot, "."], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`tar failed with exit code ${result.status}: ${result.stderr.trim()}`);
  }

  const checksum = createHash("sha256").update(readFileSync(archivePath)).digest("hex");
  const checksumPath = `${archivePath}.sha256`;
  writeFileSync(checksumPath, `${checksum}  ${basename(archivePath)}\n`);
  return { archivePath, checksum, checksumPath };
}

export function resetDir(path) {
  rmSync(path, { recursive: true, force: true });
  mkdirSync(path, { recursive: true });
}
