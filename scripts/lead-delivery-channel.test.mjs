import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  createTelegramLeadDeliveryChannel,
  LeadDeliveryFailure,
  redactLeadOutboundUrl,
  unknownLeadDeliveryFailure,
} from "../src/core/leads/delivery.ts";

const decoder = new TextDecoder();
const source = readFileSync(new URL("../src/core/leads/delivery.ts", import.meta.url), "utf8");

const payload = {
  consent: {
    acceptedAt: "2026-09-17T10:00:00.000Z",
    version: "consent-v1",
  },
  deliveryId: 10,
  idempotencyKey: "lead:1:channel:telegram",
  lead: {
    email: "client@example.com",
    message: "Хочу подобрать курортную недвижимость под понятную инвестиционную задачу.",
    name: "Ольга",
    phone: "+7 900 000-00-00",
    sourcePath: "/podbor/",
  },
  leadId: 1,
};

function outboundClient(response) {
  const requests = [];

  return {
    client: {
      async request(request) {
        requests.push(request);
        return response;
      },
    },
    requests,
  };
}

test("telegram delivery channel sends through Safe Outbound Client", async () => {
  const outbound = outboundClient({
    body: new TextEncoder().encode(JSON.stringify({ ok: true, result: { message_id: 42 } })),
    contentType: "application/json",
    status: 200,
  });
  const channel = createTelegramLeadDeliveryChannel({
    botToken: "123456:secret-token",
    chatId: "-100123456",
    outbound: outbound.client,
  });

  const result = await channel.deliver(payload);

  assert.deepEqual(result, {
    classification: "sent",
    deliveryCertainty: "delivered",
    externalRef: "telegram:42",
  });
  assert.equal(outbound.requests.length, 1);

  const request = outbound.requests[0];
  assert.equal(request.method, "POST");
  assert.equal(request.url.protocol, "https:");
  assert.equal(request.url.hostname, "api.telegram.org");
  assert.match(request.url.pathname, /^\/bot[^/]+\/sendMessage$/);
  assert.equal(request.headers["content-type"], "application/json");

  const body = JSON.parse(decoder.decode(request.body));
  assert.equal(body.chat_id, "-100123456");
  assert.equal(body.disable_web_page_preview, true);
  assert.match(body.text, /Ольга/);
  assert.match(body.text, /\+7 900 000-00-00/);
  assert.match(body.text, /Delivery ID: 10/);
  assert.match(body.text, /Lead ID: 1/);
});

test("telegram delivery failures expose only redacted operational details", async () => {
  const outbound = outboundClient({
    body: new TextEncoder().encode(JSON.stringify({ ok: false, description: "chat not found" })),
    contentType: "application/json",
    status: 400,
  });
  const channel = createTelegramLeadDeliveryChannel({
    botToken: "123456:secret-token",
    chatId: "-100123456",
    outbound: outbound.client,
  });

  await assert.rejects(
    () => channel.deliver(payload),
    (error) => {
      assert.ok(error instanceof LeadDeliveryFailure);
      assert.equal(error.retryable, false);
      assert.equal(error.safeCode, "telegram_rejected");
      assert.equal(error.deliveryCertainty, "not-delivered");
      assert.equal(error.classification, "permanent");
      assert.equal(error.redactedMessage.includes("secret-token"), false);
      assert.equal(error.redactedMessage.includes("-100123456"), false);
      assert.equal(error.redactedMessage.includes(payload.lead.phone), false);
      assert.equal(error.redactedMessage.includes(payload.lead.email), false);
      return true;
    },
  );
});

test("lead delivery implementation does not bypass outbound or env layers", () => {
  assert.equal(source.includes("fetch("), false);
  assert.equal(source.includes("process.env"), false);
});

test("outbound URL logs redact secrets deterministically", () => {
  const url = new URL("https://user:token@api.telegram.org/bot123456:secret-token/sendMessage?timeout=1");
  assert.equal(redactLeadOutboundUrl(url), "https://api.telegram.org/bot[redacted]/sendMessage");
});

test("unknown timeout stays retryable and is never treated as sent", async () => {
  const policy = unknownLeadDeliveryFailure("channel_timeout", "Lead delivery failed before remote confirmation.");
  assert.equal(policy.deliveryCertainty, "unknown");
  assert.equal(policy.retryable, true);
  assert.equal(policy.possibleDuplicate, true);
  assert.equal(policy.classification, "retryable");

  const channel = createTelegramLeadDeliveryChannel({
    botToken: "123456:secret-token",
    chatId: "-100123456",
    outbound: {
      async request() {
        throw new Error("aborted");
      },
    },
  });

  await assert.rejects(
    () => channel.deliver(payload),
    (error) => {
      assert.ok(error instanceof LeadDeliveryFailure);
      assert.equal(error.deliveryCertainty, "unknown");
      assert.equal(error.retryable, true);
      assert.equal(error.possibleDuplicate, true);
      assert.notEqual(error.deliveryCertainty, "delivered");
      return true;
    },
  );
});
