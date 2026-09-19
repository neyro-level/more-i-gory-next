import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { handlePublicLeadRequest } from "../src/core/leads/intake-endpoint.ts";
import { deliverLead } from "../src/project/jobs/leads/deliver-lead.ts";
import { createFakeLeadDeliveryChannel } from "../src/project/leads/fake-channel.ts";

const routeSource = readFileSync(new URL("../src/app/api/public/leads/route.ts", import.meta.url), "utf8");
const now = Date.parse("2026-09-17T09:00:00.000Z");

function matchWhere(doc, where) {
  if (!where) return true;
  if (where.and) return where.and.every((clause) => matchWhere(doc, clause));
  if (where.or) return where.or.some((clause) => matchWhere(doc, clause));
  const [field, condition] = Object.entries(where)[0];
  if (condition.equals !== undefined) return String(doc[field]) === String(condition.equals);
  if (condition.exists === false) return doc[field] == null;
  if (condition.less_than_equal) return !doc[field] || doc[field] <= condition.less_than_equal;
  return true;
}

function createMemoryPayload() {
  const leads = new Map();
  const deliveries = new Map();
  const queue = [];

  return {
    deliveries,
    leads,
    queue,
    payload: {
      async findByID(args) {
        const store = args.collection === "leads" ? leads : deliveries;
        return store.get(String(args.id)) ?? store.get(Number(args.id)) ?? null;
      },
      async update(args) {
        const docs = [];
        for (const [id, doc] of deliveries) {
          if (!matchWhere(doc, args.where)) continue;
          const next = { ...doc, ...args.data };
          deliveries.set(id, next);
          docs.push(next);
        }
        return { docs };
      },
      jobs: {
        async queue(args) {
          queue.push(args);
          return {};
        },
      },
    },
  };
}

test("route POST /api/public/leads is the public intake entry", () => {
  assert.match(routeSource, /handlePublicLeadRequest/);
  assert.match(routeSource, /createLead/);
  assert.match(routeSource, /export async function POST/);
});

test("Proof G: POST /api/public/leads creates lead, delivery, job and fake delivered+externalRef", async () => {
  const memory = createMemoryPayload();
  let nextLeadId = 9;
  let nextDeliveryId = 501;

  const response = await handlePublicLeadRequest(
    new Request("https://moreigori.ru/api/public/leads", {
      body: JSON.stringify({
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
      }),
      headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.10" },
      method: "POST",
    }),
    {
      activeChannelIds: ["fake"],
      createLead: async (input) => {
        const leadId = nextLeadId++;
        const deliveryId = nextDeliveryId++;
        memory.leads.set(leadId, {
          consent: input.consent,
          email: input.email,
          id: leadId,
          message: input.message,
          name: input.name,
          phone: input.phone,
          sourcePath: input.sourcePath,
        });
        memory.deliveries.set(deliveryId, {
          attempts: 0,
          attemptLog: [],
          channelId: input.activeChannelIds[0],
          id: deliveryId,
          idempotencyKey: `lead:${leadId}:channel:${input.activeChannelIds[0]}`,
          lead: leadId,
          status: "pending",
        });
        await memory.payload.jobs.queue({
          input: { leadDeliveryId: String(deliveryId) },
          overrideAccess: true,
          queue: "lead-deliveries",
          task: "deliverLead",
        });
        return { deliveryIds: [deliveryId], id: leadId, queuedDeliveryIds: [deliveryId] };
      },
      enabled: true,
      logger: { error() {}, info() {}, warn() {} },
      now: () => now,
      store: new Map(),
    },
  );

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(memory.leads.size, 1);
  assert.equal(memory.deliveries.size, 1);
  assert.deepEqual(memory.queue[0].input, { leadDeliveryId: "501" });
  assert.equal(memory.queue[0].task, "deliverLead");

  const status = await deliverLead({
    leadDeliveryId: "501",
    now: new Date("2026-09-17T12:00:00.000Z"),
    payload: memory.payload,
    resolveChannel: () => createFakeLeadDeliveryChannel("success"),
  });

  const delivery = memory.deliveries.get(501);
  assert.equal(status, "delivered");
  assert.equal(delivery.status, "delivered");
  assert.equal(delivery.deliveredAt, "2026-09-17T12:00:00.000Z");
  assert.equal(delivery.externalRef, "fake:1");
});
