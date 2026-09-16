import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { findRegionRouteBySegments, getRegionRoutePath, getRegionRoutePlan, regionRouteEntries } from "../src/content/regions/region-route-plan.ts";

test("region routes are computed from slug plus parent chain", () => {
  const yalta = regionRouteEntries.find((entry) => entry.key === "yalta");
  const novostroyki = regionRouteEntries.find((entry) => entry.key === "krym-novostroyki");

  assert.equal(getRegionRoutePath(yalta), "/investicionnaya-nedvizhimost/krym/yalta/");
  assert.equal(getRegionRoutePath(novostroyki), "/investicionnaya-nedvizhimost/krym/novostroyki/");
  assert.equal(findRegionRouteBySegments(["krym", "yalta"])?.key, "yalta");
  assert.equal(findRegionRouteBySegments(["krym", "unknown"]), null);
});

test("catch-all route replaces explicit region route folders", () => {
  assert.equal(existsSync("src/app/(site)/investicionnaya-nedvizhimost/[...path]/page.tsx"), true);

  for (const route of [
    "src/app/(site)/investicionnaya-nedvizhimost/krym/page.tsx",
    "src/app/(site)/investicionnaya-nedvizhimost/krym/yalta/page.tsx",
    "src/app/(site)/investicionnaya-nedvizhimost/krym/sevastopol/page.tsx",
    "src/app/(site)/investicionnaya-nedvizhimost/krym/evpatoriya/page.tsx",
    "src/app/(site)/investicionnaya-nedvizhimost/krym/alushta/page.tsx",
    "src/app/(site)/investicionnaya-nedvizhimost/arkhyz/page.tsx",
    "src/app/(site)/investicionnaya-nedvizhimost/altay/page.tsx",
  ]) {
    assert.equal(existsSync(route), false, `${route} should be handled by the catch-all route`);
  }
});

test("region route plan does not store a third path field", () => {
  const source = readFileSync("src/content/regions/region-route-plan.ts", "utf8");
  const plan = getRegionRoutePlan();

  assert.equal(/path:\s*["']\/investicionnaya-nedvizhimost/.test(source), false);
  assert.equal(plan.every((entry) => entry.path.startsWith("/investicionnaya-nedvizhimost/")), true);
});
