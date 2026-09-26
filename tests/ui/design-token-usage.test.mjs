import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { findDeadThemeTokens, themeTokens } from "../../scripts/lib/ui-token-policy.mjs";

const walk = (directory) => readdirSync(directory).flatMap((entry) => {
  const path = join(directory, entry);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const globalsCss = readFileSync("src/app/(site)/globals.css", "utf8");
const source = walk("src")
  .filter((path) => /\.(?:ts|tsx|css)$/.test(path) && !path.endsWith("globals.css"))
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");
const reservations = JSON.parse(readFileSync("scripts/ui-token-reservations.json", "utf8"));

test("every project theme token is consumed or explicitly reserved", () => {
  assert.ok(themeTokens(globalsCss).length > 0);
  assert.deepEqual(findDeadThemeTokens({ globalsCss, source, reservations }), []);
});

test("token reservations are unique, documented, and limited to approved classes", () => {
  const tokens = reservations.reservations.map((entry) => entry.token);
  assert.equal(new Set(tokens).size, tokens.length);
  for (const entry of reservations.reservations) {
    assert.match(entry.token, /^--(?:color|radius)-/);
    assert.equal(entry.classification, "shadcn-required");
    assert.ok(entry.reason.length > 20);
  }
});
