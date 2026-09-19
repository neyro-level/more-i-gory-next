import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rollback = readFileSync(new URL("../ops/runtime/rollback-release.sh", import.meta.url), "utf8");
const install = readFileSync(new URL("../ops/runtime/install-release.sh", import.meta.url), "utf8");
const operations = readFileSync(new URL("../docs/OPERATIONS.md", import.meta.url), "utf8");

test("rollback switches current to previous, restarts, and smokes without rebuild", () => {
  assert.match(rollback, /Atomic rollback: current → previous release, restart, smoke/);
  assert.match(rollback, /ln -sfn "\$PREVIOUS_TARGET" "\$ROOT\/current"/);
  assert.match(rollback, /systemctl restart moreigory/);
  assert.match(rollback, /curl -fsS -o \/dev\/null "\$SMOKE_URL"/);
  assert.doesNotMatch(rollback, /^\s*next build/m);
  assert.doesNotMatch(rollback, /^\s*pnpm /m);
  assert.match(install, /ln -sfn "\$CURRENT_TARGET" "\$ROOT\/previous"/);
  assert.match(operations, /current → previous release/);
  assert.match(operations, /ops\/runtime\/rollback-release\.sh/);
});
