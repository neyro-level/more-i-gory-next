import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  isIndexableNewbuildFilterPath,
  isIndexableNewbuildLayoutPath,
  isIndexableNewbuildUnitPath,
  newbuildComplexSitemapEntries,
} from "../../src/seo/newbuild-indexing.ts";
import registry from "../../src/seo/registry.json" with { type: "json" };

async function listRouteFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listRouteFiles(absolute));
    } else {
      files.push(absolute.replaceAll("\\", "/"));
    }
  }

  return files;
}

test("newbuild catalog root stays gated until published inventory exists", () => {
  const entry = registry.find((item) => item.pageId === "PAGE-026");

  assert.equal(entry?.canonical, "/novostroyki/");
  assert.equal(entry?.index, "gate");
  assert.equal(entry?.sitemap, "gate");
});

test("published residential complexes produce indexable sitemap entries", () => {
  assert.deepEqual(
    newbuildComplexSitemapEntries([
      { path: "/novostroyki/sample-complex/" },
      { path: "novostroyki/second-complex" },
    ], "production"),
    [
      { canonical: "/novostroyki/sample-complex/", priority: "P1" },
      { canonical: "/novostroyki/second-complex/", priority: "P1" },
    ],
  );
});

test("newbuild sitemap source includes published complexes but not units or filters", async () => {
  const source = await readFile("src/seo/sitemap-source.ts", "utf8");

  assert.match(source, /listPublishedComplexes/);
  assert.match(source, /newbuildComplexSitemapEntries/);
  assert.doesNotMatch(source, /listActiveNewbuildInventoryByComplex/);
});

test("newbuild filters, layouts and units are noindex unless explicitly whitelisted", () => {
  assert.equal(isIndexableNewbuildFilterPath("/novostroyki/"), true);
  assert.equal(isIndexableNewbuildFilterPath("/novostroyki/?rooms=2"), true);
  assert.equal(isIndexableNewbuildFilterPath("/novostroyki/do-15000000/"), false);
  assert.equal(isIndexableNewbuildLayoutPath("/novostroyki/sample-complex/planirovki/evro-2/"), false);
  assert.equal(isIndexableNewbuildUnitPath("/novostroyki/sample-complex/lot-1001/"), false);
});

test("unit and layout route files are not created under the public newbuild namespace", async () => {
  const files = await listRouteFiles("src/app/(site)/novostroyki");

  assert.equal(files.some((file) => file.includes("[unit") || file.includes("lot") || file.includes("kvartir")), false);
  assert.equal(files.some((file) => file.includes("planirov") || file.includes("layout")), false);
  assert.equal(existsSync("src/app/(site)/layouts"), false);
});
