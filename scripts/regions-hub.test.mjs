import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getRegionHubPlan } from "../src/content/regions/region-route-plan.ts";

test("investment hub map is built from the regions route plan and excludes stubs", () => {
  const plan = getRegionHubPlan();

  assert.equal(plan.length, 9);
  assert.equal(plan.some((entry) => entry.key === "sochi"), false);
  assert.equal(plan.every((entry) => entry.status !== "stub"), true);
  assert.deepEqual(
    plan.map((entry) => entry.path),
    [
      "/investicionnaya-nedvizhimost/krym/",
      "/investicionnaya-nedvizhimost/krym/yalta/",
      "/investicionnaya-nedvizhimost/krym/sevastopol/",
      "/investicionnaya-nedvizhimost/krym/evpatoriya/",
      "/investicionnaya-nedvizhimost/krym/alushta/",
      "/investicionnaya-nedvizhimost/krym/novostroyki/",
      "/investicionnaya-nedvizhimost/krym/apartamenty/",
      "/investicionnaya-nedvizhimost/arkhyz/",
      "/investicionnaya-nedvizhimost/altay/",
    ],
  );
});

test("investment hub page does not read the legacy regions JSON list", () => {
  const source = readFileSync("src/app/(site)/investicionnaya-nedvizhimost/page.tsx", "utf8");

  assert.match(source, /getRegionHubPlan/);
  assert.doesNotMatch(source, /listRegions\(/);
  assert.doesNotMatch(source, /heroMediaId/);
  assert.match(source, /mediaSourceLabel/);
});
