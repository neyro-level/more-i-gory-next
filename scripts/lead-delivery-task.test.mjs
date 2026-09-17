import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { markLeadDeliverySent, transitionLeadDeliveryToSending } from "../src/core/data-access/system/lead-delivery.ts";
import { deliverLeadTask, leadDeliveryBackoffMs } from "../src/project/jobs/leads/deliver-lead.ts";
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
