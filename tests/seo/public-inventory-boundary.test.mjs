import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { propertyPublicationWhere, propertyRouteWhere } from "../../src/core/data-access/public/properties-contract.ts";

function predicateValue(where, field) {
  return where.and.find((predicate) => predicate[field])?.[field]?.equals;
}

function assertSourcePredicate(source, field, value) {
  assert.match(source, new RegExp(`${field}:\\s*\\{\\s*equals:\\s*"${value}"\\s*\\}`));
}

test("public newbuild inventory is scoped to feed newbuild active records", async () => {
  const newbuildGateway = await readFile("src/core/data-access/public/newbuilds.ts", "utf8");
  const activeWhereBlock = newbuildGateway.slice(
    newbuildGateway.indexOf("export function activeNewbuildInventoryWhere"),
    newbuildGateway.indexOf("function isRelationDocument"),
  );

  assertSourcePredicate(activeWhereBlock, "origin", "feed");
  assertSourcePredicate(activeWhereBlock, "market", "newbuild");
  assertSourcePredicate(activeWhereBlock, "status", "active");
  assert.match(activeWhereBlock, /complex:\s*\{\s*equals:\s*complexId\s*\}/);
});

test("/obekty public predicates are strictly manual and cannot overlap feed inventory", async () => {
  const newbuildGateway = await readFile("src/core/data-access/public/newbuilds.ts", "utf8");
  const listWhere = propertyPublicationWhere("manual-passport");
  const routeWhere = propertyRouteWhere("manual-passport");

  assert.equal(predicateValue(listWhere, "origin"), "manual");
  assert.equal(predicateValue(routeWhere, "origin"), "manual");
  assertSourcePredicate(newbuildGateway, "origin", "feed");
  assert.notEqual(predicateValue(listWhere, "origin"), "feed");
  assert.notEqual(predicateValue(routeWhere, "origin"), "feed");
});

test("public route readers keep manual passports and feed inventory in separate gateways", async () => {
  const propertiesGateway = await readFile("src/core/data-access/public/properties.ts", "utf8");
  const newbuildGateway = await readFile("src/core/data-access/public/newbuilds.ts", "utf8");
  const objectsPage = await readFile("src/app/(site)/obekty/page.tsx", "utf8");
  const complexPage = await readFile("src/app/(site)/novostroyki/[slug]/page.tsx", "utf8");

  assert.match(propertiesGateway, /propertyPublicationWhere/);
  assert.doesNotMatch(propertiesGateway, /activeNewbuildInventoryWhere/);
  assert.match(newbuildGateway, /activeNewbuildInventoryWhere/);
  assert.doesNotMatch(newbuildGateway, /propertyPublicationWhere/);
  assert.match(objectsPage, /listPublishedManualProperties/);
  assert.doesNotMatch(objectsPage, /listActiveNewbuildInventoryByComplex/);
  assert.match(complexPage, /listActiveNewbuildInventoryByComplex/);
  assert.doesNotMatch(complexPage, /listPublishedManualProperties/);
});
