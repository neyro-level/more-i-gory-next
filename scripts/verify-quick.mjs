import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildVerifyQuickPlan } from "./lib/verify-quick-coverage.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(path.join(projectRoot, "package.json"), "utf8"));
const manifest = JSON.parse(
  readFileSync(path.join(projectRoot, "scripts", "verify-quick-manifest.json"), "utf8"),
);
const pnpmCli = process.env.npm_execpath;

if (!pnpmCli) throw new Error("pnpm verify:quick must be started through pnpm.");

const plan = buildVerifyQuickPlan({ manifest, scripts: packageJson.scripts });

for (const script of plan) {
  console.log(`[verify:quick] ${script}`);
  const result = spawnSync(process.execPath, [pnpmCli, script], {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
