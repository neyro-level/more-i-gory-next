import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { findUncoveredTestScripts } from "./lib/verify-quick-coverage.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(path.join(projectRoot, "package.json"), "utf8"));
const manifest = JSON.parse(
  readFileSync(path.join(projectRoot, "scripts/verify-quick-manifest.json"), "utf8"),
);

const missing = findUncoveredTestScripts({
  scripts: packageJson.scripts,
  manifest,
});

if (missing.length > 0) {
  throw new Error(
    `test:* scripts missing from verify:quick without a recorded exclusion: ${missing.join(", ")}`,
  );
}

console.log("verify:quick manifest covers every test:* script or a recorded exclusion.");
