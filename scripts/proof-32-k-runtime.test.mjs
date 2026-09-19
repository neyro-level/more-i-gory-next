import assert from "node:assert/strict";
import test from "node:test";

import { handlePublicLeadRequest } from "../src/core/leads/intake-endpoint.ts";
import { createFakeLeadDeliveryChannel } from "../src/project/leads/fake-channel.ts";
import { deliverLead } from "../src/project/jobs/leads/deliver-lead.ts";

const MARKERS = [
  "Ольга",
  "+7 900 000-00-00",
  "Хочу подобрать курортную недвижимость под инвестиционную задачу.",
  "probe@example.test",
  "ZZBOTTOKEN",
  "ZZCHATID",
];

function capturingLogger() {
  const lines = [];
  const push = (level, message, extra) => {
    lines.push(JSON.stringify({ extra, level, message }));
  };
  return {
    error(message, extra) {
      push("error", message, extra);
    },
    info(message, extra) {
      push("info", message, extra);
    },
    lines,
    warn(message, extra) {
      push("warn", message, extra);
    },
  };
}

function leadBody() {
  return {
    consent: {
      accepted: true,
      acceptedAt: "2026-09-17T08:59:59.000Z",
      version: "consent-v1",
    },
    formId: "main-lead",
    formStartedAt: "2026-09-17T08:59:55.000Z",
    message: "Хочу подобрать курортную недвижимость под инвестиционную задачу.",
    name: "Ольга",
    phone: "+7 900 000-00-00",
    sourcePath: "/podbor/",
    utm: {
      utm_source: "direct",
    },
  };
}

function request(body) {
  return new Request("https://moreigori.ru/api/public/leads", {
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.10" },
    method: "POST",
  });
}

function assertNoMarkers(blob) {
  for (const marker of MARKERS) {
    assert.equal(blob.includes(marker), false, marker);
  }
}

test("runtime lead cycle logs contain zero PII markers", async () => {
  const logger = capturingLogger();
  const now = Date.parse("2026-09-17T09:00:00.000Z");

  await handlePublicLeadRequest(request(leadBody()), {
    activeChannelIds: ["fake"],
    createLead: async () => ({ id: 9 }),
    enabled: true,
    logger,
    now: () => now,
    store: new Map(),
  });

  await handlePublicLeadRequest(request(leadBody()), {
    createLead: async () => ({ id: 9 }),
    enabled: false,
    logger,
    now: () => now,
    store: new Map(),
  });

  const updates = [];
  await deliverLead({
    leadDeliveryId: "501",
    logger,
    now: new Date("2026-09-17T12:00:00.000Z"),
    payload: {
      async findByID(args) {
        if (args.collection === "lead-deliveries") {
          return {
            attempts: 0,
            attemptLog: [],
            channelId: "fake",
            id: 501,
            idempotencyKey: "lead:9:channel:fake",
            lead: 9,
          };
        }
        return {
          consent: { acceptedAt: "2026-09-17T10:00:00.000Z", version: "v1" },
          email: "probe@example.test",
          id: 9,
          message: "Хочу подобрать курортную недвижимость под инвестиционную задачу.",
          name: "Ольга",
          phone: "+7 900 000-00-00",
          sourcePath: "/podbor/",
        };
      },
      async update(args) {
        updates.push(args);
        return { docs: [{ id: "501" }] };
      },
    },
    resolveChannel: () => createFakeLeadDeliveryChannel("success"),
  });

  await deliverLead({
    leadDeliveryId: "501",
    logger,
    now: new Date("2026-09-17T12:00:00.000Z"),
    payload: {
      async findByID(args) {
        if (args.collection === "lead-deliveries") {
          return {
            attempts: 0,
            attemptLog: [],
            channelId: "fake",
            id: 501,
            idempotencyKey: "lead:9:channel:fake",
            lead: 9,
          };
        }
        return {
          consent: { acceptedAt: "2026-09-17T10:00:00.000Z", version: "v1" },
          email: "probe@example.test",
          id: 9,
          message: "Хочу подобрать курортную недвижимость под инвестиционную задачу.",
          name: "Ольга",
          phone: "+7 900 000-00-00",
          sourcePath: "/podbor/",
        };
      },
      async update() {
        return { docs: [{ id: "501" }] };
      },
    },
    resolveChannel: () => createFakeLeadDeliveryChannel("500"),
  });

  const blob = logger.lines.join("\n");
  assert.match(blob, /public lead accepted/);
  assert.match(blob, /lead_delivery_outcome/);
  assertNoMarkers(blob);
});
