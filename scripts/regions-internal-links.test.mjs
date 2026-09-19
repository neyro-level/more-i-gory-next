import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getPublicRegionRelatedLinks, mapPublicRegions } from "../src/core/data-access/public/regions-contract.ts";

function sample(extra = {}) {
  return {
    investmentThesis: "Инвестиционная тезисная часть будет опубликована после проверки объектов.",
    lead: "Черновик региональной страницы до утверждения контента владельцем.",
    riskSummary: "До публикации нельзя обещать доходность без проверки.",
    ...extra,
  };
}

const regions = mapPublicRegions([
  sample({ id: 1, kind: "region", order: 10, slug: "krym", status: "hidden", title: "Крым" }),
  sample({ id: 2, kind: "locality", order: 20, parent: { id: 1, slug: "krym" }, slug: "yalta", status: "hidden", title: "Ялта" }),
  sample({ id: 3, kind: "locality", order: 30, parent: { id: 1, slug: "krym" }, slug: "sevastopol", status: "hidden", title: "Севастополь" }),
  sample({ id: 4, kind: "segment", order: 60, parent: { id: 1, slug: "krym" }, slug: "novostroyki", status: "hidden", title: "Новостройки Крыма" }),
  sample({ id: 5, kind: "segment", order: 70, parent: { id: 1, slug: "krym" }, slug: "apartamenty", status: "hidden", title: "Апартаменты Крыма" }),
  sample({ id: 6, kind: "region", order: 100, slug: "sochi", status: "stub", title: "Сочи" }),
]);

test("Crimea region links to locations, segments, methodology and objects without stubs", () => {
  const krym = regions.find((region) => region.slug === "krym");
  const hrefs = getPublicRegionRelatedLinks(krym, regions).map((link) => link.href);

  assert.ok(hrefs.includes("/investicionnaya-nedvizhimost/krym/yalta/"));
  assert.ok(hrefs.includes("/investicionnaya-nedvizhimost/krym/novostroyki/"));
  assert.ok(hrefs.includes("/investicionnaya-nedvizhimost/krym/apartamenty/"));
  assert.ok(hrefs.includes("/metodika/"));
  assert.ok(hrefs.includes("/obekty/"));
  assert.equal(hrefs.includes("/investicionnaya-nedvizhimost/sochi/"), false);
});

test("Crimea child pages link back to Crimea and sibling locations or segments", () => {
  const yalta = regions.find((region) => region.slug === "yalta");
  const hrefs = getPublicRegionRelatedLinks(yalta, regions).map((link) => link.href);

  assert.ok(hrefs.includes("/investicionnaya-nedvizhimost/krym/"));
  assert.ok(hrefs.includes("/investicionnaya-nedvizhimost/krym/sevastopol/"));
  assert.ok(hrefs.includes("/investicionnaya-nedvizhimost/krym/novostroyki/"));
  assert.ok(hrefs.includes("/metodika/"));
  assert.ok(hrefs.includes("/obekty/"));
});

test("Crimea newbuilds get the approved catalog cross-link", () => {
  const novostroyki = regions.find((region) => region.slug === "novostroyki");
  const hrefs = getPublicRegionRelatedLinks(novostroyki, regions).map((link) => link.href);
  assert.ok(hrefs.includes("/novostroyki/"));
});

test("region page renders related links from CMS hierarchy", () => {
  const source = readFileSync("src/app/(site)/investicionnaya-nedvizhimost/[...path]/page.tsx", "utf8");

  assert.match(source, /getPublicRegionRelatedLinks/);
  assert.match(source, /relatedLinks\.map/);
  assert.doesNotMatch(source, /getRegionRelatedLinks/);
  assert.doesNotMatch(source, /novostroyki-yalt/);
});
