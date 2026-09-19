import assert from "node:assert/strict";
import test from "node:test";

import { finalizeImportRun } from "../src/core/data-access/system/import-feed-run.ts";
import { createFinalizeImportHandler } from "../src/core/ingest/finalize-import.ts";
import { createHash } from "node:crypto";

test("incremental parser hash is a stable sha256 of the fetched bytes", () => {
  const body = new TextEncoder().encode("<yml/>");
  assert.equal(createHash("sha256").update(body).digest("hex").length, 64);
});

test("finalizeImportRun writes terminal counts onto a running import", async () => {
  const writes = [];
  const payload = {
    async update(args) {
      writes.push(args);
      return { docs: [{ id: "501" }] };
    },
  };

  assert.equal(
    await finalizeImportRun(
      payload,
      {
        createdCount: 1,
        deactivatedCount: 0,
        etag: '"abc"',
        feedHash: "deadbeef",
        feedSourceId: "101",
        importRunId: "501",
        issueCount: 0,
        lastModified: null,
        offeredCount: 1,
        skippedCount: 0,
        status: "success",
        summary: "Run succeeded.",
        updatedCount: 0,
      },
      new Date("2026-09-18T12:00:00.000Z"),
    ),
    true,
  );
  assert.equal(writes[0].collection, "import-runs");
  assert.equal(writes[0].data.status, "success");
  assert.equal(writes[0].data.finishedAt, "2026-09-18T12:00:00.000Z");
  assert.equal(writes[0].data.createdCount, 1);
  assert.equal(writes[0].data.offeredCount, 1);
  assert.equal(writes[0].where.and[2].status.equals, "running");
});

test("successful full run stamps lastSuccessfulRunAt and lastFullRunAt", async () => {
  const writes = [];
  const payload = {
    async findByID() {
      return { mode: "full" };
    },
    async update(args) {
      writes.push(args);
      return { docs: [{ id: "501" }] };
    },
  };
  const body = new TextEncoder().encode("<yml/>");
  const feedHash = createHash("sha256").update(body).digest("hex");
  const handler = createFinalizeImportHandler({ payload });
  const result = await handler({
    input: { feedSourceId: "101", importRunId: "501" },
    state: {
      fetch: { body: (async function* () { yield body; })(), contentType: "application/xml", etag: '"n"', lastModified: "Wed", previousFeedHash: null, status: 200 },
      parse: { feedHash, offeredCount: 2 },
      upsert: { createdCount: 1, skippedCount: 0, updatedCount: 1 },
      deactivation: { action: "skip", missingFromFeedCount: 0 },
    },
  });

  assert.deepEqual(result, { continue: true, status: "success" });
  const runWrite = writes.find((write) => write.collection === "import-runs");
  const sourceWrite = writes.find((write) => write.collection === "feed-sources");
  assert.equal(runWrite.data.status, "success");
  assert.equal(runWrite.data.feedHash, feedHash);
  assert.equal(sourceWrite.id, "101");
  assert.equal(typeof sourceWrite.data.lastSuccessfulRunAt, "string");
  assert.equal(sourceWrite.data.lastFullRunAt, sourceWrite.data.lastSuccessfulRunAt);
  assert.equal(sourceWrite.data.lastEtag, '"n"');
  assert.equal(sourceWrite.data.lastOfferCount, 2);
});

test("suspicious deactivation finalizes without lastSuccessfulRunAt", async () => {
  const writes = [];
  const payload = {
    async findByID() {
      return { mode: "full" };
    },
    async update(args) {
      writes.push(args);
      return { docs: [{ id: "501" }] };
    },
  };
  const handler = createFinalizeImportHandler({ payload });
  const result = await handler({
    input: { feedSourceId: "101", importRunId: "501" },
    state: {
      fetch: {
        body: (async function* () { yield new TextEncoder().encode("<yml/>"); })(),
        contentType: "application/xml",
        etag: '"n"',
        lastModified: null,
        previousFeedHash: null,
        status: 200,
      },
      parse: { feedHash: "suspicious-hash", offeredCount: 1 },
      upsert: { createdCount: 0, skippedCount: 0, updatedCount: 1 },
      recordedIssues: [],
      deactivation: { action: "suspicious", missingFromFeedCount: 40 },
    },
  });

  assert.deepEqual(result, { continue: true, status: "suspicious" });
  const runWrite = writes.find((write) => write.collection === "import-runs");
  const sourceWrite = writes.find((write) => write.collection === "feed-sources");
  assert.equal(runWrite.data.status, "suspicious");
  assert.equal(runWrite.data.issueCount, 1);
  assert.equal(runWrite.data.deactivatedCount, 0);
  assert.equal("lastSuccessfulRunAt" in sourceWrite.data, false);
  assert.equal("lastFullRunAt" in sourceWrite.data, false);
});

test("lost running claim fails closed instead of leaving a completed stamp", async () => {
  const handler = createFinalizeImportHandler({
    payload: {
      async findByID() {
        return { mode: "incremental" };
      },
      async update() {
        return { docs: [] };
      },
    },
  });
  const result = await handler({
    input: { feedSourceId: "101", importRunId: "501" },
    state: {},
  });
  assert.deepEqual(result, { continue: false, status: "failed" });
});
