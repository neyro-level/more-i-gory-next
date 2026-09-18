import assert from "node:assert/strict";
import test from "node:test";

import { recoverLeadDeliveries } from "../src/core/data-access/system/lead-delivery.ts";
import { collectBoundedPages, maintenanceScanMaxPages } from "../src/core/lib/bounded-pagination.ts";
import {
  calculateLeadDeliveryRecoveryThresholdMs,
  planLeadDeliveryRecovery,
} from "../src/core/leads/delivery-recovery.ts";

const now = new Date("2026-09-17T12:00:00.000Z");

test("collectBoundedPages walks full pages until a short page", async () => {
  const pages = [];
  const docs = await collectBoundedPages({
    fetchPage: async (page, limit) => {
      pages.push({ limit, page });
      if (page === 1) return { docs: Array.from({ length: limit }, (_, index) => index), hasNextPage: true };
      return { docs: [limit], hasNextPage: false };
    },
  });

  assert.deepEqual(pages, [
    { limit: 100, page: 1 },
    { limit: 100, page: 2 },
  ]);
  assert.equal(docs.length, 101);
});

test("collectBoundedPages stops at the max page bound", async () => {
  const docs = await collectBoundedPages({
    maxPages: 2,
    pageSize: 10,
    fetchPage: async () => ({ docs: Array.from({ length: 10 }, (_, index) => index), hasNextPage: true }),
  });

  assert.equal(docs.length, 20);
  assert.equal(maintenanceScanMaxPages, 100);
});

test("lead delivery recovery threshold is max of 5 minutes and twice maintenance interval", () => {
  assert.equal(calculateLeadDeliveryRecoveryThresholdMs(1), 5 * 60_000);
  assert.equal(calculateLeadDeliveryRecoveryThresholdMs(5), 10 * 60_000);
});

test("recover plan returns stale sending and orphan pending actions only", () => {
  const actions = planLeadDeliveryRecovery({
    deliveries: [
      {
        heartbeatAt: "2026-09-17T11:49:00.000Z",
        id: "sending-stale",
        status: "sending",
      },
      {
        heartbeatAt: "2026-09-17T11:59:00.000Z",
        id: "sending-fresh",
        status: "sending",
      },
      {
        id: "pending-orphan",
        nextAttemptAt: "2026-09-17T11:58:00.000Z",
        status: "pending",
        updatedAt: "2026-09-17T11:40:00.000Z",
      },
      {
        id: "pending-live",
        nextAttemptAt: "2026-09-17T11:58:00.000Z",
        status: "pending",
        updatedAt: "2026-09-17T11:40:00.000Z",
      },
      {
        id: "pending-future",
        nextAttemptAt: "2026-09-17T12:10:00.000Z",
        status: "pending",
        updatedAt: "2026-09-17T11:40:00.000Z",
      },
    ],
    liveLeadDeliveryJobIds: new Set(["pending-live"]),
    maintenanceIntervalMinutes: 5,
    now,
  });

  assert.deepEqual(
    actions.map((action) => [action.id, action.reason]),
    [
      ["sending-stale", "stale-sending"],
      ["pending-orphan", "orphan-pending"],
    ],
  );
  assert.equal(JSON.stringify(actions).includes("+7 900"), false);
  assert.equal(JSON.stringify(actions).includes("client@example.com"), false);
});

test("recoverLeadDeliveries updates recovered rows and controlled requeues them", async () => {
  const updates = [];
  const queued = [];
  const payload = {
    jobs: {
      async queue(args) {
        queued.push(args);
      },
    },
    async find(args) {
      if (args.collection === "payload-jobs") {
        return { docs: [{ input: { leadDeliveryId: "pending-live" } }] };
      }
      return {
        docs: [
          {
            heartbeatAt: "2026-09-17T11:49:00.000Z",
            id: "sending-stale",
            status: "sending",
          },
          {
            id: "pending-orphan",
            nextAttemptAt: "2026-09-17T11:58:00.000Z",
            status: "pending",
            updatedAt: "2026-09-17T11:40:00.000Z",
          },
          {
            id: "pending-live",
            nextAttemptAt: "2026-09-17T11:58:00.000Z",
            status: "pending",
            updatedAt: "2026-09-17T11:40:00.000Z",
          },
        ],
      };
    },
    async update(args) {
      updates.push(args);
      return { docs: [{ id: args.where.and[0].id.equals }] };
    },
  };

  assert.deepEqual(
    await recoverLeadDeliveries(payload, { maintenanceIntervalMinutes: 5 }, now),
    { recovered: 2, requeued: 2 },
  );

  assert.equal(updates.length, 2);
  assert.deepEqual(
    queued.map((entry) => entry.input),
    [{ leadDeliveryId: "sending-stale" }, { leadDeliveryId: "pending-orphan" }],
  );
  assert.deepEqual(queued[0], {
    input: { leadDeliveryId: "sending-stale" },
    overrideAccess: true,
    queue: "lead-deliveries",
    task: "deliverLead",
    waitUntil: now,
  });
});

test("recoverLeadDeliveries pages payload-jobs and lead-deliveries past the old 1000 ceiling", async () => {
  const findCalls = [];
  const pageSize = 100;
  const payload = {
    jobs: {
      async queue() {},
    },
    async find(args) {
      findCalls.push(args);
      if (args.page === 1) {
        return {
          docs: Array.from({ length: pageSize }, (_, index) =>
            args.collection === "payload-jobs"
              ? { input: { leadDeliveryId: `live-${index}` } }
              : {
                  id: `pending-page-1-${index}`,
                  nextAttemptAt: "2026-09-17T11:58:00.000Z",
                  status: "pending",
                  updatedAt: "2026-09-17T11:40:00.000Z",
                },
          ),
          hasNextPage: true,
        };
      }

      return {
        docs: [
          args.collection === "payload-jobs"
            ? { input: { leadDeliveryId: "pending-live" } }
            : {
                id: "pending-orphan",
                nextAttemptAt: "2026-09-17T11:58:00.000Z",
                status: "pending",
                updatedAt: "2026-09-17T11:40:00.000Z",
              },
        ],
        hasNextPage: false,
      };
    },
    async update() {
      return { docs: [] };
    },
  };

  const result = await recoverLeadDeliveries(payload, { maintenanceIntervalMinutes: 5 }, now);
  assert.equal(result.recovered > 100, true);
  assert.equal(findCalls.some((call) => call.collection === "payload-jobs" && call.page === 2), true);
  assert.equal(findCalls.some((call) => call.collection === "lead-deliveries" && call.page === 2), true);
  assert.equal(findCalls.every((call) => call.limit === pageSize && call.pagination === true), true);
  assert.equal(findCalls.every((call) => call.limit !== 1000), true);
});
