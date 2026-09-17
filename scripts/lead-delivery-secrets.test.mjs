import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { deliverLeadTask } from "../src/project/jobs/leads/deliver-lead.ts";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const createLeadSource = read("src/core/data-access/system/create-lead.ts");
const deliverySource = read("src/core/leads/delivery.ts");
const deliveryTaskSource = read("src/project/jobs/leads/deliver-lead.ts");
const envSource = read("src/project/env.ts");

test("lead delivery job input carries only leadDeliveryId", () => {
  assert.deepEqual(deliverLeadTask.inputSchema.map((field) => field.name), ["leadDeliveryId"]);
  assert.match(createLeadSource, /input:\s*\{\s*leadDeliveryId: String\(leadDeliveryId\)\s*\}/);
  assert.doesNotMatch(createLeadSource, /input:\s*\{[^}]*(?:name|phone|email|message|botToken|chatId)/s);
});

test("delivery code does not read secrets or environment directly", () => {
  for (const source of [deliverySource, deliveryTaskSource]) {
    assert.equal(source.includes("process.env"), false);
    assert.equal(source.includes("TELEGRAM_BOT_TOKEN"), false);
    assert.equal(source.includes("TELEGRAM_CHAT_ID"), false);
  }
});

test("telegram credentials are declared only in the project env layer", () => {
  assert.match(envSource, /TELEGRAM_BOT_TOKEN:\s*optionalNonEmpty/);
  assert.match(envSource, /TELEGRAM_CHAT_ID:\s*optionalNonEmpty/);
  assert.match(envSource, /leadChannels\.includes\("telegram"\)/);
  assert.match(envSource, /\["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"\]/);
});
