import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { findArchitectureGuardViolations } from "../../scripts/lib/architecture-guards.mjs";

const uiContract = JSON.parse(readFileSync(new URL("../../scripts/ui-upstream-exceptions.json", import.meta.url), "utf8"));

test("structural geometry is allowed without becoming a design exception", () => {
  const violations = findArchitectureGuardViolations({
    files: [{ path: "src/components/marketing/grid.tsx", content: 'export const grid = "grid-cols-[0.85fr_1.15fr] max-w-[42rem] translate-x-[2.5rem]";' }],
    manifests: [],
    uiContract,
  });
  assert.deepEqual(violations, []);
});

test("unverified visual-system literals fail even inside primitive paths", () => {
  const violations = findArchitectureGuardViolations({
    files: [{ path: "src/components/ui/button.tsx", content: 'export const button = "rounded-[7px] text-[13px]";' }],
    manifests: [],
    uiContract,
  });
  assert.match(violations.join("\n"), /Guard 11/);
  assert.match(violations.join("\n"), /rounded-\[7px\]/);
});

test("verified exact upstream literals pass only at their registered owner", () => {
  const literal = "rounded-[4px]";
  const allowed = findArchitectureGuardViolations({
    files: [{ path: "src/components/ui/checkbox.tsx", content: `export const checkbox = "${literal}";` }],
    manifests: [],
    uiContract,
  });
  assert.deepEqual(allowed, []);

  const denied = findArchitectureGuardViolations({
    files: [{ path: "src/components/marketing/card.tsx", content: `export const card = "${literal}";` }],
    manifests: [],
    uiContract,
  });
  assert.match(denied.join("\n"), /Guard 11/);
});
