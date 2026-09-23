import assert from "node:assert/strict";
import test from "node:test";

import { runSafeDeactivation } from "../src/core/ingest/run-safe-deactivation.ts";

function payloadMock({
  mode = "full",
  lastFullRunAt = "2026-09-01T00:00:00.000Z",
  lastOfferCount = 10,
  lastFeedHash = "hash",
  maxDeactivationsPerRun = 20,
  safetyThresholdPercent = 20,
  approval = {},
  active = [],
} = {}) {
  const writes = [];
  const payload = {
    async findByID(args) {
      if (args.collection === "import-runs") return { mode };
      return {
        deactivationApproval: approval,
        lastFeedHash,
        lastFullRunAt,
        lastOfferCount,
        market: "newbuild",
        maxDeactivationsPerRun,
        safetyThresholdPercent,
      };
    },
    async find() {
      return { docs: active, hasNextPage: false };
    },
    async update(args) {
      writes.push(args);
      return { docs: [] };
    },
    async create(args) {
      writes.push(args);
      return { id: 1 };
    },
  };
  return { payload, writes };
}

test("incremental runs never mass-deactivate", async () => {
  const { payload, writes } = payloadMock({
    mode: "incremental",
    active: [{ id: 1, externalId: "gone" }],
  });
  const plan = await runSafeDeactivation({
    feedSourceId: "feed-a",
    importRunId: "run-1",
    nowIso: "2026-09-18T12:00:00.000Z",
    payload,
    seenExternalIds: [],
  });
  assert.equal(plan.action, "skip");
  assert.equal(plan.reason, "baseline");
  assert.equal(writes.some((write) => write.collection === "properties"), false);
});

test("first full run never mass-deactivates missing inventory", async () => {
  const { payload, writes } = payloadMock({
    lastFullRunAt: null,
    lastFeedHash: null,
    lastOfferCount: null,
    active: [{ id: 1, externalId: "gone" }],
  });
  const plan = await runSafeDeactivation({
    feedSourceId: "feed-a",
    importRunId: "run-1",
    nowIso: "2026-09-18T12:00:00.000Z",
    payload,
    seenExternalIds: ["still-here"],
  });
  assert.equal(plan.action, "skip");
  assert.equal(plan.reason, "baseline");
  assert.equal(writes.length, 0);
});

test("in-gate missing offers are archived in feed+market+active scope", async () => {
  const { payload, writes } = payloadMock({
    active: [
      ...Array.from({ length: 9 }, (_, index) => ({ id: index + 1, externalId: `keep-${index}` })),
      { id: 10, externalId: "gone" },
    ],
  });
  const plan = await runSafeDeactivation({
    feedSourceId: "feed-a",
    importRunId: "run-1",
    nowIso: "2026-09-18T12:00:00.000Z",
    payload,
    seenExternalIds: Array.from({ length: 9 }, (_, index) => `keep-${index}`),
  });
  assert.equal(plan.action, "deactivate");
  assert.deepEqual(writes[0].where, { id: { in: [10] } });
  assert.equal(writes[0].data.status, "archived");
  assert.equal(writes[0].data.deactivatedByRun, "run-1");
});

test("percentage safety gate uses the last successful full offer count", async () => {
  const { payload, writes } = payloadMock({
    active: [
      ...Array.from({ length: 7 }, (_, index) => ({ id: index + 1, externalId: `keep-${index}` })),
      { id: 8, externalId: "gone-1" },
      { id: 9, externalId: "gone-2" },
      { id: 10, externalId: "gone-3" },
    ],
    lastOfferCount: 100,
    maxDeactivationsPerRun: 20,
    safetyThresholdPercent: 20,
  });
  const plan = await runSafeDeactivation({
    feedSourceId: "feed-a",
    importRunId: "run-1",
    nowIso: "2026-09-18T12:00:00.000Z",
    payload,
    seenExternalIds: Array.from({ length: 7 }, (_, index) => `keep-${index}`),
  });

  assert.equal(plan.action, "deactivate");
  assert.deepEqual(writes[0].where, { id: { in: [8, 9, 10] } });
});

test("absolute deactivation ceiling remains enforced even below the percentage threshold", async () => {
  const { payload, writes } = payloadMock({
    active: [
      { id: 1, externalId: "keep" },
      { id: 2, externalId: "gone-1" },
      { id: 3, externalId: "gone-2" },
    ],
    lastOfferCount: 100,
    maxDeactivationsPerRun: 1,
    safetyThresholdPercent: 20,
  });
  const plan = await runSafeDeactivation({
    feedSourceId: "feed-a",
    importRunId: "run-1",
    nowIso: "2026-09-18T12:00:00.000Z",
    payload,
    seenExternalIds: ["keep"],
  });

  assert.equal(plan.action, "suspicious");
  assert.equal(plan.issueCode, "deactivation-approval-required");
  assert.equal(writes.some((write) => write.collection === "properties"), false);
});

test("threshold breach without run-bound approval stays suspicious and does not archive", async () => {
  const { payload, writes } = payloadMock({
    maxDeactivationsPerRun: 1,
    active: [
      { id: 1, externalId: "keep" },
      { id: 2, externalId: "gone-1" },
      { id: 3, externalId: "gone-2" },
    ],
  });
  const plan = await runSafeDeactivation({
    feedSourceId: "feed-a",
    importRunId: "run-1",
    nowIso: "2026-09-18T12:00:00.000Z",
    payload,
    seenExternalIds: ["keep"],
  });
  assert.equal(plan.action, "suspicious");
  assert.equal(plan.issueCode, "deactivation-approval-required");
  assert.equal(writes[0].collection, "import-issues");
  assert.equal(writes.some((write) => write.collection === "properties"), false);
});
