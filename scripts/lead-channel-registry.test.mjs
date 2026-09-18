import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  createLeadChannelRegistry,
  LeadChannelRegistryError,
} from "../src/project/leads/channel-registry.ts";

const source = readFileSync(new URL("../src/project/leads/channel-registry.ts", import.meta.url), "utf8");

test("channel registry lives in the project composition root and reads env only through env.ts", () => {
  assert.match(source, /@\/project\/env/);
  assert.match(source, /parseActiveLeadChannels/);
  assert.match(source, /createSafeOutboundClient/);
  assert.match(source, /LeadDeliveryChannel/);
  assert.equal(source.includes("process.env"), false);
  assert.equal(source.includes("overrideAccess"), false);
});

test("empty LEAD_CHANNELS returns an empty fail-closed registry", () => {
  const registry = createLeadChannelRegistry({ LEAD_CHANNELS: undefined });
  assert.equal(registry.size, 0);
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
