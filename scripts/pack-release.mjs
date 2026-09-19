#!/usr/bin/env node
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { packStandaloneRelease } from "./lib/pack-release.mjs";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const token = process.argv[i];
  if (!token.startsWith("--")) continue;
  const [key, inline] = token.slice(2).split("=");
  args.set(key, inline ?? process.argv[i + 1]);
}

const sourceRoot = resolve(args.get("from") ?? process.cwd());
const sha = args.get("sha");
const destRoot = resolve(args.get("out") ?? `${sourceRoot}/dist/release-${sha}`);

if (!sha) {
  console.error("usage: node scripts/pack-release.mjs --from <build-root> --sha <40-char> --out <dir>");
  process.exit(1);
}

mkdirSync(destRoot, { recursive: true });
packStandaloneRelease({ sourceRoot, destRoot, sha });
console.log(`packed ${sha} -> ${destRoot}`);
