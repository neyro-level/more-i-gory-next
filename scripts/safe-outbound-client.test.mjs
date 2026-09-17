import assert from "node:assert/strict";
import test from "node:test";

import {
  createSafeOutboundClient,
  SafeOutboundRequestError,
} from "../src/core/security/outbound-http/index.ts";

const encoder = new TextEncoder();
const baseRequest = {
  maxResponseBytes: 1024,
  timeoutMs: 500,
  url: new URL("https://api.telegram.org/botx/sendMessage"),
};

function client(overrides = {}) {
  return createSafeOutboundClient({
    allowedHosts: ["api.telegram.org"],
    fetchImpl: async () => new Response(encoder.encode("ok"), {
      headers: { "content-type": "text/plain" },
      status: 200,
    }),
    resolveHostAddresses: async () => ["149.154.167.220"],
    ...overrides,
  });
}

async function rejectsWithSafeCode(action, safeCode) {
  await assert.rejects(
    action,
    (error) => {
      assert.ok(error instanceof SafeOutboundRequestError);
      assert.equal(error.safeCode, safeCode);
      return true;
    },
  );
}

test("safe outbound client allows explicit HTTPS allowlisted hosts", async () => {
  const response = await client().request(baseRequest);

  assert.equal(response.status, 200);
  assert.equal(response.contentType, "text/plain");
  assert.equal(new TextDecoder().decode(response.body), "ok");
});

test("safe outbound client rejects non-HTTPS and non-allowlisted hosts", async () => {
  await rejectsWithSafeCode(
    () => client().request({ ...baseRequest, url: new URL("http://api.telegram.org/botx/sendMessage") }),
    "outbound_non_https",
  );

  await rejectsWithSafeCode(
    () => client().request({ ...baseRequest, url: new URL("https://example.com/") }),
    "outbound_host_not_allowed",
  );
});

test("safe outbound client rejects localhost and private resolved addresses", async () => {
  await rejectsWithSafeCode(
    () => client({ resolveHostAddresses: async () => ["127.0.0.1"] }).request(baseRequest),
    "outbound_address_not_allowed",
  );

  await rejectsWithSafeCode(
    () => client({ resolveHostAddresses: async () => ["10.0.0.10"] }).request(baseRequest),
    "outbound_address_not_allowed",
  );

  await rejectsWithSafeCode(
    () => client({ resolveHostAddresses: async () => ["fe80::1"] }).request(baseRequest),
    "outbound_address_not_allowed",
  );
});

test("safe outbound client re-checks redirects before following them", async () => {
  const outbound = client({
    fetchImpl: async () => new Response(null, {
      headers: { location: "https://example.com/handoff" },
      status: 302,
    }),
  });

  await rejectsWithSafeCode(
    () => outbound.request(baseRequest),
    "outbound_host_not_allowed",
  );
});

test("safe outbound client enforces max response size", async () => {
  const outbound = client({
    fetchImpl: async () => new Response(encoder.encode("too-large")),
  });

  await rejectsWithSafeCode(
    () => outbound.request({ ...baseRequest, maxResponseBytes: 4 }),
    "outbound_response_too_large",
  );
});
