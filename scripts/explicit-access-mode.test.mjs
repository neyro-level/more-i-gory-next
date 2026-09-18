import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { findImplicitAccessModeCalls } from "./lib/explicit-access-mode.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("application Local API calls set explicit overrideAccess for their layer", () => {
  const missing = findImplicitAccessModeCalls(projectRoot);
  assert.deepEqual(
    missing.map((call) => `${call.file}:${call.line} ${call.reason}`),
    [],
  );
});
