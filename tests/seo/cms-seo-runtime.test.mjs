import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { cmsPageSitemapEntries } from "../../src/seo/sitemap-source-contract.ts";

const page = (path, overrides = {}) => ({
  path,
  seo: { canonicalOverride: undefined, priority: "P2", robots: "index-follow", ...overrides },
  status: "published",
});

test("CMS sitemap accepts only runtime-supported paths and respects robots", () => {
  assert.deepEqual(cmsPageSitemapEntries([page("/analitika/")], "production"), [{ canonical: "/analitika/", priority: "P2" }]);
  assert.deepEqual(cmsPageSitemapEntries([page("/unknown-cms-page/")], "production"), []);
  assert.deepEqual(cmsPageSitemapEntries([page("/privacy/", { canonicalOverride: "/unknown-cms-page/" })], "production"), []);
  assert.deepEqual(cmsPageSitemapEntries([page("/privacy/", { robots: "noindex-follow" })], "production"), []);
  assert.deepEqual(cmsPageSitemapEntries([page("/privacy/")], "staging"), []);
});

test("CMS metadata and sitemap share controlled canonical override semantics", async () => {
  process.env.AMS_PROFILE = "REALTY_BASE";
  process.env.TZ = "Europe/Moscow";
  process.env.DATABASE_URI = "postgresql://test:test@127.0.0.1:5432/test";
  process.env.PAYLOAD_SECRET = "test-secret-that-is-long-enough-for-validation";
  process.env.NEXT_PUBLIC_SERVER_URL = "http://127.0.0.1:3000";
  const { sourceFromCmsSeo } = await import("../../src/seo/page-metadata.ts");
  const source = sourceFromCmsSeo({
    canonical: "/privacy/", description: "Policy", publicationStatus: "published",
    routeSupported: true,
    runtimeContour: "production",
    seo: { canonicalOverride: "/privacy", robots: "index-follow", title: "Privacy" },
  });
  assert.equal(source.canonical, "/privacy/");
  assert.equal(source.robots, "index-follow");
});

test("complex and developer Public DTOs carry CMS SEO into runtime metadata", () => {
  const gateway = readFileSync("src/core/data-access/public/newbuilds.ts", "utf8");
  const complexPage = readFileSync("src/app/(site)/novostroyki/[slug]/page.tsx", "utf8");
  const developerPage = readFileSync("src/app/(site)/zastroyshchik/[slug]/page.tsx", "utf8");
  assert.match(gateway, /seo:\s*true/);
  assert.match(complexPage, /sourceFromCmsSeo/);
  assert.match(developerPage, /sourceFromCmsSeo/);
});
