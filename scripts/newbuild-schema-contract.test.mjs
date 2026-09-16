import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { Buildings } from "../src/project/collections/buildings.ts";
import { Developers } from "../src/project/collections/developers.ts";
import { Layouts } from "../src/project/collections/layouts.ts";
import { Properties } from "../src/project/collections/properties.ts";
import { ResidentialComplexes } from "../src/project/collections/residential-complexes.ts";

const siteAppDir = path.resolve("src/app/(site)");

function field(collection, name) {
  return collection.fields.find((candidate) => candidate.name === name);
}

function fieldNames(collection) {
  return collection.fields.map((candidate) => candidate.name);
}

function relationField(collection, name) {
  const candidate = field(collection, name);
  assert.ok(candidate, `${collection.slug}.${name} field is missing`);
  assert.equal(candidate.type, "relationship", `${collection.slug}.${name} must be a relationship`);
  return candidate;
}

function statusValues(collection) {
  return field(collection, "status").options.map((option) => option.value);
}

test("developers collection exposes the approved newbuild developer schema", () => {
  assert.equal(Developers.slug, "developers");
  assert.deepEqual(fieldNames(Developers), ["slug", "title", "description", "media", "seo", "status"]);
  assert.equal(field(Developers, "slug").required, true);
  assert.equal(field(Developers, "slug").unique, true);
  assert.equal(relationField(Developers, "media").relationTo, "media");
  assert.equal(field(Developers, "media").hasMany, true);
  assert.equal(field(Developers, "seo").type, "group");
  assert.equal(field(Developers, "status").defaultValue, "hidden");
  assert.deepEqual(statusValues(Developers), ["hidden", "published", "archived"]);
  assert.deepEqual(Developers.versions, { drafts: true, maxPerDoc: 20 });
});

test("residential complexes keep developer, region, feed source and editorial surface explicit", () => {
  assert.equal(ResidentialComplexes.slug, "residential-complexes");
  for (const name of [
    "slug",
    "title",
    "developer",
    "region",
    "feedSource",
    "externalComplexId",
    "address",
    "media",
    "blocks",
    "seo",
    "status",
  ]) {
    assert.ok(field(ResidentialComplexes, name), `${name} field is missing`);
  }
  assert.equal(field(ResidentialComplexes, "slug").unique, true);
  assert.equal(relationField(ResidentialComplexes, "developer").relationTo, "developers");
  assert.equal(relationField(ResidentialComplexes, "region").relationTo, "regions");
  assert.equal(relationField(ResidentialComplexes, "feedSource").relationTo, "feed-sources");
  assert.deepEqual(field(ResidentialComplexes, "address").fields.map((candidate) => candidate.name), [
    "locality",
    "district",
    "street",
    "house",
    "publicAddress",
    "lat",
    "lng",
  ]);
  assert.equal(relationField(ResidentialComplexes, "media").relationTo, "media");
  assert.equal(field(ResidentialComplexes, "media").hasMany, true);
  assert.equal(field(ResidentialComplexes, "blocks").type, "blocks");
  assert.equal(field(ResidentialComplexes, "status").defaultValue, "hidden");
  assert.deepEqual(statusValues(ResidentialComplexes), ["hidden", "published", "archived"]);
});

test("residential complexes declare externalComplexId unique per feed source", () => {
  assert.deepEqual(ResidentialComplexes.indexes, [
    { fields: ["feedSource", "externalComplexId"], unique: true },
    { fields: ["status", "region"] },
    { fields: ["developer", "region"] },
  ]);
});

test("buildings model complex relation, external id, корпус and completion deadline", () => {
  assert.equal(Buildings.slug, "buildings");
  assert.equal(relationField(Buildings, "complex").relationTo, "residential-complexes");
  assert.equal(field(Buildings, "externalBuildingId").type, "text");
  assert.equal(field(Buildings, "name").required, true);
  assert.equal(field(Buildings, "completionDeadline").type, "text");
  assert.equal(field(Buildings, "status").defaultValue, "hidden");
  assert.equal(Buildings.versions, false);
  assert.deepEqual(Buildings.indexes, [
    { fields: ["complex", "externalBuildingId"], unique: true },
    { fields: ["status", "complex"] },
  ]);
});

test("layouts model complex/building relations, layout id, rooms, area and plan asset", () => {
  assert.equal(Layouts.slug, "layouts");
  assert.equal(relationField(Layouts, "complex").relationTo, "residential-complexes");
  assert.equal(relationField(Layouts, "building").relationTo, "buildings");
  assert.equal(field(Layouts, "externalLayoutId").required, true);
  assert.equal(field(Layouts, "rooms").validate(2), true);
  assert.match(field(Layouts, "rooms").validate(1.5), /integer/);
  assert.equal(field(Layouts, "totalArea").validate(48.35), true);
  assert.match(field(Layouts, "totalArea").validate(48.355), /two fractional digits/);
  assert.equal(relationField(Layouts, "plan").relationTo, "media");
  assert.equal(field(Layouts, "status").defaultValue, "hidden");
  assert.equal(Layouts.versions, false);
  assert.deepEqual(Layouts.indexes, [
    { fields: ["complex", "building", "externalLayoutId"], unique: true },
    { fields: ["status", "complex"] },
  ]);
});

test("property newbuild links target complex, building and layout collections without a unit relation", () => {
  assert.equal(relationField(Properties, "complex").relationTo, "residential-complexes");
  assert.equal(relationField(Properties, "building").relationTo, "buildings");
  assert.equal(relationField(Properties, "layout").relationTo, "layouts");
  assert.equal(field(Properties, "layout").hasMany, false);
  assert.equal(field(Properties, "unit"), undefined);
});

test("newbuild schema foundation does not create public routes yet", () => {
  const routeEntries = fs.readdirSync(siteAppDir, { recursive: true, withFileTypes: true });
  const routeNames = routeEntries.map((entry) => entry.name);

  for (const forbidden of ["developers", "residential-complexes", "buildings", "layouts", "novostroyki"]) {
    assert.equal(routeNames.includes(forbidden), false, `${forbidden} public route must not exist in task 15-01`);
  }
});
