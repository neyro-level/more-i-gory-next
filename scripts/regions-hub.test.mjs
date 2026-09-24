import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getRegionHubPlan } from "../src/content/regions/region-route-plan.ts";
import { regionSeedContent } from "../src/content/regions/region-seed-content.ts";
import { isRegionPreviewRoute } from "../src/core/regions/activation.ts";

test("investment hub map is built from the regions route plan and excludes stubs", () => {
  const includedKeys = new Set(
    Object.entries(regionSeedContent)
      .filter(([, content]) => isRegionPreviewRoute(content.status))
      .map(([key]) => key),
  );
  const plan = getRegionHubPlan(includedKeys);

  assert.equal(plan.length, 9);
  assert.equal(plan.some((entry) => entry.key === "sochi"), false);
  assert.equal(plan.every((entry) => entry.key !== "sochi"), true);
  assert.deepEqual(
    plan.map((entry) => entry.path),
    [
      "/krym/",
      "/krym/yalta/",
      "/krym/sevastopol/",
      "/krym/evpatoriya/",
      "/krym/alushta/",
      "/investicionnaya-nedvizhimost/krym/novostroyki/",
      "/investicionnaya-nedvizhimost/krym/apartamenty/",
      "/arkhyz/",
      "/altay/",
    ],
  );
});

test("investment hub page reads CMS-backed public regions", () => {
  const source = readFileSync("src/app/(site)/investicionnaya-nedvizhimost/page.tsx", "utf8");

  assert.match(source, /listPublicHubRegions/);
  assert.doesNotMatch(source, /listRegions\(/);
  assert.doesNotMatch(source, /getRegionHubPlan/);
  assert.doesNotMatch(source, /heroMediaId/);
  assert.doesNotMatch(source, /mediaSourceLabel/);
});

test("public hub reader keeps an explicit published-only boundary", () => {
  const source = readFileSync("src/core/data-access/public/regions.ts", "utf8");

  assert.match(source, /region\.status === "published"/);
  assert.doesNotMatch(source, /slug !== "sochi"/);
});
