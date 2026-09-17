import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateOrphanQueuedThresholdMs,
  createImportRunHeartbeat,
  planImportRunJanitor,
} from "../src/core/ingest/import-maintenance.ts";
import { ImportRuns } from "../src/project/collections/import-runs.ts";

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
