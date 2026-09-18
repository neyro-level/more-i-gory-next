import assert from "node:assert/strict";
import test from "node:test";

import { dispatchDueFeeds, calculateNextDueAt } from "../src/core/data-access/system/dispatch-due-feeds.ts";
import { transitionImportRunToRunning } from "../src/core/data-access/system/import-feed-run.ts";
import {
  createImportFeedClaimHandler,
  ingestStageOrder,
  runIngestPipeline,
} from "../src/project/ingest/pipeline.ts";
import { createJobsConfig } from "../src/project/jobs/config.ts";
import { importFeedTask } from "../src/project/jobs/imports/import-feed.ts";

function createPayloadMock({ claimSucceeds = true, queueFails = false } = {}) {
  const calls = {
    create: [],
    queue: [],
    update: [],
  };
  const payload = {
    async find(args) {
      assert.equal(args.collection, "feed-sources");
      assert.equal(args.where.and[0].enabled.equals, true);
      assert.equal(args.where.and[1].or[0].nextDueAt.less_than_equal, "2026-09-17T00:00:00.000Z");
      assert.equal(args.pagination, false);
      return {
        docs: [
          {
            id: 101,
            nextDueAt: "2026-09-16T23:00:00.000Z",
            refreshIntervalMinutes: 15,
          },
        ],
      };
    },
    async create(args) {
      calls.create.push(args);
      return { id: 501 };
    },
    async update(args) {
      calls.update.push(args);
      if (args.collection === "feed-sources") return { docs: claimSucceeds ? [{ id: 101 }] : [] };
      return { id: args.id };
    },
    jobs: {
      async queue(args) {
        calls.queue.push(args);
        if (queueFails) throw new Error("queue failed");
        return { id: 9001 };
      },
    },
  };

  return { calls, payload };
}

test("calculateNextDueAt advances from now when missed intervals are behind", () => {
  const now = new Date("2026-09-17T00:00:00.000Z");
  assert.equal(calculateNextDueAt(now, "2026-09-16T22:00:00.000Z", 15).toISOString(), "2026-09-17T00:15:00.000Z");
});

test("calculateNextDueAt preserves a future cadence instead of pulling it backwards", () => {
  const now = new Date("2026-09-17T00:00:00.000Z");
  assert.equal(calculateNextDueAt(now, "2026-09-17T00:10:00.000Z", 15).toISOString(), "2026-09-17T00:25:00.000Z");
});

test("dispatchDueFeeds conditionally claims a source, creates an import run and queues importFeed", async () => {
  const { calls, payload } = createPayloadMock();
  const result = await dispatchDueFeeds(payload, new Date("2026-09-17T00:00:00.000Z"));

  assert.deepEqual(result, { claimed: 1, queued: 1 });
  assert.equal(calls.update[0].collection, "feed-sources");
  assert.equal(calls.update[0].data.lastAttemptAt, "2026-09-17T00:00:00.000Z");
  assert.equal(calls.update[0].data.nextDueAt, "2026-09-17T00:15:00.000Z");
  assert.equal(calls.update[0].where.and[0].id.equals, 101);
  assert.equal(calls.create[0].collection, "import-runs");
  assert.deepEqual(calls.create[0].data, { feedSource: 101, status: "queued" });
  assert.deepEqual(calls.queue[0], {
    input: { feedSourceId: "101", importRunId: "501" },
    overrideAccess: true,
    queue: "imports",
    task: "importFeed",
  });
  assert.deepEqual(calls.update[1], {
    collection: "import-runs",
    data: { jobId: "9001" },
    id: 501,
    overrideAccess: true,
  });
});

test("dispatchDueFeeds skips enqueue when the conditional claim loses the race", async () => {
  const { calls, payload } = createPayloadMock({ claimSucceeds: false });
  const result = await dispatchDueFeeds(payload, new Date("2026-09-17T00:00:00.000Z"));

  assert.deepEqual(result, { claimed: 0, queued: 0 });
  assert.equal(calls.create.length, 0);
  assert.equal(calls.queue.length, 0);
});

test("dispatchDueFeeds leaves a queued import-run when enqueue fails", async () => {
  const { calls, payload } = createPayloadMock({ queueFails: true });
  const result = await dispatchDueFeeds(payload, new Date("2026-09-17T00:00:00.000Z"));

  assert.deepEqual(result, { claimed: 1, queued: 0 });
  assert.equal(calls.create.length, 1);
  assert.equal(calls.queue.length, 1);
  assert.equal(calls.update.filter((entry) => entry.collection === "import-runs").length, 0);
});

test("jobs config registers dispatchDueFeeds schedule and importFeed target", () => {
  const config = createJobsConfig("false");
  const taskSlugs = config.tasks?.map((task) => task.slug) ?? [];
  const dispatchTask = config.tasks?.find((task) => task.slug === "dispatchDueFeeds");
  const importTask = config.tasks?.find((task) => task.slug === "importFeed");

  assert.ok(taskSlugs.includes("systemHealth"));
  assert.ok(taskSlugs.includes("dispatchDueFeeds"));
  assert.ok(taskSlugs.includes("importFeed"));
  assert.deepEqual(dispatchTask?.schedule, [{ cron: "0 0/5 * * * *", queue: "system" }]);
  assert.deepEqual(importTask?.concurrency, {
    exclusive: true,
    key: importTask.concurrency.key,
  });
  assert.equal(importTask?.concurrency.key({ input: { feedSourceId: "101", importRunId: "501" }, queue: "imports" }), "import:feed:101");
  assert.equal(importTask?.retries, 0);
});

test("transitionImportRunToRunning conditionally moves queued run to running", async () => {
  const calls = [];
  const payload = {
    async update(args) {
      calls.push(args);
      return { docs: [{ id: 501 }] };
    },
  };
  const transitioned = await transitionImportRunToRunning(
    payload,
    { feedSourceId: "101", importRunId: "501" },
    new Date("2026-09-17T00:30:00.000Z"),
  );

  assert.equal(transitioned, true);
  assert.deepEqual(calls[0], {
    collection: "import-runs",
    data: { startedAt: "2026-09-17T00:30:00.000Z", status: "running" },
    overrideAccess: true,
    where: {
      and: [
        { id: { equals: "501" } },
        { feedSource: { equals: "101" } },
        { status: { equals: "queued" } },
      ],
    },
  });
});

test("transitionImportRunToRunning returns false when queued to running claim fails", async () => {
  const payload = {
    async update() {
      return { docs: [] };
    },
  };

  assert.equal(
    await transitionImportRunToRunning(payload, { feedSourceId: "101", importRunId: "501" }),
    false,
  );
});

test("ingest composition root claims then stops at the next unbound stage", async () => {
  assert.deepEqual(ingestStageOrder[0], "claim-running");
  assert.ok(ingestStageOrder.includes("parse"));
  assert.ok(ingestStageOrder.includes("finalize"));

  const result = await runIngestPipeline({
    handlers: {
      "claim-running": createImportFeedClaimHandler(async () => true),
    },
    input: { feedSourceId: "101", importRunId: "501" },
  });

  assert.deepEqual(result, {
    completedStages: ["claim-running"],
    pendingStage: "resolve-feed-url",
    status: "running",
    state: {},
  });
});

test("importFeed job delegates to the ingest composition root and skips without ingest on failed claim", async () => {
  const result = await importFeedTask.handler?.({
    input: { feedSourceId: "101", importRunId: "501" },
    req: {
      payload: {
        async update() {
          return { docs: [] };
        },
      },
    },
  });

  assert.deepEqual(result, { output: { status: "skipped" } });
});
