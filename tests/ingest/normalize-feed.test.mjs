import assert from "node:assert/strict";
import test from "node:test";

import { createNormalizeFeedHandler, normalizeParsedOffers } from "../../src/core/ingest/normalize-feed.ts";
import { upsertParsedFeedOffers } from "../../src/core/ingest/upsert-feed.ts";

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

  assert.equal(result.offers[0].category, "house");
  assert.equal(result.offers[0].dealType, "rent");
  assert.equal(result.offers[0].externalId, "flat-1");
  assert.equal(result.offers[0].publicAddress, "Ялта");
  assert.equal(result.offers[0].title, "Дом у моря");
  assert.equal(result.offers[0].priceMinor, null);
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
        title: "Таунхаус",
      },
    ],
    parser: "yrl",
    skippedCount: 0,
    suspicious: false,
  });

  assert.equal(result.offers[0].category, null);
  assert.equal(result.issues[0]?.code, "normalize-enum-rejected");
  assert.equal(JSON.stringify(result.offers).includes("таунхаус"), false);
});

test("normalize stage continues a typed offer list toward upsert", async () => {
  const handler = createNormalizeFeedHandler();
  const state = {
    parse: {
      issues: [],
      offeredCount: 1,
      offers: [{ externalId: "flat-1", source: { id: "flat-1" }, title: "Объект" }],
      parser: "yrl",
      skippedCount: 0,
      suspicious: false,
    },
  };

  const result = await handler({ state });
  assert.deepEqual(result, { continue: true, status: "running" });
  assert.equal(state.normalize.offers[0].externalId, "flat-1");
  assert.equal(state.normalize.offers[0].priceMinor, null);
});

test("money, area and missing values normalize to the frozen write contract", () => {
  const result = normalizeParsedOffers({
    issues: [],
    offeredCount: 1,
    offers: [{
      externalId: "flat-money",
      price: "12500000.50",
      source: {
        area: "42,50",
        currency: "rub",
        id: "flat-money",
        "kitchen-space": "9.25",
        "living-space": "20",
        rooms: "2",
      },
      title: "Проверка чисел",
    }],
    parser: "yrl",
    skippedCount: 0,
    suspicious: false,
  });

  assert.equal(result.issues.length, 0);
  assert.equal(result.offers[0].priceMinor, 1_250_000_050);
  assert.equal(result.offers[0].totalArea, 42.5);
  assert.equal(result.offers[0].livingArea, 20);
  assert.equal(result.offers[0].kitchenArea, 9.25);
  assert.equal(result.offers[0].rooms, 2);
  assert.equal(result.offers[0].currency, "RUB");
  assert.equal(result.offers[0].district, null);
  assert.equal(result.offers[0].pricePerMeterMinor, 29_411_766);
});

test("invalid numeric offer is rejected before any property write", async () => {
  const normalized = normalizeParsedOffers({
    issues: [],
    offeredCount: 1,
    offers: [{
      externalId: "flat-invalid",
      price: "not-money",
      source: { area: "42.555", id: "flat-invalid" },
      title: "Некорректный объект",
    }],
    parser: "yrl",
    skippedCount: 0,
    suspicious: false,
  });
  let creates = 0;
  const payload = {
    async create() { creates += 1; return { id: 1 }; },
    async find() { return { docs: [] }; },
    async findByID() { return { market: "newbuild" }; },
    async update() {},
  };

  assert.equal(normalized.offers.length, 0);
  assert.equal(normalized.issues[0].code, "normalize-numeric-invalid");
  await upsertParsedFeedOffers({
    feedSourceId: "feed-a",
    importRunId: "run-invalid",
    offers: normalized.offers,
    payload,
  });
  assert.equal(creates, 0);
});
