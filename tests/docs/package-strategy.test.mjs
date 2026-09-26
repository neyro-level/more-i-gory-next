import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relativePath) => readFileSync(path.join(projectRoot, relativePath), "utf8");

function walk(relativeDirectory) {
  const absoluteDirectory = path.join(projectRoot, relativeDirectory);
  return readdirSync(absoluteDirectory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") {
      return [];
    }
    const relativePath = path.join(relativeDirectory, entry.name).replaceAll("\\", "/");
    return entry.isDirectory() ? walk(relativePath) : [relativePath];
  });
}

test("FOLDER FORM is canonical and the inactive packages/ui workspace stays removed", () => {
  const architecture = read("docs/03_ARCHITECTURE.md");
  assert.match(architecture, /FOLDER FORM = canonical/);
  assert.match(architecture, /packages\/contracts/);
  assert.match(architecture, /packages\/ui` удалён/);
  assert.equal(existsSync(path.join(projectRoot, "packages/ui")), false);

  const contractsPackage = JSON.parse(read("packages/contracts/package.json"));
  assert.match(String(contractsPackage.description), /ACTIVE/);
  assert.equal(contractsPackage.dependencies.zod, "4.6.1");

  const workspace = read("pnpm-workspace.yaml");
  assert.match(workspace, /packages\/\*/);
  assert.doesNotMatch(read("pnpm-lock.yaml"), /^  packages\/ui:/m);

  const rootPackage = JSON.parse(read("package.json"));
  assert.equal(rootPackage.dependencies["@more-i-gory/ui"], undefined);
  assert.equal(rootPackage.dependencies["@more-i-gory/contracts"], "workspace:*");

  const uiImports = walk("src").filter((filePath) => {
    if (!/\.(?:[cm]?[jt]sx?)$/.test(filePath)) return false;
    return read(filePath).includes("@more-i-gory/ui");
  });
  assert.deepEqual(uiImports, []);
});
