import assert from "node:assert/strict";
import test from "node:test";

import { createFinalizeImportHandler } from "../src/core/ingest/finalize-import.ts";

test("repeated suspicious runs cannot lower or replace the safe baseline", async () => {
  const source = { lastFeedHash: "safe-hash", lastFullRunAt: "2026-09-01T00:00:00.000Z", lastOfferCount: 1000 };
  const writes = [];
  const payload = {
    async findByID() { return { mode: "full" }; },
    async update(args) {
      writes.push(args);
      if (args.collection === "feed-sources") Object.assign(source, args.data);
      return { docs: [{ id: args.id ?? "run" }] };
    },
  };
  const handler = createFinalizeImportHandler({ payload });

  for (const feedHash of ["bad-a", "bad-b"]) {
    const result = await handler({
      input: { feedSourceId: "source", importRunId: `run-${feedHash}` },
      state: {
        fetch: { body: (async function* () {})(), contentType: "application/xml", etag: `\"${feedHash}\"`, lastModified: null, previousFeedHash: "safe-hash", status: 200 },
        parse: { feedHash, issues: [], offeredCount: 100, offers: [], parser: "yrl", skippedCount: 0, suspicious: false },
        upsert: { createdCount: 0, skippedCount: 0, updatedCount: 0 },
        deactivation: { action: "suspicious", missingFromFeedCount: 900 },
      },
    });
    assert.equal(result.status, "suspicious");
  }

  assert.deepEqual(source, { lastFeedHash: "safe-hash", lastFullRunAt: "2026-09-01T00:00:00.000Z", lastOfferCount: 1000 });
  assert.equal(writes.some((entry) => entry.collection === "feed-sources" && "lastOfferCount" in entry.data), false);
  assert.equal(writes.some((entry) => entry.data.deactivatedCount > 0), false);
});
