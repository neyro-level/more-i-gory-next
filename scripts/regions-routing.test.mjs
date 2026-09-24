import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { composeRegionPathFromSlugs } from "../src/content/regions/region-path-policy.ts";
import { findRegionRouteBySegments, getRegionRoutePath, getRegionRoutePlan, regionRouteEntries } from "../src/content/regions/region-route-plan.ts";
import { composePublicRegionPath, getPublicRegionStaticParams, isGenericPublicRegion } from "../src/core/data-access/public/regions-contract.ts";

test("region routes are computed from slug plus parent chain", () => {
  const yalta = regionRouteEntries.find((entry) => entry.key === "yalta");
  const novostroyki = regionRouteEntries.find((entry) => entry.key === "krym-novostroyki");

  assert.equal(getRegionRoutePath(yalta), "/krym/yalta/");
  assert.equal(getRegionRoutePath(novostroyki), "/investicionnaya-nedvizhimost/krym/novostroyki/");
  assert.equal(findRegionRouteBySegments(["krym", "yalta"])?.key, "yalta");
  assert.equal(findRegionRouteBySegments(["krym", "unknown"]), null);
});

test("public geo path uses RouteIdentity builder, slug and CMS parent relation", () => {
  assert.equal(composeRegionPathFromSlugs(["krym"]), "/krym/");
  assert.equal(composeRegionPathFromSlugs(["krym", "yalta"]), "/krym/yalta/");
  assert.equal(
    composePublicRegionPath(
      { id: 2, investmentThesis: "t", kind: "locality", lead: "l", order: 2, pageKey: "CITY", riskSummary: "r", slug: "yalta", status: "hidden", title: "Ялта", parent: { id: 1, slug: "krym" } },
      [
        { id: 1, investmentThesis: "t", kind: "region", lead: "l", order: 1, riskSummary: "r", slug: "krym", status: "hidden", title: "Крым" },
        { id: 2, investmentThesis: "t", kind: "locality", lead: "l", order: 2, pageKey: "CITY", riskSummary: "r", slug: "yalta", status: "hidden", title: "Ялта", parent: { id: 1, slug: "krym" } },
      ],
    ),
    "/krym/yalta/",
  );
  assert.throws(() => composeRegionPathFromSlugs(["Yalta"]));
});

test("generic region route accepts only published entities", () => {
  const baseRegion = {
    id: "region:test",
    image: { alt: "", height: 1, src: "/images/fallback.svg", width: 1 },
    investmentThesis: "t",
    kind: "region",
    lead: "l",
    pageId: "region:test",
    path: "/test/",
    pageKey: "REGION",
    riskSummary: "r",
    slug: "test",
    title: "Test",
  };

  assert.equal(isGenericPublicRegion({ ...baseRegion, status: "published" }), true);
  assert.equal(isGenericPublicRegion({ ...baseRegion, status: "hidden" }), false);
  assert.equal(isGenericPublicRegion({ ...baseRegion, status: "stub" }), false);
  assert.equal(isGenericPublicRegion(null), false);
});

test("static params contain published regions only", () => {
  const region = {
    id: "region:test",
    image: { alt: "Test", height: 1, src: "/images/fallback.svg", width: 1 },
    investmentThesis: "t",
    kind: "region",
    lead: "l",
    pageId: "region:test",
    path: "/test/",
    pageKey: "REGION",
    riskSummary: "r",
    slug: "test",
    title: "Test",
  };
  const params = getPublicRegionStaticParams([
    { ...region, status: "published" },
    { ...region, id: "hidden", path: "/hidden/", slug: "hidden", status: "hidden" },
    { ...region, id: "stub", path: "/stub/", slug: "stub", status: "stub" },
  ]);

  assert.deepEqual(params, [{ path: ["test"] }]);
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

test("catch-all region route composes path from CMS records and reserved namespace", () => {
  const page = readFileSync("src/app/(site)/investicionnaya-nedvizhimost/[...path]/page.tsx", "utf8");
  assert.match(page, /composeRegionPathFromSlugs/);
  assert.match(page, /listPublicHubRegions/);
  assert.match(page, /getPublicRegionByPath/);
  assert.doesNotMatch(page, /export function generateStaticParams/);
});

test("runtime verification exposes unpublished regions only on the noindex staging contour", () => {
  const source = readFileSync("scripts/verify-runtime.mjs", "utf8");

  assert.match(source, /unpublishedGenericRegionPaths/);
  assert.match(source, /V5_URL_MANIFEST\.json/);
  assert.match(source, /unpublishedGenericRegionPaths\.add\(entry\.currentCanonical\)/);
  assert.match(source, /fetchRoute\(pathname, stagingContour \? 200 : 404\)/);
  assert.match(source, /Preview-only region must remain noindex/);
  assert.match(source, /Hidden region leaked into sitemap/);
});

test("normalized geo route plan delegates canonicals to the shared builder", () => {
  const source = readFileSync("src/content/regions/region-route-plan.ts", "utf8");
  const plan = getRegionRoutePlan();

  assert.equal(/path:\s*["']\/investicionnaya-nedvizhimost/.test(source), false);
  assert.equal(plan.find((entry) => entry.key === "krym")?.path, "/krym/");
  assert.equal(plan.find((entry) => entry.key === "yalta")?.path, "/krym/yalta/");
  assert.equal(plan.find((entry) => entry.key === "krym-apartamenty")?.path, "/investicionnaya-nedvizhimost/krym/apartamenty/");
});
