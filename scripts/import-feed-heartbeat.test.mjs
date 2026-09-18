import assert from "node:assert/strict";
import test from "node:test";

import { createImportRunHeartbeat } from "../src/core/ingest/import-maintenance.ts";
import { defaultStaleRunningThresholdMinutes } from "../src/core/ingest/import-maintenance.ts";
import { touchImportRunHeartbeat } from "../src/core/data-access/system/import-feed-run.ts";
import {
  importFeedHeartbeatIntervalMs,
  runImportFeedWithHeartbeat,
} from "../src/project/jobs/imports/import-feed.ts";

test("importFeed heartbeat interval stays below the stale-running janitor threshold", () => {
  assert.ok(importFeedHeartbeatIntervalMs < defaultStaleRunningThresholdMinutes * 60_000);
});

test("touchImportRunHeartbeat is a standalone running-only write outside the ingest transaction", async () => {
  const writes = [];
  const payload = {
    async update(args) {
      writes.push(args);
      return { docs: [{ id: "501" }] };
    },
  };

  assert.equal(
    await touchImportRunHeartbeat(payload, { feedSourceId: "101", importRunId: "501" }, new Date("2026-09-18T12:00:00.000Z")),
    true,
  );
  assert.equal(writes[0].collection, "import-runs");
  assert.equal(writes[0].disableTransaction, true);
  assert.deepEqual(writes[0].data, createImportRunHeartbeat("2026-09-18T12:00:00.000Z").data);
  assert.equal(writes[0].where.and[2].status.equals, "running");
  assert.equal(Object.keys(writes[0].data).join(), "heartbeatAt");
});

test("importFeed schedules periodic heartbeat and clears it after the pipeline returns", async () => {
  const writes = [];
  const payload = {
    async update(args) {
      writes.push(args);
      return { docs: [{ id: "501" }] };
    },
    async find() {
      return { docs: [] };
    },
    async findByID(args) {
      if (args.select?.feedUrlRef) return { feedUrlRef: "FEED_URL_PRIMARY" };
      return { lastEtag: null, lastModified: null };
    },
  };
  let savedCallback;
  let intervalMs;
  let cleared = false;

  const result = await runImportFeedWithHeartbeat({
    input: { feedSourceId: "101", importRunId: "501" },
    lookupEnv: () => "https://feeds.example/primary.xml",
    outbound: {
      async request() {
        return {
          body: new Uint8Array(),
          contentType: null,
          etag: null,
          lastModified: null,
          status: 304,
        };
      },
    },
    payload,
    setHeartbeatInterval: (callback, ms) => {
      savedCallback = callback;
      intervalMs = ms;
      return 7;
    },
    clearHeartbeatInterval: (handle) => {
      assert.equal(handle, 7);
      cleared = true;
    },
  });

  assert.equal(intervalMs, importFeedHeartbeatIntervalMs);
  assert.equal(result.status, "skipped");
  await savedCallback();
  const heartbeatWrites = writes.filter((write) => write.data && Object.keys(write.data).join() === "heartbeatAt");
  assert.equal(heartbeatWrites.length, 1);
  assert.equal(heartbeatWrites[0].disableTransaction, true);
  assert.equal(cleared, true);
});
