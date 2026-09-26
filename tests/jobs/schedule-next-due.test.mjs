import assert from "node:assert/strict";
import test from "node:test";

import {
  calculatePostRunNextDueAt,
  consecutiveImportFailureCount,
} from "../../src/core/ingest/schedule-next-due.ts";
import { scheduleFeedSourceAfterRun } from "../../src/core/data-access/system/import-feed-run.ts";
import { jobsJanitor } from "../../src/core/data-access/system/jobs-janitor.ts";
import { runImportFeedWithHeartbeat } from "../../src/project/jobs/imports/import-feed.ts";

test("dispatcher remains the claim owner; post-run nextDueAt is owned by the terminal handler", () => {
  const now = new Date("2026-09-18T12:00:00.000Z");
  assert.equal(
    calculatePostRunNextDueAt({
      consecutiveFailures: 0,
      intervalMinutes: 15,
      now,
      outcome: "success",
    }).toISOString(),
    "2026-09-18T12:15:00.000Z",
  );
  assert.equal(
    calculatePostRunNextDueAt({
      consecutiveFailures: 0,
      intervalMinutes: 15,
      now,
      outcome: "unchanged",
    }).toISOString(),
    "2026-09-18T12:15:00.000Z",
  );
  assert.equal(
    calculatePostRunNextDueAt({
      consecutiveFailures: 0,
      intervalMinutes: 15,
      now,
      outcome: "suspicious",
    }).toISOString(),
    "2026-09-18T12:15:00.000Z",
  );
});

test("failed and interrupted feeds back off up to 8x refresh interval", () => {
  const now = new Date("2026-09-18T12:00:00.000Z");
  assert.equal(consecutiveImportFailureCount(["failed", "failed", "success"]), 2);
  assert.equal(
    calculatePostRunNextDueAt({
      consecutiveFailures: 1,
      intervalMinutes: 15,
      now,
      outcome: "failed",
    }).toISOString(),
    "2026-09-18T12:15:00.000Z",
  );
  assert.equal(
    calculatePostRunNextDueAt({
      consecutiveFailures: 3,
      intervalMinutes: 15,
      now,
      outcome: "interrupted",
    }).toISOString(),
    "2026-09-18T13:00:00.000Z",
  );
  assert.equal(
    calculatePostRunNextDueAt({
      consecutiveFailures: 8,
      intervalMinutes: 15,
      now,
      outcome: "failed",
    }).toISOString(),
    "2026-09-18T14:00:00.000Z",
  );
});

test("304 skip reschedules from now and does not hammer the feed", async () => {
  const writes = [];
  const payload = {
    async update(args) {
      writes.push(args);
      return { docs: [{ id: "501" }] };
    },
    async findByID() {
      return { refreshIntervalMinutes: 15, feedUrlRef: "FEED_URL_PRIMARY", lastEtag: '"abc"', lastModified: null };
    },
    async find() {
      return { docs: [{ status: "unchanged" }] };
    },
  };

  const result = await runImportFeedWithHeartbeat({
    input: { feedSourceId: "101", importRunId: "501" },
    lookupEnv: () => "https://feeds.example/primary.xml",
    outbound: {
      async requestStream() {
        return {
          body: (async function* () {})(),
          contentType: null,
          etag: '"abc"',
          lastModified: null,
          status: 304,
        };
      },
    },
    payload,
    setHeartbeatInterval: () => 1,
    clearHeartbeatInterval() {},
  });

  assert.equal(result.status, "unchanged");
  const scheduleWrite = writes.find((write) => write.collection === "feed-sources" && write.data.nextDueAt);
  assert.ok(scheduleWrite?.data.nextDueAt);
});

test("stale-running janitor applies interrupted backoff on the feed source", async () => {
  const writes = [];
  const payload = {
    async find(args) {
      if (args.where?.feedSource) return { docs: [{ status: "interrupted" }, { status: "failed" }] };
      return {
        docs: [
          {
            feedSource: 101,
            heartbeatAt: "2026-09-17T02:40:00.000Z",
            id: 101,
            startedAt: "2026-09-17T02:30:00.000Z",
            status: "running",
          },
        ],
      };
    },
    async findByID() {
      return { refreshIntervalMinutes: 15 };
    },
    async update(args) {
      writes.push(args);
      return { docs: [{ id: args.id ?? args.where?.and?.[0]?.id?.equals }] };
    },
  };

  const result = await jobsJanitor(payload, new Date("2026-09-17T03:00:00.000Z"));
  assert.equal(result.staleRunning, 1);
  const feedWrite = writes.find((write) => write.collection === "feed-sources");
  assert.equal(feedWrite.data.nextDueAt, "2026-09-17T03:30:00.000Z");
});

test("scheduleFeedSourceAfterRun writes nextDueAt after a failed history prefix", async () => {
  const writes = [];
  const nextDueAt = await scheduleFeedSourceAfterRun(
    {
      async findByID() {
        return { refreshIntervalMinutes: 60 };
      },
      async find() {
        return { docs: [{ status: "failed" }, { status: "failed" }] };
      },
      async update(args) {
        writes.push(args);
        return { docs: [{ id: "101" }] };
      },
    },
    { feedSourceId: "101", importRunId: "501", outcome: "failed" },
    new Date("2026-09-18T12:00:00.000Z"),
  );
  assert.equal(nextDueAt, "2026-09-18T14:00:00.000Z");
  assert.equal(writes[0].collection, "feed-sources");
  assert.equal(writes[0].id, "101");
});
