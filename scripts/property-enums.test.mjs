import assert from "node:assert/strict";
import test from "node:test";

import { propertyCategories, propertyDealTypes, propertyEnumWriteSchema } from "@more-i-gory/contracts";

import {
  mapFeedPropertyCategory,
  mapFeedPropertyDealType,
  outOfContractPropertyEnumSql,
  resolveFeedPropertyEnums,
  validatePropertyCategoryField,
  validatePropertyDealTypeField,
} from "../src/core/catalog/property-enums.ts";
import { planOfferImport } from "../src/core/ingest/import-state.ts";
import { Properties } from "../src/project/collections/properties.ts";

function field(name) {
  return Properties.fields.find((candidate) => candidate.name === name);
}

test("property enums are fixed in contracts, Payload options and write DTO", () => {
  assert.deepEqual([...propertyCategories], ["apartment", "house", "land", "commercial"]);
  assert.deepEqual([...propertyDealTypes], ["sale", "rent"]);
  assert.deepEqual(
    field("category").options.map((option) => option.value),
    ["apartment", "house", "land", "commercial"],
  );
  assert.deepEqual(field("dealType").options.map((option) => option.value), ["sale", "rent"]);
  assert.equal(field("category").type, "select");
  assert.equal(field("dealType").type, "select");
  assert.equal(propertyEnumWriteSchema.safeParse({ category: "apartment", dealType: "sale" }).success, true);
  assert.equal(propertyEnumWriteSchema.safeParse({ category: "villa" }).success, false);
  assert.equal(propertyEnumWriteSchema.safeParse({ dealType: "booking" }).success, false);
});

test("admin and DTO validation reject values outside the contract", () => {
  assert.equal(validatePropertyCategoryField("apartment"), true);
  assert.match(validatePropertyCategoryField("villa"), /apartment/);
  assert.equal(validatePropertyDealTypeField("rent"), true);
  assert.match(validatePropertyDealTypeField("booking"), /sale/);
  assert.equal(validatePropertyCategoryField(null), true);
});

test("ingest mapping accepts canonical and known feed aliases and rejects the rest", () => {
  assert.equal(mapFeedPropertyCategory("Квартира"), "apartment");
  assert.equal(mapFeedPropertyDealType("продажа"), "sale");
  assert.equal(mapFeedPropertyCategory("villa"), null);
  assert.deepEqual(resolveFeedPropertyEnums({ category: "дом", type: "аренда" }).values, {
    category: "house",
    dealType: "rent",
  });
  assert.deepEqual(resolveFeedPropertyEnums({ category: "таунхаус", type: "продажа" }).rejected, [
    { field: "category", raw: "таунхаус" },
  ]);
});

test("new feed writes only normalized enum values and never persist rejected aliases", () => {
  const plan = planOfferImport({
    feedMarket: "newbuild",
    feedSourceId: "feed-a",
    importRunId: "run-1",
    nowIso: "2026-09-18T00:00:00.000Z",
    offer: {
      externalId: "1",
      source: { category: "таунхаус", id: "1", name: "X", type: "продажа" },
      title: "X",
    },
  });
  assert.equal(plan.kind, "create");
  assert.equal(plan.data.dealType, "sale");
  assert.equal(plan.data.category, undefined);
});

test("out-of-contract report SQL lists only values outside the locked enums", () => {
  const sql = outOfContractPropertyEnumSql();
  assert.match(sql, /NOT IN \('apartment', 'house', 'land', 'commercial'\)/);
  assert.match(sql, /NOT IN \('sale', 'rent'\)/);
});
