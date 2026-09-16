import assert from "node:assert/strict";
import test from "node:test";

import { pageBlockTypes } from "../src/project/blocks/page-blocks.ts";
import { Regions } from "../src/project/collections/regions.ts";

function field(name) {
  return Regions.fields.find((candidate) => candidate.name === name);
}

test("regions collection exposes the approved hierarchy fields", () => {
  assert.equal(Regions.slug, "regions");
  assert.deepEqual(
    ["slug", "title", "kind", "parent", "order", "lead", "investmentThesis", "riskSummary", "heroMedia", "blocks", "seo", "status"].every(
      (name) => Boolean(field(name)),
    ),
    true,
  );

  assert.deepEqual(
    field("kind").options.map((option) => option.value),
    ["region", "locality", "segment"],
  );
  assert.equal(field("parent").relationTo, "regions");
  assert.equal(field("heroMedia").relationTo, "media");
});

test("regions collection owns status, blocks, SEO and drafts", () => {
  assert.equal(field("status").type, "text");
  assert.equal(field("status").defaultValue, "hidden");
  assert.equal(field("status").validate("published"), true);
  assert.equal(field("status").validate("hidden"), true);
  assert.equal(field("status").validate("stub"), true);
  assert.match(field("status").validate("draft"), /published, hidden or stub/);
  assert.deepEqual(
    field("blocks").blocks.map((block) => block.slug),
    pageBlockTypes,
  );
  assert.equal(field("seo").type, "group");
  assert.deepEqual(Regions.versions.drafts, true);
});
