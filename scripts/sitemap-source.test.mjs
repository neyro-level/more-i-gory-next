import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { cmsPageSitemapEntries, mergeSitemapEntries } from "../src/seo/sitemap-source-contract.ts";

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
