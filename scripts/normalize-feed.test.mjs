import assert from "node:assert/strict";
import test from "node:test";

import { createNormalizeFeedHandler, normalizeParsedOffers } from "../src/core/ingest/normalize-feed.ts";

test("normalize maps feed aliases to typed offers and never copies the raw source object", () => {
  const result = normalizeParsedOffers({
    issues: [],
    offeredCount: 1,
    offers: [
      {
        address: "Ялта",
        externalId: "flat-1",
        source: { category: "дом", id: "flat-1", type: "аренда" },
        title: "Дом у моря",
      },
    ],
    parser: "yrl",
    skippedCount: 0,
    suspicious: false,
  });

  assert.deepEqual(result.offers, [
    {
      address: "Ялта",
      category: "house",
      dealType: "rent",
      externalId: "flat-1",
      title: "Дом у моря",
    },
  ]);
  assert.equal("source" in result.offers[0], false);
  assert.equal(JSON.stringify(result.offers).includes("дом"), false);
  assert.equal(result.issues.length, 0);
});

test("rejected enum aliases become issues and are not written onto the normalized offer", () => {
  const result = normalizeParsedOffers({
    issues: [],
    offeredCount: 1,
    offers: [
      {
        externalId: "flat-2",
        source: { category: "таунхаус", id: "flat-2" },
      },
    ],
    parser: "yrl",
    skippedCount: 0,
    suspicious: false,
  });

  assert.equal(result.offers[0].category, undefined);
  assert.equal(result.issues[0]?.code, "normalize-enum-rejected");
  assert.equal(JSON.stringify(result.offers).includes("таунхаус"), false);
});

test("normalize stage continues a typed offer list toward upsert", async () => {
  const handler = createNormalizeFeedHandler();
  const state = {
    parse: {
      issues: [],
      offeredCount: 1,
      offers: [{ externalId: "flat-1", source: { id: "flat-1" } }],
      parser: "yrl",
      skippedCount: 0,
      suspicious: false,
    },
  };

  const result = await handler({ state });
  assert.deepEqual(result, { continue: true, status: "running" });
  assert.deepEqual(state.normalize.offers, [{ externalId: "flat-1" }]);
});
