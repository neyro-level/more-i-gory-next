import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  getEditorialPreviewNavigation,
  getEditorialPreviewRegionStaticParams,
  isEditorialPreviewEnabled,
  listEditorialPreviewRegions,
} from "../src/core/data-access/preview/editorial-preview.ts";

test("editorial preview is enabled only for local or staging contours", () => {
  assert.equal(isEditorialPreviewEnabled({ NODE_ENV: "development" }), true);
  assert.equal(isEditorialPreviewEnabled({ NODE_ENV: "production", AMS_RUNTIME_CONTOUR: "staging" }), true);
  assert.equal(isEditorialPreviewEnabled({ NODE_ENV: "production", AMS_RUNTIME_CONTOUR: "production" }), false);
  assert.equal(isEditorialPreviewEnabled({ NODE_ENV: "production" }), false);
});

test("all planned region routes and seed articles are present in preview navigation", () => {
  const staging = { NODE_ENV: "production", AMS_RUNTIME_CONTOUR: "staging" };
  const regions = listEditorialPreviewRegions(staging);
  const params = getEditorialPreviewRegionStaticParams(staging);
  const hrefs = getEditorialPreviewNavigation(staging).flatMap((group) => group.links.map((link) => link.href));

  assert.equal(regions.length, 10);
  assert.equal(params.length, 9);
  assert.equal(hrefs.length, 29);
  assert.equal(new Set(hrefs).size, 29);
  for (const region of regions) assert.ok(hrefs.includes(region.path), `missing preview navigation: ${region.path}`);
  for (const href of [
    "/analitika/sochi-ili-krym/",
    "/analitika/kak-schitat-chistuyu-dohodnost/",
    "/analitika/riski-kurortnyh-apartamentov/",
    "/analitika/kak-proverit-operatora/",
    "/analitika/likvidnost-i-vyhod/",
    "/obekty/preview-project/",
    "/novostroyki/preview-complex/",
    "/zastroyshchik/preview-developer/",
  ]) {
    assert.ok(hrefs.includes(href), `missing preview navigation: ${href}`);
  }
});

test("technical template fixtures are noindex and runtime-gated", () => {
  for (const file of [
    "src/app/(site)/obekty/preview-project/page.tsx",
    "src/app/(site)/novostroyki/preview-complex/page.tsx",
    "src/app/(site)/zastroyshchik/preview-developer/page.tsx",
  ]) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /robots: \{ index: false, follow: false \}/);
    assert.match(source, /PreviewTemplateScaffold/);
    assert.match(source, /isEditorialPreviewEnabled\(\)/);
    assert.match(source, /notFound\(\)/);
  }

  const scaffold = readFileSync("src/components/preview/preview-template-scaffold.tsx", "utf8");
  assert.match(scaffold, /не реальный объект/);
});
