import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getRegionRelatedLinks, getRegionRoutePlan } from "../src/content/regions/region-route-plan.ts";

const byKey = new Map(getRegionRoutePlan().map((entry) => [entry.key, entry]));

test("Crimea region links to locations, segments, methodology and objects without stubs", () => {
  const links = getRegionRelatedLinks(byKey.get("krym"));
  const hrefs = links.map((link) => link.href);

  assert.ok(hrefs.includes("/investicionnaya-nedvizhimost/krym/yalta/"));
  assert.ok(hrefs.includes("/investicionnaya-nedvizhimost/krym/novostroyki/"));
  assert.ok(hrefs.includes("/investicionnaya-nedvizhimost/krym/apartamenty/"));
  assert.ok(hrefs.includes("/metodika/"));
  assert.ok(hrefs.includes("/obekty/"));
  assert.equal(hrefs.includes("/investicionnaya-nedvizhimost/sochi/"), false);
});

test("Crimea child pages link back to Crimea and sibling locations or segments", () => {
  const links = getRegionRelatedLinks(byKey.get("yalta"));
  const hrefs = links.map((link) => link.href);

  assert.ok(hrefs.includes("/investicionnaya-nedvizhimost/krym/"));
  assert.ok(hrefs.includes("/investicionnaya-nedvizhimost/krym/sevastopol/"));
  assert.ok(hrefs.includes("/investicionnaya-nedvizhimost/krym/novostroyki/"));
  assert.ok(hrefs.includes("/metodika/"));
  assert.ok(hrefs.includes("/obekty/"));
});

test("region page renders related links from the route plan", () => {
  const source = readFileSync("src/app/(site)/investicionnaya-nedvizhimost/[...path]/page.tsx", "utf8");

  assert.match(source, /getRegionRelatedLinks/);
  assert.match(source, /relatedLinks\.map/);
  assert.doesNotMatch(source, /novostroyki-yalt/);
});
