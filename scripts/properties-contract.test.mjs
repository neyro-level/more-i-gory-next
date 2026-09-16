import assert from "node:assert/strict";
import test from "node:test";

import { Properties } from "../src/project/collections/properties.ts";

function field(name) {
  return Properties.fields.find((candidate) => candidate.name === name);
}

test("properties collection exposes the approved EPIC 8.2 schema surface", () => {
  assert.equal(Properties.slug, "properties");
  for (const name of [
    "origin",
    "feedSource",
    "externalId",
    "importHash",
    "firstSeenAt",
    "lastSeenAt",
    "lastImportRun",
    "externalComplexId",
    "externalComplexName",
    "externalBuildingId",
    "externalLayoutId",
    "status",
    "deactivatedAt",
    "deactivatedByRun",
    "needsReview",
    "publishedAt",
    "slug",
    "market",
    "category",
    "dealType",
    "priceMinor",
    "currency",
    "pricePerMeterMinor",
    "rooms",
    "totalArea",
    "livingArea",
    "kitchenArea",
    "floor",
    "floors",
    "region",
    "locality",
    "district",
    "street",
    "house",
    "publicAddress",
    "lat",
    "lng",
    "title",
    "description",
    "images",
    "unitNumber",
    "cadastralNumber",
    "internalComment",
    "ownerContact",
    "verdict",
    "facts",
    "budgetNote",
    "riskSummary",
    "sources",
    "verifiedAt",
  ]) {
    assert.ok(field(name), `${name} field is missing`);
  }
});

test("properties collection keeps inventory defaults and relationships explicit", () => {
  assert.deepEqual(
    field("origin").options.map((option) => option.value),
    ["feed", "manual"],
  );
  assert.equal(field("origin").defaultValue, "manual");
  assert.equal(field("feedSource").relationTo, "feed-sources");
  assert.deepEqual(
    field("status").options.map((option) => option.value),
    ["active", "archived"],
  );
  assert.equal(field("status").defaultValue, "active");
  assert.equal(field("market").defaultValue, "secondary");
  assert.equal(field("market").required, true);
  assert.equal(field("market").index, true);
  assert.equal(field("region").relationTo, "regions");
  assert.equal(field("images").relationTo, "media");
  assert.equal(field("images").hasMany, true);
  assert.equal(Properties.versions, false);
});

test("properties collection models manual passport domain arrays", () => {
  assert.equal(field("facts").type, "array");
  assert.deepEqual(
    field("facts").fields.map((candidate) => candidate.name),
    ["label", "value"],
  );
  assert.equal(field("sources").type, "array");
  assert.deepEqual(
    field("sources").fields.map((candidate) => candidate.name),
    ["label", "url"],
  );
});

test("properties collection validates integer money and two-decimal area values", () => {
  assert.equal(field("priceMinor").validate(12500000), true);
  assert.match(field("priceMinor").validate(12500000.5), /integer/);
  assert.equal(field("pricePerMeterMinor").validate(350000), true);
  assert.match(field("rooms").validate(1.5), /integer/);
  assert.equal(field("totalArea").validate(42.35), true);
  assert.match(field("totalArea").validate(42.355), /two fractional digits/);
  assert.equal(field("livingArea").validate(undefined), true);
});

test("properties collection protects private fields with field-level read access", () => {
  const ownerReq = { user: { collection: "users", role: "owner" } };
  const anonymousReq = {};

  for (const name of ["unitNumber", "cadastralNumber", "internalComment", "ownerContact"]) {
    assert.equal(field(name).access.read({ req: ownerReq }), true, `${name} owner access`);
    assert.equal(field(name).access.read({ req: anonymousReq }), false, `${name} anonymous access`);
  }
});

test("properties collection declares required compound indexes", () => {
  assert.deepEqual(Properties.indexes, [
    { fields: ["feedSource", "externalId"], unique: true },
    { fields: ["origin", "status", "publishedAt"] },
    { fields: ["market", "region"] },
  ]);
});
