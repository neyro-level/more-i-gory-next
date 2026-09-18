import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { deliverLead } from "../src/project/jobs/leads/deliver-lead.ts";
import { createFakeLeadDeliveryChannel } from "../src/project/leads/fake-channel.ts";
import {
  createLeadChannelRegistry,
  registerLeadChannelFactory,
  unregisterLeadChannelFactory,
} from "../src/project/leads/channel-registry.ts";

const createLeadSource = readFileSync(new URL("../src/core/data-access/system/create-lead.ts", import.meta.url), "utf8");

const loadedDelivery = {
  attempts: 0,
  attemptLog: [],
  channelId: "fake",
  id: 501,
  idempotencyKey: "lead:9:channel:fake",
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

async function runFake(mode) {
  const runtime = deliveryPayload();
  const status = await deliverLead({
    leadDeliveryId: "501",
    now: new Date("2026-09-17T12:00:00.000Z"),
    payload: runtime.payload,
    resolveChannel: () => createFakeLeadDeliveryChannel(mode),
  });
  return { runtime, status };
}

test("fake transport success stores sent and externalRef", async () => {
  const { status, runtime } = await runFake("success");
  assert.equal(status, "sent");
  assert.equal(runtime.updates.at(-1).data.status, "sent");
  assert.equal(runtime.updates.at(-1).data.externalRef, "fake:1");
});

test("fake transport 400 is a permanent failure", async () => {
  const { status, runtime } = await runFake("400");
  assert.equal(status, "failed");
  assert.equal(runtime.updates.at(-1).data.status, "failed");
  assert.equal(runtime.queued.length, 0);
});

test("fake transport 429 and 500 are retryable", async () => {
  for (const mode of ["429", "500"]) {
    const { status, runtime } = await runFake(mode);
    assert.equal(status, "retry_scheduled");
    assert.equal(runtime.updates.at(-1).data.status, "pending");
    assert.equal(runtime.queued.length, 1);
  }
});

test("fake transport timeouts stay unknown and retryable", async () => {
  for (const mode of ["timeout-before-response", "unknown-timeout"]) {
    const { status } = await runFake(mode);
    assert.equal(status, "retry_scheduled");
  }
});

test("invalid channel fails closed before outbound work", async () => {
  registerLeadChannelFactory("fake", () => createFakeLeadDeliveryChannel("success"));
  try {
    assert.throws(() => createLeadChannelRegistry({ LEAD_CHANNELS: "not-a-real-channel" }));
    const runtime = deliveryPayload();
    const status = await deliverLead({
      env: { LEAD_CHANNELS: undefined },
      leadDeliveryId: "501",
      now: new Date("2026-09-17T12:00:00.000Z"),
      payload: runtime.payload,
    });
    assert.equal(status, "failed");
    assert.equal(runtime.queued.length, 0);
  } finally {
    unregisterLeadChannelFactory("fake");
  }
});

test("queue unavailable and crash-after-commit stay after the committed delivery row", () => {
  const commitIndex = createLeadSource.indexOf("await commitTransaction(req)");
  const enqueueIndex = createLeadSource.indexOf("await enqueueLeadDelivery");
  assert.ok(commitIndex > 0 && enqueueIndex > commitIndex);
  assert.match(createLeadSource, /safeCode:\s*"lead_enqueue_failed"/);
  assert.match(createLeadSource, /state:\s*"queue_unavailable"/);
});
