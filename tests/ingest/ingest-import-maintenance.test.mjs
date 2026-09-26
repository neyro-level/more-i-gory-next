import assert from "node:assert/strict";
import test from "node:test";

import { jobsJanitor } from "../../src/core/data-access/system/jobs-janitor.ts";
import {
  calculateAdaptiveStaleRunningThresholdMinutes,
  calculateOrphanQueuedThresholdMs,
  createImportRunHeartbeat,
  planImportRunJanitor,
} from "../../src/core/ingest/import-maintenance.ts";
import { ImportRuns } from "../../src/project/collections/import-runs.ts";

function field(collection, name) {
  return collection.fields.find((candidate) => candidate.name === name);
}

function optionValues(collection, name) {
  return field(collection, name).options.map((option) => option.value);
}

test("import-runs schema supports heartbeat and interrupted state", () => {
  assert.ok(optionValues(ImportRuns, "status").includes("interrupted"));
  assert.equal(field(ImportRuns, "heartbeatAt").type, "date");
  assert.equal(field(ImportRuns, "heartbeatAt").index, true);
});

test("heartbeat update is explicitly outside the ingest transaction", () => {
  assert.deepEqual(createImportRunHeartbeat("2026-09-17T03:00:00.000Z"), {
    data: { heartbeatAt: "2026-09-17T03:00:00.000Z" },
    outsideIngestTransaction: true,
  });
});

test("orphan queued threshold is max of 15 minutes and 3 dispatcher intervals", () => {
  assert.equal(calculateOrphanQueuedThresholdMs(5), 15 * 60_000);
  assert.equal(calculateOrphanQueuedThresholdMs(10), 30 * 60_000);
});

test("stale-running threshold adapts to observed successful duration", () => {
  assert.equal(calculateAdaptiveStaleRunningThresholdMinutes(15, []), 15);
  assert.equal(calculateAdaptiveStaleRunningThresholdMinutes(15, [20 * 60_000]), 40);
});

test("jobsJanitor marks stale running import as interrupted without touching baseline or deactivation", () => {
  assert.deepEqual(
    planImportRunJanitor({
      dispatcherIntervalMinutes: 5,
      nowIso: "2026-09-17T03:00:00.000Z",
      runs: [
        {
          heartbeatAt: "2026-09-17T02:40:00.000Z",
          id: 101,
          startedAt: "2026-09-17T02:30:00.000Z",
          status: "running",
        },
      ],
      staleRunningThresholdMinutes: 15,
    }),
    [
      {
        baselinePreserved: true,
        data: {
          finishedAt: "2026-09-17T03:00:00.000Z",
          status: "interrupted",
          summary: "Import run was interrupted by jobsJanitor after stale heartbeat.",
        },
        id: 101,
        massDeactivationForbidden: true,
        reason: "stale-running",
      },
    ],
  );
});

test("jobsJanitor marks orphan queued import after threshold and ignores fresh queued imports", () => {
  assert.deepEqual(
    planImportRunJanitor({
      dispatcherIntervalMinutes: 5,
      nowIso: "2026-09-17T03:00:00.000Z",
      runs: [
        { createdAt: "2026-09-17T02:40:00.000Z", id: 201, status: "queued" },
        { createdAt: "2026-09-17T02:50:00.000Z", id: 202, status: "queued" },
      ],
      staleRunningThresholdMinutes: 15,
    }),
    [
      {
        baselinePreserved: true,
        data: {
          finishedAt: "2026-09-17T03:00:00.000Z",
          status: "interrupted",
          summary: "Queued import run was interrupted by jobsJanitor after orphan threshold.",
        },
        id: 201,
        massDeactivationForbidden: true,
        reason: "orphan-queued",
      },
    ],
  );
});

test("jobsJanitor system task interrupts stale and orphan runs without deactivation", async () => {
  const findCalls = [];
  const updateCalls = [];
  const payload = {
    async find(args) {
      findCalls.push(args);
      return {
        docs: [
          {
            heartbeatAt: "2026-09-17T02:40:00.000Z",
            id: 101,
            startedAt: "2026-09-17T02:30:00.000Z",
            status: "running",
          },
          {
            createdAt: "2026-09-17T02:40:00.000Z",
            id: 201,
            status: "queued",
          },
          {
            createdAt: "2026-09-17T02:50:00.000Z",
            id: 202,
            status: "queued",
          },
        ],
      };
    },
    async update(args) {
      updateCalls.push(args);
      return { docs: [{ id: args.where.and[0].id.equals }] };
    },
  };

  assert.deepEqual(await jobsJanitor(payload, new Date("2026-09-17T03:00:00.000Z")), {
    interrupted: 2,
    massDeactivationForbidden: true,
    orphanQueued: 1,
    staleRunning: 1,
  });
  assert.equal(findCalls.length, 2);
  assert.equal(findCalls[0].collection, "import-runs");
  assert.equal(findCalls[0].overrideAccess, true);
  assert.deepEqual(findCalls[0].where, { status: { in: ["queued", "running"] } });
  assert.equal(updateCalls.length, 2);
  assert.equal(updateCalls.every((call) => call.data.status === "interrupted"), true);
  assert.equal(
    updateCalls.some((call) => Object.hasOwn(call.data, "deactivatedCount") || Object.hasOwn(call.data, "baseline")),
    false,
  );
});

test("jobsJanitor later interrupts an import-run left queued after dispatcher queue failure", async () => {
  const payload = {
    async find() {
      return {
        docs: [
          {
            createdAt: "2026-09-17T02:40:00.000Z",
            id: 501,
            status: "queued",
          },
        ],
      };
    },
    async update(args) {
      return { docs: [{ id: args.where.and[0].id.equals }] };
    },
  };

  assert.deepEqual(await jobsJanitor(payload, new Date("2026-09-17T03:00:00.000Z")), {
    interrupted: 1,
    massDeactivationForbidden: true,
    orphanQueued: 1,
    staleRunning: 0,
  });
});

test("linked live import job with future waitUntil is not declared orphan queued", async () => {
  const updateCalls = [];
  const payload = {
    async find(args) {
      if (args.collection === "payload-jobs") {
        return {
          docs: [{ id: "job-1", processing: false, waitUntil: "2026-09-17T03:30:00.000Z" }],
          hasNextPage: false,
        };
      }
      if (args.where.status?.in?.includes("success")) return { docs: [] };
      return {
        docs: [{
          createdAt: "2026-09-17T02:00:00.000Z",
          id: 701,
          jobId: "job-1",
          status: "queued",
        }],
      };
    },
    async update(args) {
      updateCalls.push(args);
      return { docs: [] };
    },
  };

  assert.deepEqual(await jobsJanitor(payload, new Date("2026-09-17T03:00:00.000Z")), {
    interrupted: 0,
    massDeactivationForbidden: true,
    orphanQueued: 0,
    staleRunning: 0,
  });
  assert.equal(updateCalls.length, 0);
});

test("adaptive threshold keeps a long but healthy running import alive", () => {
  assert.deepEqual(
    planImportRunJanitor({
      dispatcherIntervalMinutes: 5,
      nowIso: "2026-09-17T03:00:00.000Z",
      runs: [{
        heartbeatAt: "2026-09-17T02:30:00.000Z",
        id: 801,
        status: "running",
      }],
      staleRunningThresholdMinutes: 15,
      successfulDurationsMs: [20 * 60_000],
    }),
    [],
  );
});
