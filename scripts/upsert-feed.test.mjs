import assert from "node:assert/strict";
import test from "node:test";

import { createImportHash } from "../src/core/ingest/import-state.ts";
import { normalizeParsedOffers } from "../src/core/ingest/normalize-feed.ts";
import { upsertParsedFeedOffers } from "../src/core/ingest/upsert-feed.ts";

const offer = normalizeParsedOffers({
  issues: [],
  offeredCount: 1,
  offers: [{
    externalId: "flat-1",
    price: "12500000",
    source: { id: "flat-1", name: "Апартамент у моря", price: "12500000" },
    title: "Апартамент у моря",
  }],
  parser: "yrl",
  skippedCount: 0,
  suspicious: false,
}).offers[0];

function payloadMock(docs = []) {
  const records = docs.map((doc) => ({ externalId: "flat-1", ...doc }));
  const operations = { create: 0, find: 0, findByID: 0, update: 0 };
  const writes = [];
  const payload = {
    async findByID(args) {
      operations.findByID += 1;
      assert.deepEqual(args.select, { market: true });
      return { market: "newbuild" };
    },
    async find(args) {
      operations.find += 1;
      assert.equal(args.collection, "properties");
      assert.equal(args.overrideAccess, true);
      const [feedScope, manualScope] = args.where.or;
      const feedSourceId = feedScope.and[0].feedSource.equals;
      const externalIds = new Set(feedScope.and[1].externalId.in);
      assert.deepEqual(manualScope.and[0], { origin: { equals: "manual" } });
      assert.deepEqual(manualScope.and[1].externalId.in, feedScope.and[1].externalId.in);
      return {
        docs: records.filter(
          (doc) =>
            externalIds.has(doc.externalId) &&
            ((doc.origin === "feed" && String(doc.feedSource) === String(feedSourceId)) ||
              doc.origin === "manual"),
        ),
      };
    },
    async create(args) {
      operations.create += 1;
      writes.push({ kind: "create", ...args });
      const id = 900 + operations.create;
      records.push({ id, ...args.data });
      return { id };
    },
    async update(args) {
      operations.update += 1;
      writes.push({ kind: "update", ...args });
      if (args.where?.id?.in) {
        for (const record of records) {
          if (args.where.id.in.includes(record.id)) Object.assign(record, args.data);
        }
      } else {
        const record = records.find((item) => item.id === args.id);
        if (record) Object.assign(record, args.data);
      }
      return { id: args.id };
    },
  };
  return { operations, payload, records, writes };
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

test("manual collision is an explicit no-write branch", async () => {
  const manual = payloadMock([{ id: 10, feedSource: null, origin: "manual" }]);

  const skippedManual = await upsertParsedFeedOffers({
    feedSourceId: "feed-a",
    importRunId: "run-1",
    nowIso: "2026-09-18T12:00:00.000Z",
    offers: [offer],
    payload: manual.payload,
  });

  assert.equal(skippedManual.plans[0].kind, "skip-foreign-owner");
  assert.equal(manual.writes.length, 0);
});

test("two feeds with the same externalId create independent records", async () => {
  const shared = payloadMock([
    { id: 11, externalId: "flat-1", feedSource: "feed-b", importHash: "old", origin: "feed" },
  ]);

  const importedA = await upsertParsedFeedOffers({
    feedSourceId: "feed-a",
    importRunId: "run-1",
    nowIso: "2026-09-18T12:00:00.000Z",
    offers: [offer],
    payload: shared.payload,
  });

  assert.equal(importedA.plans[0].kind, "create");
  assert.equal(shared.records.filter((record) => record.externalId === "flat-1").length, 2);
  assert.deepEqual(
    new Set(shared.records.map((record) => record.feedSource)),
    new Set(["feed-a", "feed-b"]),
  );
});

test("explicit manual field ownership keeps title while identity fields still update", async () => {
  const { payload, writes } = payloadMock([
    { id: 101, feedSource: "feed-a", importHash: "old-hash", origin: "feed", title: "Owner title" },
  ]);

  await upsertParsedFeedOffers({
    explicitOwners: { title: { kind: "manual" } },
    feedSourceId: "feed-a",
    importRunId: "run-4",
    nowIso: "2026-09-18T15:00:00.000Z",
    offers: [offer],
    payload,
  });

  assert.equal(writes[0].data.title, undefined);
  assert.equal(writes[0].data.importHash, createImportHash(offer));
  assert.equal(writes[0].data.origin, "feed");
});

test("2000 unchanged offers use bounded lookup and touch batches", async () => {
  const offers = Array.from({ length: 2000 }, (_, index) => ({
    ...offer,
    externalId: `flat-${index}`,
    priceMinor: null,
    title: `Offer ${index}`,
  }));
  const docs = offers.map((item, index) => ({
    externalId: item.externalId,
    feedSource: "feed-a",
    id: index + 1,
    importHash: createImportHash(item),
    origin: "feed",
  }));
  const { operations, payload } = payloadMock(docs);

  const summary = await upsertParsedFeedOffers({
    feedSourceId: "feed-a",
    importRunId: "run-large",
    nowIso: "2026-09-18T16:00:00.000Z",
    offers,
    payload,
  });

  assert.equal(summary.skippedCount, 2000);
  assert.deepEqual(operations, { create: 0, find: 10, findByID: 1, update: 10 });
});
