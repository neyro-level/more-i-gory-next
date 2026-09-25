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

test("OWNER_QUEUE.md separates deferred owner scope, remaining owner gates and resolved history", () => {
  const markdown = readFileSync(queuePath, "utf8");

  assert.match(markdown, /## DEFERRED_BY_OWNER/);
  assert.match(markdown, /## NEXT_TECHNICAL_PLAN_INPUTS/);
  assert.match(markdown, /## RESOLVED — REMOVE FROM ACTIVE QUEUE/);
  assert.match(markdown, /## REVISIT_ONLY_ON_TRIGGER/);
  assert.doesNotMatch(markdown, /\n\| — \| — \|/);
  assert.doesNotMatch(markdown, /## BLOCKS_RELEASE/);
  assert.doesNotMatch(markdown, /## IMPROVEMENT/);

  const deferred = tableSources(section(markdown, "## DEFERRED_BY_OWNER"));
  const technical = section(markdown, "## NEXT_TECHNICAL_PLAN_INPUTS");
  const resolved = tableSources(section(markdown, "## RESOLVED — REMOVE FROM ACTIVE QUEUE"));

  for (const source of [
    "Business facts, команда, коммерческая модель, методика, география",
    "Крым и четыре city hub",
    "Проекты и аналитика",
    "Index activation",
    "Адрес/карта/provider",
    "Production и `moreigori.ru`",
  ]) {
    assert.ok(deferred.includes(source), `DEFERRED_BY_OWNER missing ${source}`);
  }

  for (const source of [
    "Factual content cohort",
    "Index activation",
    "Recovery policy",
    "Production release",
  ]) {
    assert.ok(technical.includes(source), `NEXT_TECHNICAL_PLAN_INPUTS missing ${source}`);
  }

  for (const source of [
    "Managed PostgreSQL credential rotation",
    "Payload/S3/app env в Secret Master",
    "Preview runtime install/rollback",
    "S3 credential correction",
    "Reserved `packages/ui`",
  ]) {
    assert.ok(resolved.includes(source), `RESOLVED missing ${source}`);
  }

  assert.equal(new Set(deferred).size, deferred.length);
  assert.equal(new Set(resolved).size, resolved.length);
});
