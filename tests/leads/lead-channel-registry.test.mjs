import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  createLeadChannelRegistry,
  LeadChannelRegistryError,
  registerLeadChannelFactory,
  unregisterLeadChannelFactory,
} from "../../src/project/leads/channel-registry.ts";

const source = readFileSync(new URL("../../src/project/leads/channel-registry.ts", import.meta.url), "utf8");
const envExample = readFileSync(new URL("../../.env.example", import.meta.url), "utf8");
const projectContract = readFileSync(new URL("../../docs/PROJECT.md", import.meta.url), "utf8");

test("channel registry lives in the project composition root and reads env only through env.ts", () => {
  assert.match(source, /@\/project\/env/);
  assert.match(source, /parseActiveLeadChannels/);
  assert.match(source, /createSafeOutboundClient/);
  assert.match(source, /LeadDeliveryChannel/);
  assert.equal(source.includes("process.env"), false);
  assert.equal(source.includes("overrideAccess"), false);
  assert.equal(
    readFileSync(new URL("../../scripts/lib/architecture-guards.mjs", import.meta.url), "utf8").includes(
      "src/project/leads/channel-registry.ts",
    ),
    false,
  );
});

test("empty LEAD_CHANNELS returns an empty fail-closed registry", () => {
  let outboundRequests = 0;
  const registry = createLeadChannelRegistry(
    { LEAD_CHANNELS: undefined },
    {
      async request() {
        outboundRequests += 1;
        throw new Error("outbound must remain disabled");
      },
      async requestStream() {
        outboundRequests += 1;
        throw new Error("outbound must remain disabled");
      },
    },
  );
  assert.equal(registry.size, 0);
  assert.equal(outboundRequests, 0);
});

test("project and env example declare the empty disabled channel contract", () => {
  assert.match(projectContract, /Lead channels \| `LEAD_CHANNELS` \| unset; пустой registry/);
  assert.match(projectContract, /delivery rows\/jobs и внешний outbound не создаются/);
  assert.match(envExample, /Current contract: keep LEAD_CHANNELS unset/);
  assert.doesNotMatch(envExample, /^LEAD_CHANNELS=/m);
  assert.doesNotMatch(envExample, /^LEAD_OUTBOUND_HOSTS=/m);
  assert.doesNotMatch(envExample, /^TELEGRAM_(?:BOT_TOKEN|CHAT_ID)=/m);
});

test("unknown or incomplete active channels fail closed", () => {
  assert.throws(
    () => createLeadChannelRegistry({ LEAD_CHANNELS: "telegram" }),
    (error) => {
      assert.ok(error instanceof LeadChannelRegistryError);
      assert.equal(error.safeCode, "lead_channel_fail_closed");
      assert.match(error.message, /telegram/);
      return true;
    },
  );

  assert.throws(
    () => createLeadChannelRegistry({ LEAD_CHANNELS: "not-a-real-channel" }),
    LeadChannelRegistryError,
  );
});

test("a new channel registers only in the composition root", async () => {
  const job = readFileSync(new URL("../../src/project/jobs/leads/deliver-lead.ts", import.meta.url), "utf8");
  const dataAccess = readFileSync(new URL("../../src/core/data-access/system/create-lead.ts", import.meta.url), "utf8");
  assert.equal(job.includes("registerLeadChannelFactory"), false);
  assert.equal(dataAccess.includes("registerLeadChannelFactory"), false);
  assert.match(job, /createLeadChannelRegistry/);

  registerLeadChannelFactory("probe", () => ({
    id: "probe",
    async deliver() {
      return { classification: "sent", deliveryCertainty: "delivered", externalRef: "probe:1" };
    },
  }));

  try {
    const registry = createLeadChannelRegistry({ LEAD_CHANNELS: "probe" });
    assert.equal(registry.get("probe")?.id, "probe");
    assert.deepEqual(await registry.get("probe")?.deliver({
      consent: { acceptedAt: "2026-09-17T10:00:00.000Z", version: "v1" },
      deliveryId: 1,
      idempotencyKey: "lead:1:channel:probe",
      lead: { message: "task", name: "A", phone: "1", sourcePath: "/" },
      leadId: 1,
    }), {
      classification: "sent",
      deliveryCertainty: "delivered",
      externalRef: "probe:1",
    });
  } finally {
    unregisterLeadChannelFactory("probe");
  }
});
