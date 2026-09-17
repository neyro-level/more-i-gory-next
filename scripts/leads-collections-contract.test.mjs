import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { LeadDeliveries } from "../src/project/collections/lead-deliveries.ts";
import { Leads } from "../src/project/collections/leads.ts";

function field(collection, name) {
  return collection.fields.find((candidate) => candidate.name === name);
}

function fieldNames(collection) {
  return collection.fields.map((candidate) => candidate.name);
}

function optionValues(collection, name) {
  return field(collection, name).options.map((option) => option.value);
}

function anonymousAccess(collection, action) {
  return collection.access[action]({ req: {} });
}

test("leads collection keeps PII owner-only and models consent explicitly", () => {
  assert.equal(Leads.slug, "leads");
  assert.deepEqual(fieldNames(Leads), [
    "status",
    "retentionStatus",
    "name",
    "phone",
    "email",
    "message",
    "sourcePath",
    "formId",
    "consent",
    "utm",
    "metadata",
    "piiAnonymizedAt",
    "historyPurgeAt",
  ]);
  assert.deepEqual(optionValues(Leads, "status"), ["new", "processing", "closed", "spam"]);
  assert.deepEqual(optionValues(Leads, "retentionStatus"), ["active", "pii_anonymized"]);
  assert.equal(field(Leads, "retentionStatus").defaultValue, "active");
  assert.equal(field(Leads, "historyPurgeAt").index, true);
  assert.deepEqual(field(Leads, "consent").fields.map((candidate) => candidate.name), [
    "accepted",
    "version",
    "acceptedAt",
  ]);
  assert.equal(anonymousAccess(Leads, "create"), false);
  assert.equal(anonymousAccess(Leads, "read"), false);
  assert.equal(anonymousAccess(Leads, "update"), false);
  assert.equal(anonymousAccess(Leads, "delete"), false);
});

test("lead-deliveries collection exposes the approved transactional outbox fields", () => {
  assert.equal(LeadDeliveries.slug, "lead-deliveries");
  assert.deepEqual(fieldNames(LeadDeliveries), [
    "lead",
    "channelId",
    "status",
    "attempts",
    "nextAttemptAt",
    "idempotencyKey",
    "externalRef",
    "lastErrorRedacted",
    "claimedAt",
    "heartbeatAt",
    "manualRetryAudit",
    "attemptLog",
  ]);
  assert.equal(field(LeadDeliveries, "lead").relationTo, "leads");
  assert.deepEqual(optionValues(LeadDeliveries, "status"), [
    "pending",
    "sending",
    "sent",
    "failed",
    "abandoned",
  ]);
  assert.equal(field(LeadDeliveries, "idempotencyKey").unique, true);
  assert.equal(field(LeadDeliveries, "attempts").defaultValue, 0);
  assert.match(field(LeadDeliveries, "attempts").validate(1.5), /integer/);
  assert.deepEqual(field(LeadDeliveries, "attemptLog").fields.map((candidate) => candidate.name), [
    "attemptedAt",
    "outcome",
    "safeCode",
    "redactedMessage",
  ]);
  assert.deepEqual(field(LeadDeliveries, "manualRetryAudit").fields.map((candidate) => candidate.name), [
    "requestedAt",
    "actorRef",
    "reasonRedacted",
  ]);
  assert.equal(field(LeadDeliveries, "manualRetryAudit").maxRows, 20);
  assert.equal(anonymousAccess(LeadDeliveries, "create"), false);
  assert.equal(anonymousAccess(LeadDeliveries, "read"), false);
  assert.equal(anonymousAccess(LeadDeliveries, "update"), false);
  assert.equal(anonymousAccess(LeadDeliveries, "delete"), false);
});

test("lead collections are registered before delivery and before catalog collections", () => {
  const payloadConfig = fs.readFileSync("payload.config.ts", "utf8");
  const collectionsBlock = payloadConfig.slice(payloadConfig.indexOf("collections: ["), payloadConfig.indexOf("  ],", payloadConfig.indexOf("collections: [")));

  for (const name of ["Leads", "LeadDeliveries", "Properties"]) {
    assert.ok(collectionsBlock.includes(name), `${name} must be registered in payload.config.ts`);
  }
  assert.ok(collectionsBlock.indexOf("Leads") < collectionsBlock.indexOf("LeadDeliveries"));
  assert.ok(collectionsBlock.indexOf("LeadDeliveries") < collectionsBlock.indexOf("Properties"));
});
