import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const convertedRoutes = [
  "src/app/(site)/analitika/page.tsx",
  "src/app/(site)/privacy/page.tsx",
  "src/app/(site)/consent/page.tsx",
];

test("selected routes are CMS-pages first with static fallback", () => {
  for (const route of convertedRoutes) {
    const source = readFileSync(route, "utf8");

    assert.match(source, /getCmsPageByPath/);
    assert.match(source, /<CmsPage page=\{page\}/);
    assert.match(source, /getStaticMetadata/);
    assert.match(source, /generateMetadata/);
  }
});

test("CMS page reader is scoped to published pages by path", () => {
  const source = readFileSync("src/core/data-access/public/pages.ts", "utf8");

  assert.match(source, /path:\s*\{\s*equals:\s*path\s*\}/);
  assert.match(source, /status:\s*\{\s*equals:\s*"published"\s*\}/);
  assert.match(source, /select:\s*publicCmsPageSelect/);
  assert.match(source, /mapCmsPage/);
  assert.match(source, /overrideAccess:\s*false/);
});
