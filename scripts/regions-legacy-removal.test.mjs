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

test("local repository uses DTO sources instead of legacy region/page JSON", () => {
  const source = readFileSync("src/content/adapters/local-content-repository.ts", "utf8");

  assert.match(source, /regionDtos/);
  assert.match(source, /pageContents/);
  assert.doesNotMatch(source, /regionsData/);
  assert.doesNotMatch(source, /pagesData/);
  assert.doesNotMatch(source, /landingPagesData/);
});
