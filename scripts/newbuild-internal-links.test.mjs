import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { getRegionRelatedLinks, getRegionRoutePlan } from "../src/content/regions/region-route-plan.ts";

const byKey = new Map(getRegionRoutePlan().map((entry) => [entry.key, entry]));

test("Crimea newbuild segment links back to the public newbuild catalog", () => {
  const links = getRegionRelatedLinks(byKey.get("krym-novostroyki"));
  const hrefs = links.map((link) => link.href);

  assert.ok(hrefs.includes("/novostroyki/"));
});

test("newbuild catalog links to Crimea segment and analytics", async () => {
  const source = await readFile("src/app/(site)/novostroyki/page.tsx", "utf8");

  assert.match(source, /\/investicionnaya-nedvizhimost\/krym\/novostroyki\//);
  assert.match(source, /\/analitika\//);
  assert.match(source, /\/metodika\//);
});

test("newbuild complex detail links to catalog, developer, Crimea segment and analytics", async () => {
  const source = await readFile("src/app/(site)/novostroyki/[slug]/page.tsx", "utf8");

  assert.match(source, /\/novostroyki\//);
  assert.match(source, /\/investicionnaya-nedvizhimost\/krym\/novostroyki\//);
  assert.match(source, /complex\.developer\.path/);
  assert.match(source, /\/analitika\//);
});

test("developer and analytics pages link into the newbuild catalog loop", async () => {
  const developerSource = await readFile("src/app/(site)/zastroyshchik/[slug]/page.tsx", "utf8");
  const analyticsSource = await readFile("src/app/(site)/analitika/page.tsx", "utf8");
  const articleSource = await readFile("src/app/(site)/analitika/[slug]/page.tsx", "utf8");

  assert.match(developerSource, /\/novostroyki\//);
  assert.match(developerSource, /\/analitika\//);
  assert.match(analyticsSource, /\/novostroyki\//);
  assert.match(articleSource, /\/novostroyki\//);
  assert.match(articleSource, /\/investicionnaya-nedvizhimost\/krym\/novostroyki\//);
});
