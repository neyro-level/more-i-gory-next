#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const token = process.argv[index];
  if (!token.startsWith("--")) continue;
  const [key, inline] = token.slice(2).split("=");
  args.set(key, inline ?? process.argv[index + 1]);
}

const sha = args.get("sha")?.toLowerCase();
const gateRunSlug = args.get("gate-run");
const previousSha = args.get("previous-sha")?.toLowerCase();
const storeReleaseTag = args.get("store-release-tag");
const artifactPath = resolve(args.get("artifact") ?? "");
const outPath = resolve(args.get("out") ?? "RELEASE_EVIDENCE.json");
const shaPattern = /^[0-9a-f]{40}$/u;

if (!shaPattern.test(sha ?? "")) throw new Error("--sha must be a full Git SHA");
if (!/^\d+$/u.test(gateRunSlug ?? "")) throw new Error("--gate-run must be a SourceCraft run slug");
if (!shaPattern.test(previousSha ?? "")) throw new Error("--previous-sha must be a full rollback SHA");
if (!/^[a-z0-9][a-z0-9._-]{2,127}$/u.test(storeReleaseTag ?? "")) {
  throw new Error("--store-release-tag is invalid");
}

const artifactBytes = readFileSync(artifactPath);
const checksum = createHash("sha256").update(artifactBytes).digest("hex");
const checksumPath = `${artifactPath}.sha256`;
const checksumLine = readFileSync(checksumPath, "utf8").trim();
if (checksumLine !== `${checksum}  ${basename(artifactPath)}`) {
  throw new Error("artifact checksum sidecar does not match the release unit");
}

const evidence = {
  contractVersion: 1,
  source: { provider: "sourcecraft", sha },
  gate: { runSlug: gateRunSlug, status: "api-verified-before-trigger" },
  artifact: {
    file: basename(artifactPath),
    checksumFile: basename(checksumPath),
    sha256: checksum,
    layout: "next-standalone",
  },
  durableStore: {
    kind: "sourcecraft-draft-release-attachment",
    releaseTag: storeReleaseTag,
    status: "upload-required-after-green-workflow",
  },
  rollback: { previousSha },
  production: { authorized: false, deployed: false },
};

writeFileSync(outPath, `${JSON.stringify(evidence, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(evidence)}\n`);
