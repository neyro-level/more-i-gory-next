import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { leadRetentionCleanup } from "../src/core/data-access/system/lead-retention.ts";
import {
  leadHistoryPurgeDays,
  leadHistoryRecoveryDays,
  leadRetentionDays,
  planLeadRetentionCleanup,
} from "../src/core/leads/retention.ts";

const now = new Date("2026-09-17T12:00:00.000Z");
const retentionSource = readFileSync(new URL("../src/core/leads/retention.ts", import.meta.url), "utf8");

test("lead retention policy keeps PII for 100 days and recoverable history for 300 total days", () => {
  assert.equal(leadRetentionDays, 100);
  assert.equal(leadHistoryRecoveryDays, 200);
  assert.equal(leadHistoryPurgeDays, 300);

  const plan = planLeadRetentionCleanup(
    [
      {
        createdAt: "2026-06-10T12:00:00.000Z",
        deliveredAt: "2026-01-01T00:00:00.000Z",
        id: "fresh",
        retentionStatus: "active",
      },
      {
        createdAt: "2026-06-09T12:00:00.000Z",
        id: "anonymize",
        retentionStatus: "active",
      },
      {
        createdAt: "2025-11-21T12:00:00.000Z",
        historyPurgeAt: "2026-09-17T12:00:00.000Z",
        id: "purge",
        piiAnonymizedAt: "2026-03-01T12:00:00.000Z",
        retentionStatus: "pii_anonymized",
      },
    ],
    now,
  );

  assert.equal(plan.anonymized, 1);
  assert.equal(plan.purged, 1);
  assert.deepEqual(
    plan.actions.map((action) => [action.id, action.kind]),
    [
      ["anonymize", "anonymize-pii"],
      ["purge", "purge-history"],
    ],
  );

  const anonymizeAction = plan.actions.find((action) => action.kind === "anonymize-pii");
  assert.deepEqual(anonymizeAction?.data, {
    email: null,
    historyPurgeAt: "2027-04-05T12:00:00.000Z",
    message: "Lead PII anonymized by retention policy.",
    metadata: null,
    name: "Anonymized lead",
    phone: "redacted",
    piiAnonymizedAt: now.toISOString(),
    retentionStatus: "pii_anonymized",
    utm: null,
  });
  assert.equal(JSON.stringify(plan).includes("+7 900"), false);
  assert.equal(JSON.stringify(plan).includes("client@example.com"), false);
  assert.doesNotMatch(retentionSource, /deliveredAt/);
});

test("lead retention cleanup anonymizes PII first, then purges lead and deliveries after total retention", async () => {
  const updates = [];
  const deletes = [];
  const payload = {
    async delete(args) {
      deletes.push(args);
      return {};
    },
    async find(args) {
      assert.equal(args.collection, "leads");
      return {
        docs: [
          {
            createdAt: "2026-06-09T12:00:00.000Z",
            id: "anonymize",
            retentionStatus: "active",
          },
          {
            createdAt: "2025-11-21T12:00:00.000Z",
            historyPurgeAt: "2026-09-17T12:00:00.000Z",
            id: "purge",
            retentionStatus: "pii_anonymized",
          },
        ],
      };
    },
    async update(args) {
      updates.push(args);
      return { docs: [{ id: args.where.and[0].id.equals }] };
    },
  };

  assert.deepEqual(await leadRetentionCleanup(payload, now), {
    anonymized: 1,
    purged: 1,
  });

  assert.equal(updates.length, 1);
  assert.equal(updates[0].collection, "leads");
  assert.equal(updates[0].overrideAccess, true);
  assert.equal(updates[0].data.retentionStatus, "pii_anonymized");
  assert.equal(updates[0].data.name, "Anonymized lead");
  assert.equal(updates[0].data.phone, "redacted");
  assert.deepEqual(
    deletes.map((entry) => [entry.collection, entry.where]),
    [
      ["lead-deliveries", { lead: { equals: "purge" } }],
      ["leads", { id: { equals: "purge" } }],
    ],
  );
});
