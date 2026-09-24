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
  sample({ id: 1, kind: "region", order: 10, pageKey: "REGION", slug: "krym", status: "published", title: "Крым" }),
  sample({ id: 2, kind: "locality", order: 20, pageKey: "CITY", parent: { id: 1, slug: "krym" }, slug: "yalta", status: "published", title: "Ялта" }),
  sample({ id: 3, kind: "locality", order: 30, pageKey: "CITY", parent: { id: 1, slug: "krym" }, slug: "sevastopol", status: "published", title: "Севастополь" }),
  sample({ id: 4, kind: "segment", order: 60, parent: { id: 1, slug: "krym" }, slug: "novostroyki", status: "published", title: "Новостройки Крыма" }),
  sample({ id: 5, kind: "segment", order: 70, parent: { id: 1, slug: "krym" }, slug: "apartamenty", status: "published", title: "Апартаменты Крыма" }),
  sample({ id: 6, kind: "region", order: 100, slug: "sochi", status: "stub", title: "Сочи" }),
  sample({ id: 7, kind: "locality", order: 110, parent: { id: 1, slug: "krym" }, slug: "hidden-city", status: "hidden", title: "Hidden City" }),
]);

test("Crimea region links to normalized locations, methodology and objects without legacy segments", () => {
  const krym = regions.find((region) => region.slug === "krym");
  const hrefs = getPublicRegionRelatedLinks(krym, regions).map((link) => link.href);

  assert.ok(hrefs.includes("/krym/yalta/"));
  assert.equal(hrefs.includes("/investicionnaya-nedvizhimost/krym/novostroyki/"), false);
  assert.equal(hrefs.includes("/investicionnaya-nedvizhimost/krym/apartamenty/"), false);
  assert.ok(hrefs.includes("/metodika/"));
  assert.ok(hrefs.includes("/obekty/"));
  assert.equal(hrefs.includes("/investicionnaya-nedvizhimost/sochi/"), false);
  assert.equal(hrefs.includes("/investicionnaya-nedvizhimost/krym/hidden-city/"), false);
});

test("hidden parent cannot create a public parent link", () => {
  const hiddenParentRegions = mapPublicRegions([
    sample({ id: 10, kind: "region", order: 10, slug: "hidden-parent", status: "hidden", title: "Hidden Parent" }),
    sample({ id: 11, kind: "locality", order: 20, parent: { id: 10, slug: "hidden-parent" }, slug: "published-child", status: "published", title: "Published Child" }),
  ]);
  const child = hiddenParentRegions.find((region) => region.slug === "published-child");
  const hrefs = getPublicRegionRelatedLinks(child, hiddenParentRegions).map((link) => link.href);

  assert.equal(hrefs.includes("/investicionnaya-nedvizhimost/hidden-parent/"), false);
});

test("Crimea child pages link back to Crimea and sibling locations or segments", () => {
  const yalta = regions.find((region) => region.slug === "yalta");
  const hrefs = getPublicRegionRelatedLinks(yalta, regions).map((link) => link.href);

  assert.ok(hrefs.includes("/krym/"));
  assert.ok(hrefs.includes("/krym/sevastopol/"));
  assert.equal(hrefs.includes("/investicionnaya-nedvizhimost/krym/novostroyki/"), false);
  assert.ok(hrefs.includes("/metodika/"));
  assert.ok(hrefs.includes("/obekty/"));
});

test("Crimea newbuilds get the approved catalog cross-link", () => {
  const novostroyki = regions.find((region) => region.slug === "novostroyki");
  const hrefs = getPublicRegionRelatedLinks(novostroyki, regions).map((link) => link.href);
  assert.ok(hrefs.includes("/novostroyki/"));
});

test("region page renders related links from CMS hierarchy", () => {
  const source = readFileSync("src/app/(site)/_shared/region-route-page.tsx", "utf8");

  assert.match(source, /getPublicRegionRelatedLinks/);
  assert.match(source, /relatedLinks\.map/);
  assert.doesNotMatch(source, /getRegionRelatedLinks/);
  assert.doesNotMatch(source, /novostroyki-yalt/);
});
