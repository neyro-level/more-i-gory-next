import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildAnalyticsDimensions } from "../src/core/analytics/dimensions.ts";
import { breadcrumbStructuredData } from "../src/core/navigation/breadcrumbs.ts";
import { buildPublicLinkGraph, reachablePaths } from "../src/core/navigation/internal-link-graph.ts";
import {
  filterPublicNavigationLinks,
  getPlannedRegionNavigationState,
} from "../src/core/navigation/public-link-policy.ts";

const image = { alt: "image", height: 100, src: "/images/og/default.webp", width: 100 };
const region = (slug, status = "published", parentSlug) => ({
  id: slug,
  image,
  investmentThesis: "Verified thesis",
  kind: parentSlug ? "locality" : "region",
  lead: "Verified lead",
  pageId: slug,
  pageKey: parentSlug ? "CITY" : "REGION",
  parentSlug,
  path: parentSlug ? `/${parentSlug}/${slug}/` : `/${slug}/`,
  riskSummary: "Verified risk",
  slug,
  status,
  title: slug,
});
const project = {
  facts: [{ label: "Факт", value: "Значение" }],
  geoContext: {
    cityOrArea: { id: "yalta", path: "/krym/yalta/", slug: "yalta", status: "published", title: "Ялта" },
    region: { id: "krym", path: "/krym/", slug: "krym", status: "published", title: "Крым" },
  },
  id: "project",
  image,
  path: "/obekty/project/",
  publishedAt: "2026-09-24",
  regionLabel: "Ялта",
  riskSummary: "risk",
  slug: "project",
  sources: [{ label: "source" }],
  status: "active",
  title: "Project",
  verdict: "verdict",
  verifiedAt: "2026-09-24",
};

test("internal-link graph keeps every active candidate reachable without hidden geo", () => {
  const graph = buildPublicLinkGraph([
    region("krym"),
    region("yalta", "published", "krym"),
    region("arkhyz", "hidden"),
  ], [project]);
  const reachable = reachablePaths(graph);
  for (const path of ["/krym/", "/krym/yalta/", "/obekty/project/"]) {
    assert.equal(reachable.has(path), true, `${path} must not be orphaned`);
  }
  assert.equal(reachable.has("/arkhyz/"), false);
});

test("breadcrumb JSON-LD is generated from the exact visible hierarchy", () => {
  const items = [
    { href: "/", label: "Главная" },
    { href: "/obekty/", label: "Объекты" },
    { label: "Project" },
  ];
  const data = breadcrumbStructuredData(items, "https://example.test");
  assert.deepEqual(data.itemListElement.map(({ name, position }) => ({ name, position })), [
    { name: "Главная", position: 1 },
    { name: "Объекты", position: 2 },
    { name: "Project", position: 3 },
  ]);
  assert.equal(data.itemListElement[2].item, undefined);
});

test("navigation state excludes PREPARED_OFF and STUB_NO_INDEX markets", () => {
  assert.equal(getPlannedRegionNavigationState("/krym/"), "PREPARED_OFF");
  assert.equal(getPlannedRegionNavigationState("/sochi/"), "STUB_NO_INDEX");
  assert.deepEqual(filterPublicNavigationLinks([
    { href: "/krym/", label: "Крым", nofollow: false, openInNewTab: false },
    { href: "/sochi/", label: "Сочи", nofollow: false, openInNewTab: false },
    { href: "/obekty/", label: "Объекты", nofollow: false, openInNewTab: false },
  ]).map((item) => item.href), ["/obekty/"]);
});

test("analytics dimensions allow only the non-PII contract", () => {
  const dimensions = buildAnalyticsDimensions({
    page_key: "INVESTMENT_PROJECT",
    project_slug: "yalta-residence",
    region_slug: "krym",
    source_surface: "project_passport",
    email: "owner@example.test",
  });
  assert.deepEqual(dimensions, {
    page_key: "investment_project",
    project_slug: "yalta-residence",
    region_slug: "krym",
    source_surface: "project_passport",
  });
  assert.equal(JSON.stringify(dimensions).includes("owner@example.test"), false);
});

test("public article linking contains no prepared-off Crimea segment", () => {
  const article = readFileSync("src/app/(site)/analitika/[slug]/page.tsx", "utf8");
  assert.equal(article.includes("/investicionnaya-nedvizhimost/krym/novostroyki/"), false);
  for (const href of ["/novostroyki/", "/metodika/", "/podbor/"]) {
    assert.equal(article.includes(`href=\"${href}\"`), true);
  }
});
