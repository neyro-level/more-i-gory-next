import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const queue = readFileSync(path.join(root, "docs", "OWNER_QUEUE.md"), "utf8");

test("historical owner queue entries are reconciled into current buckets", () => {
  assert.doesNotMatch(queue, /## TASK 34\.2 — Прогноз плана vs фактическая очередь/);
  assert.doesNotMatch(queue, /## BLOCKS_RELEASE/);
  assert.match(queue, /Critical Next\/Payload upgrade/);
  assert.match(queue, /Legacy `mg-\*` Beads graph/);
  assert.match(queue, /Property enum live preflight/);
  assert.match(queue, /Production и `moreigori\.ru`/);
  assert.match(queue, /Managed PostgreSQL credential rotation \| PASS/);
  assert.match(queue, /advisory lock.*не являются текущим долгом/s);
  assert.match(queue, /точечные `301`.*пустой redirect inventory не является долгом/s);
});
