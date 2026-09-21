import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { cmsPageSitemapEntries, mergeSitemapEntries, publicRegionSitemapEntries, publishedCatalogSitemapEntries, articleSitemapEntries } from "../src/seo/sitemap-source-contract.ts";
import { isAllowedSitemapCanonical, rejectDisallowedSitemapEntries } from "../src/seo/newbuild-indexing.ts";

test("sitemap route is dynamic and wired to the DB-backed source", () => {
  const source = readFileSync("src/app/sitemap.ts", "utf8");

  assert.match(source, /dynamic\s*=\s*"force-dynamic"/);
  assert.match(source, /getSitemapEntries/);
});

test("CMS sitemap excludes drafts, archived and noindex pages", () => {
  const entries = cmsPageSitemapEntries([
    { path: "/draft/", status: "draft", seo: { robots: "index-follow", priority: "P2" } },
    { path: "/archived/", status: "archived", seo: { robots: "index-follow", priority: "P2" } },
    { path: "/noindex/", status: "published", seo: { robots: "noindex-follow", priority: "P2" } },
    { path: "/published", status: "published", seo: { robots: "index-follow", priority: "P1" } },
    { path: "/override/", status: "published", seo: { canonicalOverride: "/canonical/", robots: "index-follow", priority: "P3" } },
  ]);

  assert.deepEqual(entries, [
    { canonical: "/published/", priority: "P1" },
    { canonical: "/canonical/", priority: "P3" },
  ]);
});

test("CMS sitemap read logs infrastructure failure instead of silent merge-only fallback", () => {
  const source = readFileSync("src/seo/sitemap-source.ts", "utf8");
  const reader = readFileSync("src/core/data-access/public/sitemap-pages.ts", "utf8");

  assert.match(source, /listPublishedSitemapPages\(/);
  assert.doesNotMatch(source, /(?:from\s+["']payload["']|@payloadcms|payload\.config|publicReadWithFallback)/);
  assert.match(reader, /publicReadWithFallback\(/);
  assert.match(reader, /reader:\s*"sitemap-cms-pages"/);
  assert.match(reader, /overrideAccess:\s*false/);
  assert.match(reader, /depth:\s*0/);
  assert.match(reader, /limit:\s*1000/);
  assert.match(reader, /status:\s*\{\s*equals:\s*"published"/s);
  assert.doesNotMatch(source, /catch \{\s*return mergeSitemapEntries/s);
});

test("sitemap merge keeps first canonical occurrence", () => {
  assert.deepEqual(
    mergeSitemapEntries([
      { canonical: "/a/", priority: "P1" },
      { canonical: "/a/", priority: "P3" },
      { canonical: "/b/", priority: "P2" },
    ]),
    [
      { canonical: "/a/", priority: "P1" },
      { canonical: "/b/", priority: "P2" },
    ],
  );
});

test("unified sitemap sources cover registry, CMS pages, passports, complexes and developers", () => {
  const source = readFileSync("src/seo/sitemap-source.ts", "utf8");
  assert.match(source, /staticRegistrySitemapEntries\(/);
  assert.match(source, /cmsPageSitemapEntries\(/);
  assert.match(source, /listPublishedManualProperties\(/);
  assert.match(source, /listPublishedComplexes\(/);
  assert.match(source, /listPublishedDevelopers\(/);
  assert.match(source, /articleSitemapEntries\(/);
});

test("published catalog paths become sitemap entries and articles stay empty until later", () => {
  assert.deepEqual(publishedCatalogSitemapEntries([{ path: "/obekty/sample-resort" }, { path: "/zastroyshchik/sample-developer/" }]), [
    { canonical: "/obekty/sample-resort/", priority: "P1" },
    { canonical: "/zastroyshchik/sample-developer/", priority: "P1" },
  ]);
  assert.deepEqual(articleSitemapEntries(), []);
});

test("published region enters sitemap while hidden and stub regions stay absent", () => {
  const base = {
    image: { alt: "Test", height: 1, src: "/images/fallback.svg", width: 1 },
    investmentThesis: "t",
    kind: "region",
    lead: "l",
    pageId: "region:test",
    riskSummary: "r",
    title: "Test",
  };

  assert.deepEqual(
    publicRegionSitemapEntries([
      { ...base, id: "published", path: "/investicionnaya-nedvizhimost/published/", slug: "published", status: "published" },
      { ...base, id: "hidden", path: "/investicionnaya-nedvizhimost/hidden/", slug: "hidden", status: "hidden" },
      { ...base, id: "stub", path: "/investicionnaya-nedvizhimost/stub/", slug: "stub", status: "stub" },
    ]),
    [{ canonical: "/investicionnaya-nedvizhimost/published/", priority: "P1" }],
  );
});

test("sitemap never includes filter states, unit routes or layout routes", () => {
  const source = readFileSync("src/seo/sitemap-source.ts", "utf8");
  assert.match(source, /rejectDisallowedSitemapEntries\(/);
  assert.equal(isAllowedSitemapCanonical("/novostroyki/sample-complex/"), true);
  assert.equal(isAllowedSitemapCanonical("/novostroyki/?rooms=2"), false);
  assert.equal(isAllowedSitemapCanonical("/novostroyki/sample-complex/lot-1001/"), false);
  assert.equal(isAllowedSitemapCanonical("/novostroyki/sample-complex/planirovki/evro-2/"), false);
  assert.deepEqual(
    rejectDisallowedSitemapEntries([
      { canonical: "/novostroyki/sample-complex/", priority: "P1" },
      { canonical: "/novostroyki/?rooms=2", priority: "P2" },
      { canonical: "/novostroyki/sample-complex/lot-1001/", priority: "P3" },
    ]),
    [{ canonical: "/novostroyki/sample-complex/", priority: "P1" }],
  );
});

test("sitemap excludes technical preview and database proof fixtures", () => {
  const fixtures = [
    "/obekty/db-proof-published/",
    "/obekty/db-proof-draft/",
    "/obekty/preview-project/",
    "/novostroyki/preview-complex/",
    "/zastroyshchik/preview-developer/",
  ];

  for (const fixture of fixtures) {
    assert.equal(isAllowedSitemapCanonical(fixture), false, `${fixture} must stay outside sitemap`);
  }

  assert.deepEqual(
    rejectDisallowedSitemapEntries([
      { canonical: "/obekty/verified-passport/", priority: "P1" },
      ...fixtures.map((canonical) => ({ canonical, priority: "P1" })),
    ]),
    [{ canonical: "/obekty/verified-passport/", priority: "P1" }],
  );
});

test("published property, complex and developer appear in sitemap after CMS revalidate without rebuild", async () => {
  const { newbuildComplexSitemapEntries } = await import("../src/seo/newbuild-indexing.ts");
  const { createCmsMutationInvalidationHook } = await import("../src/core/cache/collection-invalidation.ts");

  const published = {
    complexes: [],
    developers: [],
    properties: [],
  };
  const sitemapCache = new Map();

  function computeSitemap() {
    return rejectDisallowedSitemapEntries(
      mergeSitemapEntries([
        ...publishedCatalogSitemapEntries(published.properties),
        ...newbuildComplexSitemapEntries(published.complexes),
        ...publishedCatalogSitemapEntries(published.developers),
      ]),
    );
  }

  function readSitemap() {
    if (!sitemapCache.has("sitemap-entries")) {
      sitemapCache.set("sitemap-entries", computeSitemap());
    }
    return sitemapCache.get("sitemap-entries");
  }

  sitemapCache.set("sitemap-entries", []);
  assert.deepEqual(readSitemap(), []);

  const invalidator = {
    async invalidate(targets) {
      if (targets.some((target) => target.kind === "tag" && target.tag === "sitemap")) {
        sitemapCache.delete("sitemap-entries");
      }
    },
  };
  const logger = { error() {}, info() {} };

  published.properties = [{ path: "/obekty/fresh-passport/" }];
  published.complexes = [{ path: "/novostroyki/fresh-complex/" }];
  published.developers = [{ path: "/zastroyshchik/fresh-developer/" }];

  await createCmsMutationInvalidationHook("properties", { invalidator, logger })({
    doc: { slug: "fresh-passport", status: "published" },
  });
  await createCmsMutationInvalidationHook("residential-complexes", { invalidator, logger })({
    doc: { slug: "fresh-complex", status: "published" },
  });
  await createCmsMutationInvalidationHook("developers", { invalidator, logger })({
    doc: { slug: "fresh-developer", status: "published" },
  });

  const entries = readSitemap();
  assert.deepEqual(
    entries.map((entry) => entry.canonical).sort(),
    ["/novostroyki/fresh-complex/", "/obekty/fresh-passport/", "/zastroyshchik/fresh-developer/"],
  );

  const source = readFileSync("src/seo/sitemap-source.ts", "utf8");
  assert.match(source, /tags:\s*\[[^\]]*["']sitemap["']/);
  const route = readFileSync("src/app/sitemap.ts", "utf8");
  assert.match(route, /force-dynamic/);
});
