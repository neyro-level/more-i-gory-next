import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const full = join(directory, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const sourceFiles = walk("src").filter((file) => /\.(ts|tsx)$/.test(file) && !file.includes(`${join("src", "app", "(payload)")}`));

test("project UI has one Button/control system", () => {
  const variantsOwners = sourceFiles.filter((file) => readFileSync(file, "utf8").includes("const buttonVariants = cva("));
  assert.deepEqual(variantsOwners, [join("src", "lib", "button-variants.ts")]);

  const buttonOwners = sourceFiles.filter((file) => /\bfunction Button\b/.test(readFileSync(file, "utf8")));
  assert.deepEqual(buttonOwners, [join("src", "components", "ui", "button.tsx")]);

  const forbiddenNames = /(?:Hero|Blue|CTA|Primary|Secondary)Button\b/;
  const nativeButtons = [];
  const parallelButtons = [];

  for (const file of sourceFiles) {
    const source = readFileSync(file, "utf8");
    if (forbiddenNames.test(source)) parallelButtons.push(file);
    if (/<button\b/.test(source)) nativeButtons.push(file);
  }

  assert.deepEqual(parallelButtons, [], "no parallel named button components");
  assert.deepEqual(nativeButtons, [], "no native button markup outside canonical Button");

  const actionLink = readFileSync("src/components/navigation/action-link.tsx", "utf8");
  assert.match(actionLink, /from "@\/lib\/button-variants"/);
  assert.match(actionLink, /buttonVariants\(/);

  const leadForm = readFileSync("src/ui/interactive/lead-form-client.tsx", "utf8");
  assert.match(leadForm, /from "@\/components\/ui\/button"/);
  assert.match(leadForm, /<Button\b/);
});
