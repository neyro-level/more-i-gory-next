import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

test("legacy region/page JSON sources and obsolete landing components are removed", () => {
  for (const file of [
    "src/content/data/regions.json",
    "src/content/data/pages.json",
    "src/content/data/landing-pages.json",
    "src/app/(site)/investicionnaya-nedvizhimost/_components/region-landing.tsx",
    "src/app/(site)/investicionnaya-nedvizhimost/_components/segment-landing.tsx",
  ]) {
    assert.equal(existsSync(file), false, `${file} should not exist`);
  }
});

test("legacy content repository chain is removed after public routes moved to typed sources", () => {
  for (const file of [
    "src/content/adapters/local-content-repository.ts",
    "src/content/adapters/payload-content-repository.ts",
    "src/content/repository.ts",
    "src/content/service.ts",
    "src/content/data/media.json",
    "src/content/data/projects.json",
  ]) {
    assert.equal(existsSync(file), false, `${file} should not exist`);
  }
});

test("public pages use typed article and media modules instead of the legacy service", () => {
  for (const file of [
    "src/app/(site)/page.tsx",
    "src/app/(site)/investicionnaya-nedvizhimost/page.tsx",
    "src/app/(site)/_shared/region-route-page.tsx",
    "src/app/(site)/analitika/page.tsx",
    "src/app/(site)/analitika/[slug]/page.tsx",
  ]) {
    const source = readFileSync(file, "utf8");
    assert.doesNotMatch(source, /contentService|@\/content\/service/, `${file} should not use contentService`);
  }
});
