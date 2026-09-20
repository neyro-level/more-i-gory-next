import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { SEED_CONFIRMATION, assertPreviewContour, parseSeedArguments } from "./seed-preview-db-proof.mjs";
import {
  previewProofRecords,
  upsertPreviewProofRecords,
} from "../src/core/data-access/system/seed-preview-proof.ts";

const sha = "a".repeat(40);

test("preview proof seed is pinned to exact SHA, confirmation and staging origin", () => {
  assert.deepEqual(
    parseSeedArguments([`--expected-sha=${sha}`, `--confirm=${SEED_CONFIRMATION}`]),
    { expectedSha: sha },
  );
  assert.throws(() => parseSeedArguments([`--expected-sha=${sha}`]), /Seed requires/);
  assert.doesNotThrow(() => assertPreviewContour({
    AMS_RUNTIME_CONTOUR: "staging",
    NEXT_PUBLIC_SERVER_URL: "https://more-previu.tw1.ru",
  }));
  assert.throws(() => assertPreviewContour({ AMS_RUNTIME_CONTOUR: "production" }), /staging/);
});

test("Payload CLI wrapper invokes the exported seed operator", () => {
  const wrapper = readFileSync("scripts/run-preview-db-proof.mjs", "utf8");
  assert.match(wrapper, /import \{ seedPreviewDbProof \}/);
  assert.match(wrapper, /await seedPreviewDbProof\(\)/);
});

test("proof records are explicitly technical and keep the unpublished boundary", () => {
  assert.match(previewProofRecords.published.title, /Техническая/);
  assert.match(previewProofRecords.published.riskSummary, /не являющаяся объектом недвижимости/);
  assert.equal(previewProofRecords.published.slug, "db-proof-published");
  assert.equal(previewProofRecords.draft.slug, "db-proof-draft");
  assert.equal("publishedAt" in previewProofRecords.draft, false);
  assert.equal("verifiedAt" in previewProofRecords.draft, false);
});

test("proof seed performs collection-specific idempotent privileged upserts", async () => {
  const calls = [];
  const payload = {
    create: async (options) => {
      calls.push(["create", options]);
      return { id: options.data.slug === "db-proof-published" ? 1 : 2 };
    },
    find: async (options) => {
      calls.push(["find", options]);
      return options.where.slug.equals === "db-proof-published" ? { docs: [{ id: 1 }] } : { docs: [] };
    },
    update: async (options) => {
      calls.push(["update", options]);
      return { id: options.id };
    },
  };

  assert.deepEqual(await upsertPreviewProofRecords(payload), {
    draft: { id: 2, outcome: "created", slug: "db-proof-draft" },
    published: { id: 1, outcome: "updated", slug: "db-proof-published" },
  });
  assert.equal(calls.every(([, options]) => options.collection === "properties"), true);
  assert.equal(calls.every(([, options]) => options.overrideAccess === true), true);
});
