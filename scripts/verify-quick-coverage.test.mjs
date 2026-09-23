import assert from "node:assert/strict";
import test from "node:test";

import { buildVerifyQuickPlan, findUncoveredTestScripts } from "./lib/verify-quick-coverage.mjs";

const manifest = {
  schemaVersion: 1,
  preTestScripts: ["lint"],
  testSelection: {
    includePrefix: "test:",
    order: "package-json",
    runtimeMetadataSource: "package-script",
  },
  excludedTests: {},
  postTestScripts: ["verify:foundation"],
};

test("runner keeps package order and delegates exact runtime metadata to package scripts", () => {
  const scripts = {
    lint: "eslint .",
    "test:plain": "node --test scripts/plain.test.mjs",
    "test:server": "node --conditions=react-server --test scripts/server.test.mjs",
    "verify:foundation": "node scripts/verify-foundation.mjs",
  };

  assert.deepEqual(buildVerifyQuickPlan({ scripts, manifest }), [
    "lint",
    "test:plain",
    "test:server",
    "verify:foundation",
  ]);
  assert.match(scripts["test:server"], /--conditions=react-server/);
});

test("every test:* script is covered automatically", () => {
  assert.deepEqual(
    findUncoveredTestScripts({
      scripts: {
        lint: "eslint .",
        "test:alpha": "node --test",
        "test:newly-added": "node --conditions=react-server --test",
        "verify:foundation": "node verify.mjs",
      },
      manifest,
    }),
    [],
  );
});

test("a recorded exclusion with a reason is omitted", () => {
  const withExclusion = {
    ...manifest,
    excludedTests: { "test:operator": "manual operator-only proof" },
  };
  const scripts = {
    lint: "eslint .",
    "test:alpha": "node --test",
    "test:operator": "node --test",
    "verify:foundation": "node verify.mjs",
  };

  assert.deepEqual(buildVerifyQuickPlan({ scripts, manifest: withExclusion }), [
    "lint",
    "test:alpha",
    "verify:foundation",
  ]);
});

test("empty exclusion reason is rejected", () => {
  assert.throws(
    () =>
      buildVerifyQuickPlan({
        scripts: {
          lint: "eslint .",
          "test:alpha": "node --test",
          "verify:foundation": "node verify.mjs",
        },
        manifest: { ...manifest, excludedTests: { "test:alpha": "   " } },
      }),
    /non-empty reason/,
  );
});

test("undefined lifecycle scripts fail before execution", () => {
  assert.throws(
    () => buildVerifyQuickPlan({ scripts: { "test:alpha": "node --test" }, manifest }),
    /references undefined package script lint/,
  );
});
