import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export const RUNTIME_RELEASE_ROOT = "/opt/moreigory/releases";
export const RUNTIME_CURRENT_LINK = "/opt/moreigory/current";

const SHA_RE = /^[0-9a-f]{40}$/i;

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

  mkdirSync(destRoot, { recursive: true });
  cpSync(standalone, destRoot, { recursive: true });
  mkdirSync(join(destRoot, ".next", "static"), { recursive: true });
  cpSync(staticDir, join(destRoot, ".next", "static"), { recursive: true });
  cpSync(publicDir, join(destRoot, "public"), { recursive: true });
  writeFileSync(
    join(destRoot, "RELEASE.json"),
    `${JSON.stringify({ sha: sha.toLowerCase(), layout: "next-standalone" }, null, 2)}\n`,
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
}

export function resetDir(path) {
  rmSync(path, { recursive: true, force: true });
  mkdirSync(path, { recursive: true });
}
