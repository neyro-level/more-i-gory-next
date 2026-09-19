import assert from "node:assert/strict";
import test from "node:test";

import { retryAbandonedLeadDelivery } from "../src/core/data-access/system/lead-delivery.ts";
import { summarizeLeadDeliveryAdminState } from "../src/core/leads/delivery-alerts.ts";

test("manual retry returns an abandoned delivery to pending with compact audit", async () => {
  const updates = [];
  const queued = [];
  const priorAudit = Array.from({ length: 25 }, (_, index) => ({
    actorRef: "owner",
    reasonRedacted: "Previous manual retry.",
    requestedAt: new Date(Date.UTC(2026, 8, 17, 10, 0, index)).toISOString(),
  }));
  const payload = {
    async findByID(args) {
      assert.deepEqual(args, {
        collection: "lead-deliveries",
        depth: 0,
        id: "501",
        overrideAccess: true,
      });
      return {
        id: "501",
        manualRetryAudit: priorAudit,
        status: "abandoned",
      };
    },
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
  const now = new Date("2026-09-17T12:00:00.000Z");

  assert.equal(
    await retryAbandonedLeadDelivery(payload, {
      actorRef: "owner",
      leadDeliveryId: "501",
      reasonRedacted: "Operator requested manual retry after outage recovery.",
    }, now),
    true,
  );

  assert.equal(updates[0].data.manualRetryAudit.length, 20);
  assert.deepEqual(updates[0].data.manualRetryAudit.at(-1), {
    actorRef: "owner",
    reasonRedacted: "Operator requested manual retry after outage recovery.",
    requestedAt: "2026-09-17T12:00:00.000Z",
  });
  assert.deepEqual(updates[0].data, {
    claimedAt: null,
    heartbeatAt: null,
    lastErrorRedacted: null,
    manualRetryAudit: updates[0].data.manualRetryAudit,
    nextAttemptAt: "2026-09-17T12:00:00.000Z",
    status: "pending",
  });
  assert.deepEqual(queued[0], {
    input: { leadDeliveryId: "501" },
    overrideAccess: true,
    queue: "lead-deliveries",
    task: "deliverLead",
    waitUntil: now,
  });
  assert.equal(JSON.stringify(updates).includes("+7 900"), false);
  assert.equal(JSON.stringify(updates).includes("client@example.com"), false);
});

test("manual retry ignores non-abandoned deliveries", async () => {
  let updateCalls = 0;
  const payload = {
    async findByID() {
      return { id: "501", status: "failed" };
    },
    async update() {
      updateCalls += 1;
      return { docs: [{ id: "501" }] };
    },
  };

  assert.equal(await retryAbandonedLeadDelivery(payload, { actorRef: "owner", leadDeliveryId: "501" }), false);
  assert.equal(updateCalls, 0);
});

test("admin delivery summary emits aggregate alerts only", () => {
  const summary = summarizeLeadDeliveryAdminState(
    {
      abandoned: 2,
      failed: 7,
      pending: 31,
      sending: 1,
      delivered: 20,
    },
    {
      abandoned: 1,
      backlog: 30,
      failureRatio: 0.2,
      outageFailures: 5,
    },
  );

  assert.equal(summary.perLeadAlerts, false);
  assert.deepEqual(summary.statuses, {
    abandoned: 2,
    failed: 7,
    pending: 31,
    sending: 1,
    delivered: 20,
  });
  assert.deepEqual(summary.alerts.map((alert) => alert.kind), [
    "failure_ratio",
    "abandoned",
    "outage",
    "backlog",
  ]);
  assert.equal(JSON.stringify(summary).includes("leadId"), false);
});

test("owner retry endpoint is registered and owner-only", async () => {
  const { LeadDeliveries } = await import("../src/project/collections/lead-deliveries.ts");
  const { handleOwnerRetryAbandonedLeadDelivery } = await import("../src/project/leads/owner-retry.ts");
  assert.equal(LeadDeliveries.endpoints?.[0]?.path, "/:id/retry");
  assert.equal(LeadDeliveries.endpoints?.[0]?.method, "post");
  assert.match(LeadDeliveries.admin.description ?? "", /\/api\/lead-deliveries\/:id\/retry/);

  const forbidden = await handleOwnerRetryAbandonedLeadDelivery({
    payload: {},
    routeParams: { id: "501" },
    user: { collection: "users", role: "editor" },
  });
  assert.equal(forbidden.status, 403);

  let retried = false;
  const payload = {
    async findByID() {
      return { id: "501", status: "abandoned", manualRetryAudit: [] };
    },
    jobs: {
      async queue() {
        retried = true;
      },
    },
    async update() {
      return { docs: [{ id: "501" }] };
    },
  };
  const ok = await handleOwnerRetryAbandonedLeadDelivery({
    payload,
    routeParams: { id: "501" },
    user: { collection: "users", id: 3, role: "owner" },
    async json() {
      return { reasonRedacted: "Recovered after outage." };
    },
  });
  assert.equal(ok.status, 200);
  assert.deepEqual(await ok.json(), { ok: true, status: "pending" });
  assert.equal(retried, true);
});

test("admin schema represents historical delivered rows without inventing a delivery timestamp", async () => {
  const { LeadDeliveries } = await import("../src/project/collections/lead-deliveries.ts");
  const deliveredAt = LeadDeliveries.fields.find((candidate) => "name" in candidate && candidate.name === "deliveredAt");
  assert.equal(deliveredAt?.type, "date");
  assert.equal(deliveredAt?.required, undefined);
  assert.match(deliveredAt?.admin?.description ?? "", /historical deliveries.*unknown/i);
});
