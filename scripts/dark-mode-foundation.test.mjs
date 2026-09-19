import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { findArchitectureGuardViolations } from "./lib/architecture-guards.mjs";

const uiContract = JSON.parse(readFileSync(new URL("./ui-upstream-exceptions.json", import.meta.url), "utf8"));
const requiredVariant = "@custom-variant dark (&:is(.dark *));";

test("light-only foundation keeps the inert class-based dark variant", () => {
  const globals = readFileSync(new URL("../src/app/(site)/globals.css", import.meta.url), "utf8");
  assert.equal(globals.includes(requiredVariant), true);
  assert.equal(/^\.dark\s*\{/m.test(globals), false);
});

test("project dark variants and runtime activation fail Guard 10", () => {
  const violations = findArchitectureGuardViolations({
    files: [
      { path: "src/components/marketing/card.tsx", content: 'export const card = "dark:bg-card";' },
      { path: "src/app/layout.tsx", content: 'document.documentElement.classList.add("dark");' },
    ],
    manifests: [],
    uiContract,
  });
  assert.equal(violations.filter((entry) => entry.startsWith("Guard 10:")).length, 2);
});

test("canonical primitive internal dark variants remain inert and allowed", () => {
  const violations = findArchitectureGuardViolations({
    files: [{ path: "src/components/ui/button.tsx", content: 'export const button = "dark:bg-input/30";' }],
    manifests: [],
    uiContract,
  });
  assert.deepEqual(violations, []);
});
