import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  LeadDeliveryLoadError,
  loadLeadDeliveryForSend,
} from "../src/core/data-access/system/load-lead-delivery.ts";

const source = readFileSync(new URL("../src/core/data-access/system/load-lead-delivery.ts", import.meta.url), "utf8");
const guards = readFileSync(new URL("../scripts/lib/architecture-guards.mjs", import.meta.url), "utf8");
const foundation = readFileSync(new URL("../scripts/verify-foundation.mjs", import.meta.url), "utf8");
const job = readFileSync(new URL("../src/project/jobs/leads/deliver-lead.ts", import.meta.url), "utf8");

test("System Gateway lead-delivery loader is privileged and does not leak raw docs to the job", () => {
  assert.match(guards, /src\/core\/data-access\/system\/load-lead-delivery\.ts/);
  assert.match(foundation, /src\/core\/data-access\/system\/load-lead-delivery\.ts/);
  assert.match(source, /overrideAccess:\s*true/);
  assert.match(job, /loadLeadDeliveryForSend/);
  assert.equal(source.includes("return delivery"), false);
  assert.equal(source.includes("return lead"), false);
});

test("loader returns payload plus retry state without raw Payload documents", async () => {
  const calls = [];
  const payload = {
    async findByID(args) {
      calls.push(args);
      if (args.collection === "lead-deliveries") {
        return {
          attempts: 2,
          attemptLog: [
            {
              attemptedAt: "2026-09-17T11:00:00.000Z",
              deliveryCertainty: "not_delivered",
              outcome: "failed",
              redactedMessage: "telegram_timeout",
              safeCode: "telegram_timeout",
            },
          ],
          channelId: "probe",
          id: 501,
          idempotencyKey: "lead:9:channel:probe",
          lead: 9,
          lastErrorRedacted: "keep-out-of-payload",
          status: "sending",
        };
      }
      return {
        consent: { acceptedAt: new Date("2026-09-17T10:00:00.000Z"), version: "v1" },
        email: "client@example.com",
        id: 9,
        message: "Need a property.",
        name: "Ольга",
        phone: "+7 900 000-00-00",
        sourcePath: "/podbor/",
        status: "new",
      };
    },
  };

  const result = await loadLeadDeliveryForSend(payload, { leadDeliveryId: "501" });

  assert.deepEqual(calls, [
    { collection: "lead-deliveries", depth: 0, id: "501", overrideAccess: true },
    { collection: "leads", depth: 0, id: 9, overrideAccess: true },
  ]);
  assert.deepEqual(result, {
    attemptLog: [
      {
        attemptedAt: "2026-09-17T11:00:00.000Z",
        deliveryCertainty: "not_delivered",
        outcome: "failed",
        redactedMessage: "telegram_timeout",
        safeCode: "telegram_timeout",
      },
    ],
    attempts: 2,
    channelId: "probe",
    payload: {
      consent: { acceptedAt: "2026-09-17T10:00:00.000Z", version: "v1" },
      deliveryId: 501,
      idempotencyKey: "lead:9:channel:probe",
      lead: {
        email: "client@example.com",
        message: "Need a property.",
        name: "Ольга",
        phone: "+7 900 000-00-00",
        sourcePath: "/podbor/",
      },
      leadId: 9,
    },
  });
  assert.equal("status" in result, false);
  assert.equal("lastErrorRedacted" in result, false);
});

test("missing delivery returns null; missing lead fails closed", async () => {
  assert.equal(
    await loadLeadDeliveryForSend(
      {
        async findByID() {
          return null;
        },
      },
      { leadDeliveryId: "404" },
    ),
    null,
  );

  await assert.rejects(
    () =>
      loadLeadDeliveryForSend(
        {
          async findByID(args) {
            if (args.collection === "lead-deliveries") {
              return { attempts: 0, channelId: "probe", id: 1, idempotencyKey: "k", lead: 2 };
            }
            return null;
          },
        },
        { leadDeliveryId: "1" },
      ),
    (error) => {
      assert.ok(error instanceof LeadDeliveryLoadError);
      assert.equal(error.safeCode, "lead_missing");
      return true;
    },
  );
});
