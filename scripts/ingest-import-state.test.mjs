import assert from "node:assert/strict";
import test from "node:test";

import {
  buildConditionalFeedHeaders,
  classifyConditionalFeedResponse,
  createImportHash,
  isBaselineImport,
  isFirstFullRun,
  planOfferImport,
  planSeenTouchBatch,
} from "../src/core/ingest/import-state.ts";

const offer = {
  category: null,
  currency: "RUB",
  dealType: null,
  district: null,
  externalBuildingId: null,
  externalComplexId: null,
  externalComplexName: null,
  externalId: "flat-1",
  externalLayoutId: null,
  floor: null,
  floors: null,
  house: null,
  kitchenArea: null,
  lat: null,
  livingArea: null,
  lng: null,
  locality: null,
  priceMinor: 1250000000,
  pricePerMeterMinor: null,
  publicAddress: null,
  rooms: null,
  street: null,
  title: "Апартамент у моря",
  totalArea: null,
};

test("conditional GET uses stored ETag and Last-Modified without exposing feed URL", () => {
  assert.deepEqual(buildConditionalFeedHeaders({ lastEtag: "\"abc\"", lastModified: "Wed, 16 Sep 2026 12:00:00 GMT" }), {
    "If-Modified-Since": "Wed, 16 Sep 2026 12:00:00 GMT",
    "If-None-Match": "\"abc\"",
  });
  assert.deepEqual(buildConditionalFeedHeaders({}), {});
});

test("304 response is a no-op and does not count as a business write", () => {
  assert.deepEqual(classifyConditionalFeedResponse(304), { businessWrite: false, kind: "not-modified" });
  assert.deepEqual(classifyConditionalFeedResponse(200), { businessWrite: false, kind: "read-body" });
});

test("baseline import is detected before first full feed state exists", () => {
  assert.equal(isBaselineImport({}), true);
  assert.equal(isBaselineImport({ lastFeedHash: "feed-hash" }), false);
  assert.equal(isBaselineImport({ lastFullRunAt: "2026-09-17T00:00:00.000Z" }), false);
  assert.equal(isBaselineImport({ lastOfferCount: 0 }), false);
});

test("first full run is a baseline even if incremental hashes already exist", () => {
  assert.equal(isFirstFullRun({ mode: "full" }), true);
  assert.equal(isFirstFullRun({ lastFullRunAt: "2026-09-17T00:00:00.000Z", mode: "full" }), false);
  assert.equal(isFirstFullRun({ lastFeedHash: "hash", mode: "incremental" }), false);
});

test("importHash is stable for reordered normalized fields", () => {
  const sameOfferDifferentOrder = {
    title: offer.title,
    externalId: offer.externalId,
    ...Object.fromEntries(Object.entries(offer).filter(([key]) => key !== "title" && key !== "externalId").reverse()),
  };

  assert.equal(createImportHash(offer), createImportHash(sameOfferDifferentOrder));
});

test("unchanged feed offer plans only bulk lastSeenAt touch, not business write", () => {
  const importHash = createImportHash(offer);
  const plan = planOfferImport({
    existing: { feedSource: "feed-a", id: 101, importHash, origin: "feed" },
    feedMarket: "newbuild",
    feedSourceId: "feed-a",
    importRunId: "run-1",
    nowIso: "2026-09-17T01:00:00.000Z",
    offer,
  });

  assert.deepEqual(plan, {
    businessWrite: false,
    data: {
      lastImportRun: "run-1",
      lastSeenAt: "2026-09-17T01:00:00.000Z",
    },
    kind: "touch-seen",
    propertyId: 101,
  });
});

test("new or changed feed offer plans a business write with import hash", () => {
  const created = planOfferImport({
    feedMarket: "newbuild",
    feedSourceId: "feed-a",
    importRunId: "run-1",
    nowIso: "2026-09-17T01:00:00.000Z",
    offer,
  });
  assert.equal(created.kind, "create");
  assert.equal(created.businessWrite, true);
  assert.equal(created.data.origin, "feed");
  assert.equal(created.data.externalId, "flat-1");
  assert.equal(typeof created.data.importHash, "string");
  assert.equal(created.data.market, "newbuild");

  const updated = planOfferImport({
    existing: { feedSource: "feed-a", id: 101, importHash: "old-hash", origin: "feed" },
    feedMarket: "newbuild",
    feedSourceId: "feed-a",
    importRunId: "run-2",
    nowIso: "2026-09-17T01:05:00.000Z",
    offer,
  });
  assert.equal(updated.kind, "update");
  assert.equal(updated.businessWrite, true);
});

test("manual and another feed owned properties are never updated by this import", () => {
  assert.deepEqual(
    planOfferImport({
      existing: { feedSource: null, id: 10, origin: "manual" },
      feedMarket: "newbuild",
    feedSourceId: "feed-a",
      importRunId: "run-1",
      nowIso: "2026-09-17T01:00:00.000Z",
      offer,
    }),
    { businessWrite: false, kind: "skip-foreign-owner", reason: "manual-origin" },
  );

  assert.deepEqual(
    planOfferImport({
      existing: { feedSource: "feed-b", id: 11, origin: "feed" },
      feedMarket: "newbuild",
    feedSourceId: "feed-a",
      importRunId: "run-1",
      nowIso: "2026-09-17T01:00:00.000Z",
      offer,
    }),
    { businessWrite: false, kind: "skip-foreign-owner", reason: "different-feed" },
  );
});

test("bulk lastSeenAt touch plan is explicitly non-business write", () => {
  assert.deepEqual(planSeenTouchBatch({ importRunId: "run-1", nowIso: "2026-09-17T01:00:00.000Z", propertyIds: [1, 2] }), [
    {
      businessWrite: false,
      data: { lastImportRun: "run-1", lastSeenAt: "2026-09-17T01:00:00.000Z" },
      kind: "touch-seen",
      propertyId: 1,
    },
    {
      businessWrite: false,
      data: { lastImportRun: "run-1", lastSeenAt: "2026-09-17T01:00:00.000Z" },
      kind: "touch-seen",
      propertyId: 2,
    },
  ]);
});
