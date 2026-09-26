import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { parseActiveLeadChannels } from "../../src/core/leads/channels.ts";

test("active lead channels are parsed from a safe comma-separated env value", () => {
  assert.deepEqual(parseActiveLeadChannels(undefined), []);
  assert.deepEqual(parseActiveLeadChannels("telegram, crm, telegram, BAD_VALUE, tg-2"), [
    "crm",
    "telegram",
    "tg-2",
  ]);
});

test("createLead uses one Payload transaction for lead and pending deliveries", () => {
  const source = fs.readFileSync("src/core/data-access/system/create-lead.ts", "utf8");
  const initIndex = source.indexOf("await initTransaction(req)");
  const leadIndex = source.indexOf('collection: "leads"');
  const deliveryIndex = source.indexOf('collection: "lead-deliveries"');
  const commitIndex = source.indexOf("await commitTransaction(req)");
  const enqueueIndex = source.indexOf("await enqueueLeadDelivery");
  const rollbackIndex = source.indexOf("await killTransaction(req)");

  for (const [label, index] of Object.entries({ initIndex, leadIndex, deliveryIndex, commitIndex, enqueueIndex, rollbackIndex })) {
    assert.notEqual(index, -1, `${label} marker is missing`);
  }

  assert.ok(initIndex < leadIndex, "transaction must start before creating a lead");
  assert.ok(leadIndex < deliveryIndex, "delivery rows must be created after the lead row");
  assert.ok(deliveryIndex < commitIndex, "delivery rows must be committed with the lead");
  assert.ok(commitIndex < enqueueIndex, "enqueue must happen only after commit");
  assert.ok(rollbackIndex > commitIndex, "rollback path must exist in the catch branch");
  assert.match(source, /idempotencyKey:\s*`lead:\$\{lead\.id\}:channel:\$\{channelId\}`/);
  assert.match(source, /retentionStatus:\s*"active"/);
});

test("enqueue failure is logged with a safe code and no PII", () => {
  const source = fs.readFileSync("src/core/data-access/system/create-lead.ts", "utf8");
  assert.match(source, /safeCode:\s*"lead_enqueue_failed"/);
  assert.match(source, /leadDeliveryId:\s*String\(leadDeliveryId\)/);
  assert.match(source, /state:\s*"queue_unavailable"/);
  assert.doesNotMatch(source, /logger\.error\([^)]*phone/);
  assert.doesNotMatch(source, /logger\.error\([^)]*email/);
  assert.doesNotMatch(source, /catch\s*\{\s*return false;\s*\}/);
});
