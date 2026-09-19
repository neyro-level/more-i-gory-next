import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { findArchitectureGuardViolations } from "./lib/architecture-guards.mjs";

const uiContract = JSON.parse(readFileSync(new URL("./ui-upstream-exceptions.json", import.meta.url), "utf8"));

test("Base UI stays inside canonical primitive implementation owners", () => {
  const allowed = findArchitectureGuardViolations({
    files: [
      { path: "src/components/ui/button.tsx", content: 'import { Button } from "@base-ui/react/button";' },
      { path: "src/ui/interactive/checkbox.tsx", content: 'import { Checkbox } from "@base-ui/react/checkbox";' },
    ],
    manifests: [],
    uiContract,
  });
  assert.deepEqual(allowed, []);

  const denied = findArchitectureGuardViolations({
    files: [{ path: "src/components/marketing/hero.tsx", content: 'import { Button } from "@base-ui/react/button";' }],
    manifests: [],
    uiContract,
  });
  assert.match(denied.join("\n"), /Base UI imports are allowed only/);
});

test("consumer re-exports point to the canonical implementation and are not duplicate primitives", () => {
  assert.equal(
    readFileSync(new URL("../src/components/ui/checkbox.tsx", import.meta.url), "utf8").trim(),
    'export * from "@/ui/interactive/checkbox";',
  );
  assert.equal(
    readFileSync(new URL("../src/components/ui/sheet.tsx", import.meta.url), "utf8").trim(),
    'export * from "@/ui/interactive/sheet";',
  );
});
