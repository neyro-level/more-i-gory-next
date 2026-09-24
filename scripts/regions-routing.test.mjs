import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

import { composeRegionPathFromSlugs } from "../src/content/regions/region-path-policy.ts";
import { findRegionRouteBySegments, getRegionRoutePath, getRegionRoutePlan, regionRouteEntries } from "../src/content/regions/region-route-plan.ts";
import { composePublicRegionPath, getPublicRegionStaticParams, isGenericPublicRegion } from "../src/core/data-access/public/regions-contract.ts";
import { isRegionPublicRoute, resolveRegionActivation } from "../src/core/regions/activation.ts";

const seoRegistry = JSON.parse(readFileSync("src/seo/registry.json", "utf8"));
const urlMigrationManifest = JSON.parse(readFileSync("docs/migration/V5_URL_MANIFEST.json", "utf8"));
const migrationByCurrentPath = new Map(
  urlMigrationManifest.entries.map((entry) => [entry.currentPattern, entry]),
);

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

test("future geo activation is status-driven for every approved region", () => {
  assert.equal(resolveRegionActivation("published"), "ACTIVE");
  assert.equal(resolveRegionActivation("stub"), "STUB_NO_INDEX");
  assert.equal(resolveRegionActivation("hidden"), "PREPARED_OFF");
  assert.equal(isRegionPublicRoute("published"), true);
  assert.equal(isRegionPublicRoute("stub"), true);
  assert.equal(isRegionPublicRoute("hidden"), false);

  const plan = getRegionRoutePlan();
  assert.deepEqual(
    ["arkhyz", "altay", "sochi"].map((key) => plan.find((entry) => entry.key === key)?.path),
    ["/arkhyz/", "/altay/", "/sochi/"],
  );
  const routeSources = ["arkhyz", "altay", "sochi"].map((slug) => readFileSync(`src/app/(site)/${slug}/page.tsx`, "utf8"));
  assert.equal(routeSources.every((source) => /RegionRoutePage path=/.test(source)), true);
  assert.equal(routeSources.every((source) => /getRegionRouteMetadata/.test(source)), true);
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

test("approved geo canonicals have explicit App Router ownership", () => {
  assert.equal(existsSync("src/app/(site)/investicionnaya-nedvizhimost/[...path]/page.tsx"), true);

  for (const route of [
    "src/app/(site)/krym/page.tsx",
    "src/app/(site)/krym/yalta/page.tsx",
    "src/app/(site)/krym/sevastopol/page.tsx",
    "src/app/(site)/krym/evpatoriya/page.tsx",
    "src/app/(site)/krym/alushta/page.tsx",
    "src/app/(site)/arkhyz/page.tsx",
    "src/app/(site)/altay/page.tsx",
    "src/app/(site)/sochi/page.tsx",
  ]) {
    assert.equal(existsSync(route), true, `${route} should own an approved canonical`);
  }

  assert.equal(existsSync("src/app/(site)/[...path]/page.tsx"), false);
  assert.equal(existsSync("src/app/(site)/[[...path]]/page.tsx"), false);
});

test("legacy catch-all accepts only manifest-owned paths and activates redirects safely", () => {
  const page = readFileSync("src/app/(site)/investicionnaya-nedvizhimost/[...path]/page.tsx", "utf8");
  assert.match(page, /composeLegacyRegionPathFromSlugs/);
  assert.match(page, /getUrlMigrationByCurrentPath/);
  assert.match(page, /migration\.migrationAction === "REDIRECT_301"/);
  assert.match(page, /region\.status === "published"/);
  assert.match(page, /permanentRedirect\(target\)/);
  assert.doesNotMatch(page, /export function generateStaticParams/);
  assert.equal(migrationByCurrentPath.get("/investicionnaya-nedvizhimost/krym/")?.targetUrl, "/krym/");
  assert.equal(migrationByCurrentPath.has("/investicionnaya-nedvizhimost/fixture-region/"), false);
});

test("runtime verification exposes unpublished regions only on the noindex staging contour", () => {
  const source = readFileSync("scripts/verify-runtime.mjs", "utf8");

  assert.match(source, /unpublishedGenericRegionPaths/);
  assert.match(source, /stubGenericRegionPaths/);
  assert.match(source, /resolveRegionActivation/);
  assert.match(source, /V5_URL_MANIFEST\.json/);
  assert.match(source, /inactiveGeoRedirects/);
  assert.match(source, /entry\.migrationAction === "REDIRECT_301"/);
  assert.match(source, /fetchRoute\(pathname, stagingContour \? 200 : 404\)/);
  assert.match(source, /fetchRoute\(entry\.currentCanonical, stagingContour \? 308 : 404\)/);
  assert.match(source, /Preview-only region must remain noindex/);
  assert.match(source, /Hidden region leaked into sitemap/);
  assert.match(source, /Stub region must remain noindex/);
});

test("normalized geo route plan delegates canonicals to the shared builder", () => {
  const source = readFileSync("src/content/regions/region-route-plan.ts", "utf8");
  const plan = getRegionRoutePlan();

  assert.equal(/path:\s*["']\/investicionnaya-nedvizhimost/.test(source), false);
  assert.doesNotMatch(source, /key !== "sochi"|slug !== "sochi"/);
  assert.equal(plan.find((entry) => entry.key === "krym")?.path, "/krym/");
  assert.equal(plan.find((entry) => entry.key === "yalta")?.path, "/krym/yalta/");
  assert.equal(plan.find((entry) => entry.key === "krym-apartamenty")?.path, "/investicionnaya-nedvizhimost/krym/apartamenty/");
  assert.equal(plan.find((entry) => entry.key === "arkhyz")?.path, "/arkhyz/");
  assert.equal(plan.find((entry) => entry.key === "altay")?.path, "/altay/");
  assert.equal(plan.find((entry) => entry.key === "sochi")?.path, "/sochi/");

  for (const entry of plan.filter((candidate) => candidate.pageKey !== null)) {
    const seo = seoRegistry.find((candidate) => candidate.pageId === entry.pageId);
    assert.equal(seo?.canonical, entry.path, `${entry.pageId} canonical must match the URL builder`);
  }
});
