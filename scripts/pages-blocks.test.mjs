import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { pageBlocks, pageBlockTypes } from "../src/project/blocks/page-blocks.ts";

const approvedBlockTypes = [
  "hero",
  "lead",
  "thesis",
  "risk-block",
  "numbered-steps",
  "proof-block",
  "scenario-table",
  "cards-grid",
  "object-cards",
  "cta",
  "rich-text",
];

function fieldNames(fields) {
  return fields.flatMap((field) => [
    "name" in field ? field.name : undefined,
    "fields" in field && Array.isArray(field.fields) ? fieldNames(field.fields) : [],
  ]).flat().filter(Boolean);
}

test("pages collection uses the fixed approved block set", () => {
  const pagesSource = readFileSync("src/project/collections/pages.ts", "utf8");

  assert.match(pagesSource, /slug:\s*"pages"/);
  assert.match(pagesSource, /name:\s*"blocks"/);
  assert.deepEqual(pageBlockTypes, approvedBlockTypes);
  assert.match(pagesSource, /blocks:\s*\[\.\.\.pageBlocks\]/);
});

test("page blocks expose stable required field names", () => {
  const fieldsByBlock = Object.fromEntries(pageBlocks.map((block) => [block.slug, fieldNames(block.fields)]));

  assert.deepEqual(fieldsByBlock.hero.includes("primaryCta"), true);
  assert.deepEqual(fieldsByBlock["scenario-table"].includes("investorQuestion"), true);
  assert.deepEqual(fieldsByBlock["object-cards"].includes("risk"), true);
  assert.deepEqual(fieldsByBlock["rich-text"].includes("content"), true);
});

test("page block registry covers every approved block and fails unknown blocks", () => {
  const registrySource = readFileSync("src/components/page-blocks/page-block-registry.tsx", "utf8");

  for (const blockType of approvedBlockTypes) {
    assert.match(registrySource, new RegExp(`["']?${blockType}["']?\\s*:`));
  }

  assert.match(registrySource, /Unknown page block/);
});
