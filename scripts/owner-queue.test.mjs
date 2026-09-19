import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const queuePath = path.join(root, "docs", "OWNER_QUEUE.md");

function section(markdown, heading) {
  const start = markdown.indexOf(heading);
  assert.notEqual(start, -1, `missing ${heading}`);
  const next = markdown.indexOf("\n## ", start + heading.length);
  return next === -1 ? markdown.slice(start) : markdown.slice(start, next);
}

function tableSources(block) {
  return block
    .split("\n")
    .filter((line) => line.startsWith("| ") && !line.startsWith("| Источник") && !line.startsWith("|---"))
    .map((line) => line.split("|")[1].trim());
}

test("OWNER_QUEUE.md is a single BLOCKS_RELEASE / IMPROVEMENT inventory", () => {
  const markdown = readFileSync(queuePath, "utf8");

  assert.match(markdown, /## BLOCKS_RELEASE/);
  assert.match(markdown, /## IMPROVEMENT/);
  assert.doesNotMatch(markdown, /\n\| — \| — \|/);

  const blocking = tableSources(section(markdown, "## BLOCKS_RELEASE"));
  const improvements = tableSources(section(markdown, "## IMPROVEMENT"));

  for (const source of [
    "TASK 13.9 / TASK 13.7",
    "TASK 24.1b",
    "Domain cutover",
    "Credentials hygiene",
  ]) {
    assert.ok(blocking.includes(source), `BLOCKS_RELEASE missing ${source}`);
  }

  for (const source of [
    "TASK 21.6",
    "TASK 25.8 вариант 1",
    "TASK 25.8 вариант 2",
    "TASK 28.4",
    "TASK 31.x",
  ]) {
    assert.ok(improvements.includes(source), `IMPROVEMENT missing ${source}`);
  }

  assert.equal(new Set(blocking).size, blocking.length);
  assert.equal(new Set(improvements).size, improvements.length);
});
