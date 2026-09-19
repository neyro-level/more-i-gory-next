import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const queue = readFileSync(path.join(root, "docs", "OWNER_QUEUE.md"), "utf8");

test("TASK 34.2 forecast rows are reconciled against the compiled owner queue", () => {
  assert.match(queue, /## TASK 34\.2 — Прогноз плана vs фактическая очередь/);

  const required = [
    ["TASK 24.1b", "BLOCKS_RELEASE"],
    ["TASK 31.x", "IMPROVEMENT"],
    ["TASK 25.8 варианты 1/2", "IMPROVEMENT"],
    ["TASK 28.4", "IMPROVEMENT"],
    ["Domain cutover `moreigori.ru`", "BLOCKS_RELEASE"],
  ];

  for (const [source, bucket] of required) {
    const line = queue
      .split("\n")
      .find((row) => row.startsWith(`| ${source} |`) && row.includes("PASS"));
    assert.ok(line, `forecast row missing for ${source}`);
    assert.ok(line.includes(`\`${bucket}\``), `${source} must land in ${bucket}`);
  }
});
