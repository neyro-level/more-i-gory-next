import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { getSeedPlan } from "../../scripts/seed-media-assets.mjs";

test("media seed covers the four current public image assets", () => {
  const plan = getSeedPlan();

  assert.equal(plan.length, 4);
  assert.deepEqual(
    plan.map((asset) => asset.id).sort(),
    ["media-og-default", "media-project-sample-cover", "media-region-krym", "media-region-sochi"],
  );
  assert.deepEqual(
    plan.map((asset) => asset.filename).sort(),
    ["cover.webp", "crimea-coast.webp", "default.webp", "sochi-coast.webp"],
  );
  assert.equal(plan.every((asset) => asset.filesize > 0), true);
});

test("media seed writes legacy registry ids into payload data without changing public paths", () => {
  const plan = getSeedPlan();

  for (const asset of plan) {
    assert.equal(asset.payloadData.sourceLabel, asset.id);
    assert.equal(asset.src.startsWith("/images/"), true);
    assert.equal(asset.payloadData.kind, asset.kind);
    assert.equal(asset.payloadData.alt, asset.alt);
  }
});

test("media seed script delegates privileged CRUD to its System Gateway owner", () => {
  const script = readFileSync("scripts/seed-media-assets.mjs", "utf8");
  const gateway = readFileSync("src/core/data-access/system/seed-media.ts", "utf8");

  assert.doesNotMatch(script, /payload\.(?:find|create|update)\s*\(/);
  assert.doesNotMatch(script, /overrideAccess:\s*true/);
  assert.match(script, /upsertMediaSeedAsset/);
  assert.match(gateway, /overrideAccess:\s*true/);
});
