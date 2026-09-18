import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { createImportRunHeartbeat } from "../src/core/ingest/import-maintenance.ts";
import { defaultStaleRunningThresholdMinutes } from "../src/core/ingest/import-maintenance.ts";
import { touchImportRunHeartbeat } from "../src/core/data-access/system/import-feed-run.ts";
import {
  createImportFeedHttpInvalidator,
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

test("importFeed HTTP cache invalidation uses Safe Outbound Client instead of configurable fetch", async () => {
  const source = await readFile(
    path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/project/jobs/imports/import-feed.ts"),
    "utf8",
  );
  assert.equal(/\bfetch\s*\(/.test(source), false);

  const requests = [];
  const invalidator = await createImportFeedHttpInvalidator({
    loadEnv: () => ({
      INTERNAL_REVALIDATE_BASE_URL: "https://preview.example",
      REVALIDATE_SECRET: "revalidate-secret-value-32-chars!!",
    }),
    outbound: {
      async request(request) {
        requests.push(request);
        return {
          body: new Uint8Array(),
          contentType: "application/json",
          etag: null,
          lastModified: null,
          status: 204,
        };
      },
    },
  });

  await invalidator.invalidate([{ kind: "tag", tag: "catalog" }]);

  assert.equal(requests.length, 1);
  assert.equal(requests[0].method, "POST");
  assert.equal(String(requests[0].url), "https://preview.example/api/internal/revalidate");
  assert.equal(requests[0].headers.authorization, "Bearer revalidate-secret-value-32-chars!!");
  assert.deepEqual(JSON.parse(new TextDecoder().decode(requests[0].body)), {
    targets: [{ kind: "tag", tag: "catalog" }],
  });
});

test("importFeed HTTP cache invalidation fails closed when the outbound status is not success", async () => {
  const invalidator = await createImportFeedHttpInvalidator({
    loadEnv: () => ({
      INTERNAL_REVALIDATE_BASE_URL: "https://preview.example",
      REVALIDATE_SECRET: "revalidate-secret-value-32-chars!!",
    }),
    outbound: {
      async request() {
        return {
          body: new Uint8Array(),
          contentType: null,
          etag: null,
          lastModified: null,
          status: 500,
        };
      },
    },
  });

  await assert.rejects(
    () => invalidator.invalidate([{ kind: "tag", tag: "catalog" }]),
    /internal revalidate failed/,
  );
});
