import assert from "node:assert/strict";
import test from "node:test";

import { createImportHash } from "../src/core/ingest/import-state.ts";
import { upsertParsedFeedOffers } from "../src/core/ingest/upsert-feed.ts";

const offer = {
  externalId: "flat-1",
  source: { id: "flat-1", name: "Апартамент у моря", price: "12500000" },
  title: "Апартамент у моря",
};

function payloadMock(docs = []) {
  const writes = [];
  const payload = {
    async findByID(args) {
      assert.deepEqual(args.select, { market: true });
      return { market: "newbuild" };
    },
    async find(args) {
      assert.equal(args.collection, "properties");
      assert.equal(args.overrideAccess, true);
      assert.equal(args.where.externalId.equals, "flat-1");
      return { docs };
    },
    async create(args) {
      writes.push({ kind: "create", ...args });
      return { id: 900 };
    },
    async update(args) {
      writes.push({ kind: "update", ...args });
      return { id: args.id };
    },
  };
  return { payload, writes };
}

test("new offer creates by feedSource+externalId without the raw feed source object", async () => {
  const { payload, writes } = payloadMock([]);
  const summary = await upsertParsedFeedOffers({
    feedSourceId: "feed-a",
    importRunId: "run-1",
    nowIso: "2026-09-18T12:00:00.000Z",
    offers: [offer],
    payload,
  });

  assert.equal(summary.createdCount, 1);
  assert.equal(summary.plans[0].kind, "create");
  assert.equal(writes[0].kind, "create");
  assert.equal(writes[0].data.origin, "feed");
  assert.equal(writes[0].data.feedSource, "feed-a");
  assert.equal(writes[0].data.externalId, "flat-1");
  assert.equal(writes[0].data.title, "Апартамент у моря");
  assert.equal("source" in writes[0].data, false);
});

test("unchanged importHash only touches lastSeenAt", async () => {
  const importHash = createImportHash(offer);
  const { payload, writes } = payloadMock([
    { id: 101, feedSource: "feed-a", importHash, origin: "feed" },
  ]);

  const summary = await upsertParsedFeedOffers({
    feedSourceId: "feed-a",
    importRunId: "run-2",
    nowIso: "2026-09-18T13:00:00.000Z",
    offers: [offer],
    payload,
  });

  assert.equal(summary.updatedCount, 0);
  assert.equal(summary.skippedCount, 1);
  assert.equal(summary.plans[0].kind, "touch-seen");
  assert.deepEqual(writes[0].data, {
    lastImportRun: "run-2",
    lastSeenAt: "2026-09-18T13:00:00.000Z",
  });
});

test("changed hash updates the owning feed record", async () => {
  const { payload, writes } = payloadMock([
    { id: 101, feedSource: "feed-a", importHash: "old-hash", origin: "feed" },
  ]);

  const summary = await upsertParsedFeedOffers({
    feedSourceId: "feed-a",
    importRunId: "run-3",
    nowIso: "2026-09-18T14:00:00.000Z",
    offers: [offer],
    payload,
  });

  assert.equal(summary.updatedCount, 1);
  assert.equal(summary.plans[0].kind, "update");
  assert.equal(writes[0].id, 101);
  assert.equal(writes[0].data.importHash, createImportHash(offer));
});

test("manual and different-feed owners are not overwritten or duplicated", async () => {
  const manual = payloadMock([{ id: 10, feedSource: null, origin: "manual" }]);
  const other = payloadMock([{ id: 11, feedSource: "feed-b", origin: "feed" }]);

  const skippedManual = await upsertParsedFeedOffers({
    feedSourceId: "feed-a",
    importRunId: "run-1",
    nowIso: "2026-09-18T12:00:00.000Z",
    offers: [offer],
    payload: manual.payload,
  });
  const skippedOther = await upsertParsedFeedOffers({
    feedSourceId: "feed-a",
    importRunId: "run-1",
    nowIso: "2026-09-18T12:00:00.000Z",
    offers: [offer],
    payload: other.payload,
  });

  assert.equal(skippedManual.plans[0].kind, "skip-foreign-owner");
  assert.equal(skippedOther.plans[0].kind, "skip-foreign-owner");
  assert.equal(manual.writes.length, 0);
  assert.equal(other.writes.length, 0);
});
