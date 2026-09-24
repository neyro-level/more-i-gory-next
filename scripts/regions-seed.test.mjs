import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { mediaAssets } from "../src/content/media/media-assets.ts";
import {
  getExecutableRegionSeedPlan,
  getPayloadRegionData,
  getRegionSeedPlan,
  regionSeedEntries,
} from "./seed-regions.mjs";

const mediaSourceLabels = new Set(mediaAssets.map((asset) => asset.id));

test("region seed covers the EPIC 7 URL map without indexing draft content", () => {
  const plan = getRegionSeedPlan();

  assert.equal(plan.length, 10);
  assert.deepEqual(
    plan.map((entry) => entry.path),
    [
      "/krym/",
      "/krym/yalta/",
      "/krym/sevastopol/",
      "/krym/evpatoriya/",
      "/krym/alushta/",
      "/investicionnaya-nedvizhimost/krym/novostroyki/",
      "/investicionnaya-nedvizhimost/krym/apartamenty/",
      "/investicionnaya-nedvizhimost/arkhyz/",
      "/investicionnaya-nedvizhimost/altay/",
      "/investicionnaya-nedvizhimost/sochi/",
    ],
  );
  assert.equal(plan.some((entry) => entry.status === "published"), false);
  assert.equal(plan.find((entry) => entry.key === "sochi").status, "stub");
});

test("region seed keeps hierarchy, kinds and media references explicit", () => {
  const byKey = new Map(getRegionSeedPlan().map((entry) => [entry.key, entry]));

  assert.equal(byKey.get("yalta").parentKey, "krym");
  assert.equal(byKey.get("krym-novostroyki").kind, "segment");
  assert.equal(byKey.get("krym-apartamenty").kind, "segment");
  assert.equal(getRegionSeedPlan().every((entry) => mediaSourceLabels.has(entry.mediaSourceLabel)), true);
});

test("runtime seed defers future regions without an approved canonical pageKey", () => {
  const executableKeys = getExecutableRegionSeedPlan().map((entry) => entry.key);

  assert.deepEqual(executableKeys, [
    "krym",
    "yalta",
    "sevastopol",
    "evpatoriya",
    "alushta",
    "krym-novostroyki",
    "krym-apartamenty",
  ]);
});

test("region payload data satisfies the collection requirements", () => {
  const krym = regionSeedEntries.find((entry) => entry.key === "krym");
  const data = getPayloadRegionData(krym, undefined, 1);

  assert.equal(data.slug, "krym");
  assert.equal(data.status, "hidden");
  assert.equal(data.heroMedia, 1);
  assert.equal(data.pageKey, "REGION");
  assert.equal(data.blocks.length >= 1, true);
  assert.equal(data.seo.robots, "noindex-follow");
});

test("region seed script delegates privileged CRUD to its System Gateway owner", () => {
  const script = readFileSync("scripts/seed-regions.mjs", "utf8");
  const gateway = readFileSync("src/core/data-access/system/seed-regions.ts", "utf8");

  assert.doesNotMatch(script, /payload\.(?:find|create|update)\s*\(/);
  assert.doesNotMatch(script, /overrideAccess:\s*true/);
  assert.match(script, /resolveSeedRegionMediaId/);
  assert.match(script, /upsertRegionSeed/);
  assert.match(gateway, /overrideAccess:\s*true/);
});
