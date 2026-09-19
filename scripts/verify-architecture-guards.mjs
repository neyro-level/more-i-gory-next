import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { assertArchitectureGuards } from "./lib/architecture-guards.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const codeFilePattern = /\.(?:[cm]?[jt]sx?)$/;

function walk(relativeDirectory) {
  const absoluteDirectory = path.join(projectRoot, relativeDirectory);
  return readdirSync(absoluteDirectory, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(relativeDirectory, entry.name);
    return entry.isDirectory() ? walk(relativePath) : [relativePath];
  });
}

const sourceRoots = ["src", "packages", "migrations"];
const files = [
  ...sourceRoots.flatMap((sourceRoot) => walk(sourceRoot)),
  ...walk("scripts").filter((filePath) => /^scripts[\\/][^\\/]+\.mjs$/.test(filePath) && !filePath.endsWith(".test.mjs")),
  "payload.config.ts",
  "next.config.ts",
  "src/app/(site)/globals.css",
]
  .filter((filePath) => codeFilePattern.test(filePath) || filePath === "src/app/(site)/globals.css")
  .map((filePath) => ({
    content: readFileSync(path.join(projectRoot, filePath), "utf8"),
    path: filePath,
  }));

const manifests = ["package.json", ...walk("packages").filter((filePath) => filePath.endsWith("package.json"))]
  .map((filePath) => ({
    manifest: JSON.parse(readFileSync(path.join(projectRoot, filePath), "utf8")),
    path: filePath,
  }));

const uiContract = JSON.parse(
  readFileSync(path.join(projectRoot, "scripts", "ui-upstream-exceptions.json"), "utf8"),
);

assertArchitectureGuards({ files, manifests, uiContract });
console.log("Architecture guards passed.");
