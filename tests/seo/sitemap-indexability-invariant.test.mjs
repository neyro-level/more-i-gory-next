import assert from "node:assert/strict";
import test from "node:test";

import { publicRegionSitemapEntries } from "../../src/seo/sitemap-source-contract.ts";
import { resolveSeoState } from "../../src/seo/seo-state.ts";

const registryEntry = (index, sitemap) => ({
  canonical: "/krym/", contentGate: "gate", description: "x".repeat(50), h1: "Крым",
  index, kind: "static", pageId: "PAGE-007", primaryQuery: "Крым", priority: "P1",
  secondaryQueries: [], sitemap, title: "Крым для инвестиций",
});

test("sitemap always implies HTTP 200 and effective index", () => {
  const cases = [
    { canonical: "/ok/", registry: { canonical: "/ok/", index: "yes", sitemap: "yes" } },
    { canonical: "/draft/", publicationStatus: "draft" },
    { canonical: "/gone/", lifecycle: "gone" },
    { canonical: "/unsupported/", routeSupported: false },
    { canonical: "/preview/", preview: true },
  ];
  for (const input of cases) {
    const state = resolveSeoState(input);
    if (state.sitemap) {
      assert.equal(state.index, true);
      assert.equal(state.httpStatus, 200);
    }
    if (!state.index) assert.equal(state.sitemap, false);
  }
});

test("published region cannot bypass a gated registry entry", () => {
  const region = {
    id: "1", image: { alt: "Крымский пейзаж", height: 1, src: "/images/fallback.svg", width: 1 },
    investmentThesis: "t", kind: "region", lead: "l", pageId: "PAGE-007", pageKey: "REGION",
    path: "/krym/", riskSummary: "r", slug: "krym", status: "published", title: "Крым",
  };
  assert.deepEqual(publicRegionSitemapEntries([region], [registryEntry("gate", "gate")], "production"), []);
  assert.deepEqual(publicRegionSitemapEntries([region], [registryEntry("yes", "yes")], "production"), [{ canonical: "/krym/", priority: "P1" }]);
});
