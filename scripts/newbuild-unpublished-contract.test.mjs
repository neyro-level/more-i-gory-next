import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { Buildings } from "../src/project/collections/buildings.ts";
import { Developers } from "../src/project/collections/developers.ts";
import { Layouts } from "../src/project/collections/layouts.ts";
import { ResidentialComplexes } from "../src/project/collections/residential-complexes.ts";
import { fallbackSiteChrome } from "../src/core/data-access/public/site-chrome-contract.ts";

const newbuildMigrationFiles = [
  "migrations/20260916_231730_newbuild_schema.ts",
  "migrations/20260916_232544_newbuild_property_links.ts",
];

function field(collection, name) {
  return collection.fields.find((candidate) => candidate.name === name);
}

function statusDefault(collection) {
  return field(collection, "status")?.defaultValue;
}

function migrationSource(file) {
  return fs.readFileSync(file, "utf8");
}

test("newbuild migrations are expand-only and do not backfill data", () => {
  for (const file of newbuildMigrationFiles) {
    const source = migrationSource(file);

    assert.doesNotMatch(source, /\binsert\s+into\b/i, `${file} must not insert data`);
    assert.doesNotMatch(source, /\bupdate\s+["\w.]+\s+set\b/i, `${file} must not update existing data`);
    assert.doesNotMatch(source, /\bdelete\s+from\b/i, `${file} must not delete existing data`);
  }
});

test("newbuild collections default to hidden and versioned editorial collections keep draft workflow", () => {
  assert.equal(statusDefault(Developers), "hidden");
  assert.equal(statusDefault(ResidentialComplexes), "hidden");
  assert.equal(statusDefault(Buildings), "hidden");
  assert.equal(statusDefault(Layouts), "hidden");
  assert.deepEqual(Developers.versions, { drafts: true, maxPerDoc: 20 });
  assert.deepEqual(ResidentialComplexes.versions, { drafts: true, maxPerDoc: 20 });
  assert.equal(Buildings.versions, false);
  assert.equal(Layouts.versions, false);
});

test("newbuild catalog routes are not created before EPIC 17", () => {
  const siteAppDir = path.resolve("src/app/(site)");
  const routeEntries = fs.readdirSync(siteAppDir, { recursive: true, withFileTypes: true });
  const routeNames = routeEntries.map((entry) => entry.name);

  for (const forbidden of ["developers", "residential-complexes", "buildings", "layouts", "novostroyki"]) {
    assert.equal(routeNames.includes(forbidden), false, `${forbidden} route must not exist before EPIC 17`);
  }
});

test("newbuild catalog is outside sitemap and fallback navigation", () => {
  const registry = JSON.parse(fs.readFileSync("src/seo/registry.json", "utf8"));
  const newbuildEntries = registry.filter((entry) => entry.canonical.includes("/novostroyki/"));

  assert.ok(newbuildEntries.length > 0, "regional newbuild gate entries should stay explicit in SEO registry");
  for (const entry of newbuildEntries) {
    assert.notEqual(entry.sitemap, "yes", `${entry.pageId} must not be sitemap=yes before publication gate`);
  }
  assert.equal(registry.some((entry) => entry.canonical === "/novostroyki/"), false);

  const fallbackLinks = [
    ...fallbackSiteChrome.navigation.header,
    ...fallbackSiteChrome.navigation.footer,
    fallbackSiteChrome.navigation.headerCta,
    ...fallbackSiteChrome.navigation.legal,
  ].map((item) => item.href);

  assert.equal(fallbackLinks.some((href) => href.includes("/novostroyki/")), false);
});
