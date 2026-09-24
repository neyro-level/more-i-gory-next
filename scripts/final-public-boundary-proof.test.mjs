import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  getPublicRegionRelatedLinks,
  getPublicRegionStaticParams,
  isGenericPublicRegion,
  mapPublicRegions,
} from "../src/core/data-access/public/regions-contract.ts";
import { publicRegionSitemapEntries } from "../src/seo/sitemap-source-contract.ts";

const fixture = mapPublicRegions([
  {
    id: "published",
    investmentThesis: "Published thesis",
    kind: "region",
    lead: "Published lead",
    order: 1,
    pageKey: "REGION",
    riskSummary: "Published risk",
    slug: "published",
    status: "published",
    title: "Published",
  },
  {
    id: "hidden",
    investmentThesis: "Hidden thesis",
    kind: "region",
    lead: "Hidden lead",
    order: 2,
    pageKey: "REGION",
    riskSummary: "Hidden risk",
    slug: "hidden",
    status: "hidden",
    title: "Hidden",
  },
  {
    id: "stub",
    investmentThesis: "Stub thesis",
    kind: "region",
    lead: "Stub lead",
    order: 3,
    pageKey: "REGION",
    riskSummary: "Stub risk",
    slug: "stub",
    status: "stub",
    title: "Stub",
  },
]);

test("final public boundary exposes published and rejects hidden plus stub in every generic consumer", () => {
  const published = fixture.filter((region) => region.status === "published");
  const [publishedRegion, hiddenRegion, stubRegion] = fixture;

  assert.deepEqual(published.map((region) => region.slug), ["published"]);
  assert.deepEqual(getPublicRegionStaticParams(fixture), [{ path: ["published"] }]);
  assert.deepEqual(publicRegionSitemapEntries(fixture), [
    { canonical: "/published/", priority: "P1" },
  ]);
  assert.equal(isGenericPublicRegion(publishedRegion), true);
  assert.equal(isGenericPublicRegion(hiddenRegion), false);
  assert.equal(isGenericPublicRegion(stubRegion), false);
  assert.equal(getPublicRegionRelatedLinks(publishedRegion, fixture).some((link) => /hidden|stub/.test(link.href)), false);
});

test("final public gateway, hub and catch-all route retain the published-only contract", () => {
  const gateway = readFileSync("src/core/data-access/public/regions.ts", "utf8");
  const route = readFileSync("src/app/(site)/investicionnaya-nedvizhimost/[...path]/page.tsx", "utf8");

  assert.match(gateway, /export const listPublicRegions/);
  assert.match(gateway, /where:\s*\{\s*status:\s*\{\s*equals:\s*"published"/s);
  assert.match(gateway, /listPublicHubRegions/);
  assert.match(gateway, /region\.status === "published" && region\.slug !== "sochi"/);
  assert.match(route, /getPublicRegionByPath/);
  assert.match(route, /isGenericPublicRegion/);
  assert.match(route, /getPublicRegionRelatedLinks/);
  assert.match(route, /notFound\(\)/);
});
