import assert from "node:assert/strict";
import test from "node:test";

import { recordLeadDeliveryFailureAndMaybeRetry } from "../src/core/data-access/system/lead-delivery.ts";
import { LeadDeliveryFailure } from "../src/core/leads/delivery.ts";
import { planRetryableLeadDeliveryFailure } from "../src/core/leads/delivery-state.ts";
import { leadDeliveryBackoffMs } from "../src/project/jobs/leads/deliver-lead.ts";

const now = new Date("2026-09-17T12:00:00.000Z");

test("retryable delivery failure plans a pending retry without throwing", () => {
  const plan = planRetryableLeadDeliveryFailure({
    attempts: 0,
    backoffMs: leadDeliveryBackoffMs,
    failure: new LeadDeliveryFailure({
      deliveryCertainty: "unknown",
      redactedMessage: "Telegram lead delivery failed.",
      retryable: true,
      safeCode: "telegram_unavailable",
    }),
    now,
  });

  assert.equal(plan.status, "pending");
  assert.equal(plan.attempts, 1);
  assert.equal(plan.enqueueNextAttempt, true);
  assert.equal(plan.nextAttemptAt, "2026-09-17T12:01:00.000Z");
  assert.equal(plan.lastErrorRedacted, "Telegram lead delivery failed.");
  assert.deepEqual(plan.attemptLog, [
    {
      attemptedAt: now.toISOString(),
      deliveryCertainty: "unknown",
      outcome: "failed",
      redactedMessage: "Telegram lead delivery failed.",
      safeCode: "telegram_unavailable",
    },
  ]);
});

test("retryable failure is abandoned after the backoff ladder is exhausted", () => {
  const plan = planRetryableLeadDeliveryFailure({
    attempts: 5,
    backoffMs: leadDeliveryBackoffMs,
    failure: new LeadDeliveryFailure({
      deliveryCertainty: "unknown",
      redactedMessage: "Telegram lead delivery failed.",
      retryable: true,
      safeCode: "telegram_unavailable",
    }),
    maxAttempts: leadDeliveryBackoffMs.length,
    now,
  });

  assert.equal(plan.status, "abandoned");
  assert.equal(plan.attempts, 6);
  assert.equal(plan.enqueueNextAttempt, false);
  assert.equal(plan.nextAttemptAt, undefined);
  assert.equal(plan.attemptLog.at(-1)?.outcome, "abandoned");
});

test("non-retryable delivery failure plans failed status without enqueue", () => {
  const plan = planRetryableLeadDeliveryFailure({
    attempts: 1,
    backoffMs: leadDeliveryBackoffMs,
    failure: new LeadDeliveryFailure({
      deliveryCertainty: "not_delivered",
      redactedMessage: "Telegram lead delivery failed.",
      retryable: false,
      safeCode: "telegram_rejected",
    }),
    now,
  });

  assert.equal(plan.status, "failed");
  assert.equal(plan.attempts, 2);
  assert.equal(plan.enqueueNextAttempt, false);
  assert.equal(plan.nextAttemptAt, undefined);
});

test("attempt log is compact and never contains raw operational details", () => {
  const priorLog = Array.from({ length: 25 }, (_, index) => ({
    attemptedAt: new Date(now.getTime() - index * 1000).toISOString(),
    deliveryCertainty: "unknown",
    outcome: "failed",
    redactedMessage: "previous",
    safeCode: "previous",
  }));
  const plan = planRetryableLeadDeliveryFailure({
    attemptLog: priorLog,
    attempts: 5,
    backoffMs: leadDeliveryBackoffMs,
    failure: new LeadDeliveryFailure({
      deliveryCertainty: "unknown",
      redactedMessage: "Telegram lead delivery failed.",
      retryable: true,
      safeCode: "telegram_unavailable",
    }),
    maxAttemptLogRows: 20,
    now,
  });

  assert.equal(plan.attemptLog.length, 20);
  assert.equal(JSON.stringify(plan).includes("+7 900"), false);
  assert.equal(JSON.stringify(plan).includes("client@example.com"), false);
});

test("retryable failure updates delivery state and enqueues the next attempt without throwing", async () => {
  const updates = [];
  const queued = [];
  const plan = planRetryableLeadDeliveryFailure({
    attempts: 0,
    backoffMs: leadDeliveryBackoffMs,
    failure: new LeadDeliveryFailure({
      deliveryCertainty: "unknown",
      redactedMessage: "Telegram lead delivery failed.",
      retryable: true,
      safeCode: "telegram_unavailable",
    }),
    now,
  });
  const payload = {
    jobs: {
      async queue(args) {
        queued.push(args);
      },
    },
    async update(args) {
      updates.push(args);
      return { docs: [{ id: "501" }] };
    },
  };

  const result = await recordLeadDeliveryFailureAndMaybeRetry(payload, {
    leadDeliveryId: "501",
    plan,
  });

  assert.equal(result, "retry_scheduled");
  assert.deepEqual(updates[0].data, {
    attempts: 1,
    attemptLog: plan.attemptLog,
    claimedAt: null,
    heartbeatAt: null,
    lastErrorRedacted: "Telegram lead delivery failed.",
    nextAttemptAt: "2026-09-17T12:01:00.000Z",
    status: "pending",
  });
  assert.deepEqual(queued[0], {
    input: { leadDeliveryId: "501" },
    overrideAccess: true,
    queue: "lead-deliveries",
    task: "deliverLead",
    waitUntil: new Date("2026-09-17T12:01:00.000Z"),
  });
});

test("exhausted retry plan records abandoned without enqueueing another job", async () => {
  const queued = [];
  const plan = planRetryableLeadDeliveryFailure({
    attempts: 5,
    backoffMs: leadDeliveryBackoffMs,
    failure: new LeadDeliveryFailure({
      deliveryCertainty: "unknown",
      redactedMessage: "Telegram lead delivery failed.",
      retryable: true,
      safeCode: "telegram_unavailable",
    }),
    now,
  });
  const payload = {
    jobs: {
      async queue(args) {
        queued.push(args);
      },
    },
    async update(args) {
      return { docs: [{ id: "501" }], data: args.data };
    },
  };

  const result = await recordLeadDeliveryFailureAndMaybeRetry(payload, {
    leadDeliveryId: "501",
    plan,
  });

  assert.equal(result, "abandoned");
  assert.equal(plan.status, "abandoned");
  assert.deepEqual(queued, []);
});

test("non-retryable failure updates delivery state without enqueueing another job", async () => {
  const queued = [];
  const plan = planRetryableLeadDeliveryFailure({
    attempts: 0,
    backoffMs: leadDeliveryBackoffMs,
    failure: new LeadDeliveryFailure({
      deliveryCertainty: "not_delivered",
      redactedMessage: "Telegram lead delivery failed.",
      retryable: false,
      safeCode: "telegram_rejected",
    }),
    now,
  });
  const payload = {
    jobs: {
      async queue(args) {
        queued.push(args);
      },
    },
    async update() {
      return { docs: [{ id: "501" }] };
    },
  };

  const result = await recordLeadDeliveryFailureAndMaybeRetry(payload, {
    leadDeliveryId: "501",
    plan,
  });

  assert.equal(result, "failed");
  assert.deepEqual(queued, []);
});
