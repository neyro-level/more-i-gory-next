import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { markLeadDeliverySent, touchLeadDeliveryHeartbeat, transitionLeadDeliveryToSending } from "../src/core/data-access/system/lead-delivery.ts";
import { calculateLeadDeliveryRecoveryThresholdMs } from "../src/core/leads/delivery-recovery.ts";
import { LeadDeliveryFailure } from "../src/core/leads/delivery.ts";
import { deliverLead, deliverLeadTask, leadDeliveryBackoffMs, leadDeliveryHeartbeatIntervalMs } from "../src/project/jobs/leads/deliver-lead.ts";
import { createJobsConfig } from "../src/project/jobs/config.ts";

const taskSource = readFileSync(new URL("../src/project/jobs/leads/deliver-lead.ts", import.meta.url), "utf8");
const createLeadSource = readFileSync(new URL("../src/core/data-access/system/create-lead.ts", import.meta.url), "utf8");

test("deliverLead task declares the approved queue execution contract", () => {
  assert.equal(deliverLeadTask.slug, "deliverLead");
  assert.equal(deliverLeadTask.retries, 0);
  assert.deepEqual(deliverLeadTask.concurrency, {
    exclusive: true,
    key: deliverLeadTask.concurrency.key,
    supersedes: false,
  });
  assert.equal(
    deliverLeadTask.concurrency.key({ input: { leadDeliveryId: "501" }, queue: "lead-deliveries" }),
    "delivery:501",
  );
  assert.deepEqual(leadDeliveryBackoffMs, [
    0,
    60_000,
    300_000,
    900_000,
    3_600_000,
    14_400_000,
  ]);
});

test("deliverLead job input carries only the leadDeliveryId", () => {
  assert.deepEqual(deliverLeadTask.inputSchema.map((field) => field.name), ["leadDeliveryId"]);
  assert.match(createLeadSource, /input:\s*\{\s*leadDeliveryId: String\(leadDeliveryId\)\s*\}/);
  assert.doesNotMatch(createLeadSource, /input:\s*\{[^}]*phone/s);
  assert.doesNotMatch(createLeadSource, /input:\s*\{[^}]*email/s);
  assert.doesNotMatch(createLeadSource, /input:\s*\{[^}]*message/s);
});

test("jobs config registers deliverLead without enabling scheduled autorun", () => {
  const config = createJobsConfig("false");
  const taskSlugs = config.tasks?.map((task) => task.slug) ?? [];

  assert.ok(taskSlugs.includes("deliverLead"));
  assert.equal(config.autoRun.find((entry) => entry.queue === "lead-deliveries")?.disableScheduling, true);
});

test("deliverLead task does not perform outbound delivery before state-machine tasks", () => {
  assert.equal(taskSource.includes("fetch("), false);
  assert.equal(taskSource.includes("process.env"), false);
  assert.match(taskSource, /loadLeadDeliveryForSend/);
  assert.match(taskSource, /planRetryableLeadDeliveryFailure/);
  assert.match(taskSource, /createLeadChannelRegistry/);
});

test("lead delivery transition conditionally claims only pending due rows", async () => {
  const calls = [];
  const payload = {
    async update(args) {
      calls.push(args);
      return { docs: [{ id: "501" }] };
    },
  };
  const now = new Date("2026-09-17T12:00:00.000Z");

  assert.equal(await transitionLeadDeliveryToSending(payload, { leadDeliveryId: "501" }, now), true);
  assert.deepEqual(calls[0], {
    collection: "lead-deliveries",
    data: {
      claimedAt: "2026-09-17T12:00:00.000Z",
      heartbeatAt: "2026-09-17T12:00:00.000Z",
      status: "sending",
    },
    overrideAccess: true,
    where: {
      and: [
        { id: { equals: "501" } },
        { status: { equals: "pending" } },
        {
          or: [
            { nextAttemptAt: { less_than_equal: "2026-09-17T12:00:00.000Z" } },
            { nextAttemptAt: { exists: false } },
          ],
        },
      ],
    },
  });
});

test("deliverLead handler exits without outbound work when pending claim fails", async () => {
  let updateCalls = 0;
  const result = await deliverLeadTask.handler({
    input: { leadDeliveryId: "501" },
    req: {
      payload: {
        async update() {
          updateCalls += 1;
          return { docs: [] };
        },
      },
    },
  });

  assert.deepEqual(result, { output: { status: "skipped" } });
  assert.equal(updateCalls, 1);
});

test("confirmed remote delivery stores externalRef while row is sending", async () => {
  const calls = [];
  const payload = {
    async update(args) {
      calls.push(args);
      return { docs: [{ id: "501" }] };
    },
  };
  const now = new Date("2026-09-17T12:05:00.000Z");

  assert.equal(
    await markLeadDeliverySent(payload, { externalRef: "telegram:42", leadDeliveryId: "501" }, now),
    true,
  );
  assert.deepEqual(calls[0], {
    collection: "lead-deliveries",
    data: {
      externalRef: "telegram:42",
      heartbeatAt: "2026-09-17T12:05:00.000Z",
      lastErrorRedacted: null,
      status: "sent",
    },
    overrideAccess: true,
    where: {
      and: [
        { id: { equals: "501" } },
        { status: { equals: "sending" } },
      ],
    },
  });
});

const loadedDelivery = {
  attempts: 1,
  attemptLog: [
    {
      attemptedAt: "2026-09-17T11:00:00.000Z",
      deliveryCertainty: "not_delivered",
      outcome: "failed",
      redactedMessage: "previous",
      safeCode: "previous",
    },
  ],
  channelId: "probe",
  id: 501,
  idempotencyKey: "lead:9:channel:probe",
  lead: 9,
};

const loadedLead = {
  consent: { acceptedAt: "2026-09-17T10:00:00.000Z", version: "v1" },
  id: 9,
  message: "Need a property.",
  name: "Ольга",
  phone: "+7 900 000-00-00",
  sourcePath: "/podbor/",
};

function deliveryPayload() {
  const updates = [];
  const queued = [];
  return {
    payload: {
      async findByID(args) {
        if (args.collection === "lead-deliveries") return loadedDelivery;
        return loadedLead;
      },
      async update(args) {
        updates.push(args);
        return { docs: [{ id: "501" }] };
      },
      jobs: {
        async queue(args) {
          queued.push(args);
          return {};
        },
      },
    },
    queued,
    updates,
  };
}

test("deliverLead loads retry state, resolves the channel, then stores sent", async () => {
  const runtime = deliveryPayload();
  const logs = [];
  const status = await deliverLead({
    leadDeliveryId: "501",
    logger: {
      error() {},
      info(message, context) {
        logs.push({ message, context });
      },
      warn() {},
    },
    now: new Date("2026-09-17T12:00:00.000Z"),
    payload: runtime.payload,
    resolveChannel: (channelId) => ({
      id: channelId,
      async deliver(payload) {
        assert.equal(payload.idempotencyKey, "lead:9:channel:probe");
        assert.equal(payload.lead.phone, "+7 900 000-00-00");
        return { classification: "sent", deliveryCertainty: "confirmed", externalRef: "probe:7" };
      },
    }),
  });

  assert.equal(status, "sent");
  assert.deepEqual(runtime.updates[1].data, { heartbeatAt: "2026-09-17T12:00:00.000Z" });
  assert.equal(runtime.updates[2].data.status, "sent");
  assert.equal(runtime.updates[2].data.externalRef, "probe:7");
  assert.equal(runtime.queued.length, 0);
});

test("retryable channel failure plans the next attempt before returning", async () => {
  const runtime = deliveryPayload();
  const status = await deliverLead({
    leadDeliveryId: "501",
    now: new Date("2026-09-17T12:00:00.000Z"),
    payload: runtime.payload,
    resolveChannel: () => ({
      id: "probe",
      async deliver() {
        throw new LeadDeliveryFailure({
          deliveryCertainty: "unknown",
          redactedMessage: "probe_timeout",
          retryable: true,
          safeCode: "probe_timeout",
        });
      },
    }),
  });

  assert.equal(status, "retry_scheduled");
  assert.equal(runtime.updates[2].data.status, "pending");
  assert.equal(runtime.updates[2].data.attempts, 2);
  assert.ok(Array.isArray(runtime.updates[2].data.attemptLog));
  assert.equal(runtime.queued.length, 1);
});

test("exhausted retryable attempts abandon the delivery", async () => {
  const runtime = deliveryPayload();
  runtime.payload.findByID = async (args) => {
    if (args.collection === "lead-deliveries") return { ...loadedDelivery, attempts: 5 };
    return loadedLead;
  };
  const status = await deliverLead({
    leadDeliveryId: "501",
    now: new Date("2026-09-17T12:00:00.000Z"),
    payload: runtime.payload,
    resolveChannel: () => ({
      id: "probe",
      async deliver() {
        throw new LeadDeliveryFailure({
          deliveryCertainty: "unknown",
          redactedMessage: "probe_timeout",
          retryable: true,
          safeCode: "probe_timeout",
        });
      },
    }),
  });

  assert.equal(status, "abandoned");
  assert.equal(runtime.updates[2].data.status, "abandoned");
  assert.equal(runtime.queued.length, 0);
});

test("missing channel fails closed without outbound work", async () => {
  const runtime = deliveryPayload();
  const status = await deliverLead({
    env: { LEAD_CHANNELS: undefined },
    leadDeliveryId: "501",
    now: new Date("2026-09-17T12:00:00.000Z"),
    payload: runtime.payload,
  });

  assert.equal(status, "failed");
  assert.equal(runtime.updates[1].data.status, "failed");
  assert.equal(runtime.queued.length, 0);
});

test("heartbeat interval stays below the stale-sending recovery threshold and carries no PII", async () => {
  assert.ok(leadDeliveryHeartbeatIntervalMs < calculateLeadDeliveryRecoveryThresholdMs(5));
  const calls = [];
  await touchLeadDeliveryHeartbeat(
    {
      async update(args) {
        calls.push(args);
        return { docs: [{ id: "501" }] };
      },
    },
    { leadDeliveryId: "501" },
    new Date("2026-09-17T12:00:00.000Z"),
  );
  assert.deepEqual(calls[0].data, { heartbeatAt: "2026-09-17T12:00:00.000Z" });
  assert.equal(JSON.stringify(calls[0].data).includes("Ольга"), false);

  const runtime = deliveryPayload();
  let tick;
  await deliverLead({
    leadDeliveryId: "501",
    now: new Date("2026-09-17T12:00:00.000Z"),
    payload: runtime.payload,
    resolveChannel: () => ({
      id: "probe",
      async deliver() {
        tick?.();
        return { classification: "sent", deliveryCertainty: "confirmed", externalRef: "probe:1" };
      },
    }),
    setHeartbeatInterval: (callback) => {
      tick = callback;
      return 1;
    },
  });
  assert.ok(runtime.updates.some((entry) => Object.keys(entry.data).join() === "heartbeatAt"));
});
