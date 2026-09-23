import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const globals = readFileSync("src/app/(site)/globals.css", "utf8");
const consumers = [
  "src/components/marketing/forms/lead-form-client.tsx",
  "src/components/layout/site-header.tsx",
  "src/components/layout/site-footer.tsx",
].map((file) => readFileSync(file, "utf8"));

test("project duration-fast token is removed in favor of duration-150", () => {
  assert.doesNotMatch(globals, /--motion-duration-fast/);
  assert.doesNotMatch(globals, /@utility duration-fast/);
  assert.match(globals, /--ease-standard/);

  for (const source of consumers) {
    assert.doesNotMatch(source, /duration-fast/);
    assert.match(source, /duration-150/);
    assert.match(source, /ease-standard/);
  }
});
