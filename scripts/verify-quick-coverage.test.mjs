import assert from "node:assert/strict";
import test from "node:test";

import { findUncoveredTestScripts, listVerifyQuickTestSteps } from "./lib/verify-quick-coverage.mjs";

test("verify:quick test steps are parsed as pnpm test:* tokens", () => {
  assert.deepEqual(
    listVerifyQuickTestSteps("pnpm lint && pnpm test:alpha && pnpm verify:foundation && pnpm test:beta"),
    ["test:alpha", "test:beta"],
  );
});

test("a test:* outside verify:quick fails without a recorded reason", () => {
  assert.deepEqual(
    findUncoveredTestScripts({
      scripts: {
        "test:alpha": "node --test",
        "test:orphan": "node --test",
        "verify:quick": "pnpm test:alpha",
      },
      exclusions: {},
    }),
    ["test:orphan"],
  );
});

test("a recorded exclusion with a reason is allowed", () => {
  assert.deepEqual(
    findUncoveredTestScripts({
      scripts: {
        "test:alpha": "node --test",
        "test:slow": "node --test",
        "verify:quick": "pnpm test:alpha",
      },
      exclusions: {
        "test:slow": "manual operator-only proof, not part of the default MERGE gate",
      },
    }),
    [],
  );
});

test("empty exclusion reason is rejected", () => {
  assert.throws(
    () =>
      findUncoveredTestScripts({
        scripts: {
          "test:alpha": "node --test",
          "verify:quick": "pnpm test:alpha",
        },
        exclusions: {
          "test:alpha": "   ",
        },
      }),
    /non-empty reason/,
  );
});
