import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { regionDtos } from "../src/content/regions/region-dtos.ts";
import { getRegionRoutePlan } from "../src/content/regions/region-route-plan.ts";
import { regionSeedContent } from "../src/content/regions/region-seed-content.ts";
import { Regions } from "../src/project/collections/regions.ts";

const seoRegistry = JSON.parse(readFileSync("src/seo/registry.json", "utf8"));

const regionPageIds = [
  "PAGE-007",
  "PAGE-008",
  "PAGE-009",
  "PAGE-010",
  "PAGE-011",
  "PAGE-024",
  "PAGE-025",
  "PAGE-012",
  "PAGE-013",
  "PAGE-003",
];

const payloadFieldNames = Regions.fields.map((field) => field.name);
const inventory = readFileSync("docs/research/region-duplicated-data-inventory.md", "utf8");

test("region inventory covers Payload, route plan, DTO and SEO registry", () => {
  assert.match(inventory, /src\/project\/collections\/regions\.ts/);
  assert.match(inventory, /src\/content\/regions\/region-route-plan\.ts/);
  assert.match(inventory, /src\/content\/regions\/region-dtos\.ts/);
  assert.match(inventory, /src\/seo\/registry\.json/);
  assert.match(inventory, /listPublicHubRegions/);
});

test("the four sources share the same ten region keys and pageIds", () => {
  const plan = getRegionRoutePlan();
  assert.equal(plan.length, 10);
  assert.equal(regionDtos.length, 10);
  assert.deepEqual(
    plan.map((entry) => entry.pageId),
    regionPageIds,
  );
  assert.deepEqual(
    regionDtos.map((entry) => entry.pageId),
    regionPageIds,
  );
  assert.equal(plan.find((entry) => entry.pageId === "PAGE-007")?.path, "/krym/");
  assert.equal(plan.find((entry) => entry.pageId === "PAGE-008")?.path, "/krym/yalta/");
  assert.equal(plan.find((entry) => entry.pageId === "PAGE-025")?.path, "/investicionnaya-nedvizhimost/krym/apartamenty/");
});

test("domain copy and hierarchy exist in both Payload schema and hardcoded plan", () => {
  for (const name of ["title", "slug", "kind", "parent", "order", "lead", "investmentThesis", "riskSummary", "heroMedia", "status"]) {
    assert.equal(payloadFieldNames.includes(name), true, name);
  }

  const krym = regionSeedContent.krym;
  const dto = regionDtos.find((entry) => entry.pageId === "PAGE-007");
  assert.equal(krym.title, dto?.title);
  assert.equal(krym.lead, dto?.lead);
  assert.equal(krym.investmentThesis, dto?.investmentThesis);
  assert.equal(krym.riskSummary, dto?.riskSummary);
});

test("SEO registry is a separate index policy and already drifts from the route plan on PAGE-009", () => {
  const sevastopol = regionSeedContent.sevastopol;
  const seo = seoRegistry.find((entry) => entry.pageId === "PAGE-009");
  assert.equal(sevastopol.seoPriority, "P1");
  assert.equal(seo?.priority, "P2");
  assert.match(inventory, /PAGE-009: plan P1 vs registry P2/);
});

test("public region route composes builder-owned paths and reads Payload through Public Gateway", () => {
  const page = readFileSync("src/app/(site)/_shared/region-route-page.tsx", "utf8");
  assert.match(page, /getRoutableRegionByPath/);
  const route = readFileSync("src/app/(site)/krym/yalta/page.tsx", "utf8");
  assert.match(route, /path="\/krym\/yalta\/"/);
  const dtoSource = readFileSync("src/content/regions/region-dtos.ts", "utf8");
  assert.match(dtoSource, /regionSeedContent/);
  assert.doesNotMatch(dtoSource, /collection:\s*"regions"/);
});
