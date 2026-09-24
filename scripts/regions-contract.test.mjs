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
    ["slug", "title", "kind", "parent", "pageKey", "verifiedAt", "order", "lead", "investmentThesis", "riskSummary", "heroMedia", "blocks", "seo", "status"].every(
      (name) => Boolean(field(name)),
    ),
    true,
  );

  assert.deepEqual(
    field("kind").options.map((option) => option.value),
    ["region", "locality", "segment"],
  );
  assert.equal(field("parent").relationTo, "regions");
  assert.deepEqual(field("pageKey").options.map((option) => option.value), ["REGION", "CITY"]);
  assert.equal(field("heroMedia").relationTo, "media");
});

test("regions collection validates normalized geo ownership and publication evidence", () => {
  const hook = Regions.hooks.beforeValidate[0];
  assert.doesNotThrow(() => hook({ data: { kind: "region", pageKey: "REGION", slug: "krym", status: "hidden" } }));
  assert.doesNotThrow(() => hook({ data: { kind: "locality", pageKey: "CITY", parent: 1, slug: "yalta", status: "hidden" } }));
  assert.throws(() => hook({ data: { kind: "locality", pageKey: "CITY", slug: "yalta", status: "hidden" } }), /parent region/);
  assert.throws(() => hook({ data: { kind: "segment", pageKey: "CITY", slug: "apartamenty", status: "hidden" } }), /Legacy segment/);
  assert.throws(() => hook({ data: { kind: "segment", slug: "apartamenty", status: "published", verifiedAt: "2026-09-24" } }), /cannot be published/);
  assert.throws(() => hook({ data: { kind: "region", pageKey: "REGION", slug: "krym", status: "published" } }), /verifiedAt/);
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
