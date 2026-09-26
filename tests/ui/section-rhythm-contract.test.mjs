import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const sourceRoot = "src";
const walk = (directory) => readdirSync(directory).flatMap((entry) => {
  const path = join(directory, entry);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const sourceFiles = walk(sourceRoot).filter((path) => /\.(?:ts|tsx)$/.test(path));
const exceptions = JSON.parse(readFileSync("scripts/ui-section-rhythm-exceptions.json", "utf8"));
const shell = readFileSync("src/components/layout/section-shell.tsx", "utf8");

test("SectionShell exposes one named additive rhythm API with md default", () => {
  assert.match(shell, /rhythm\?: "sm" \| "md" \| "lg" \| "hero"/);
  assert.match(shell, /rhythm = "md"/);
  for (const [name, utility] of Object.entries({ sm: "py-section-sm", md: "py-section-md", lg: "py-section-lg", hero: "py-section-hero" })) {
    assert.match(shell, new RegExp(`${name}: "${utility}"`));
  }
  assert.doesNotMatch(shell, /"zero"|"tiny2"|"custom"/);
});

test("SectionShell consumers do not bypass rhythm with direct vertical padding", () => {
  assert.deepEqual(exceptions.exceptions, []);
  for (const file of sourceFiles) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /<SectionShell\b[^>]*\bclassName\s*=\s*["'][^"']*\b(?:pt|pb|py)-/s, file);
  }
});
