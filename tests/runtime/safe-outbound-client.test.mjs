import assert from "node:assert/strict";
import test from "node:test";

import {
  createPinnedLookup,
  createSafeOutboundClient,
  pickPinnedAddress,
  SafeOutboundRequestError,
} from "../../src/core/security/outbound-http/index.ts";

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
  assert.equal(response.etag, null);
  assert.equal(response.lastModified, null);
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

test("303 converts any method to GET without a body", async () => {
  const calls = [];
  const outbound = client({
    fetchImpl: async (url, init) => {
      calls.push({ method: init.method, hasBody: Boolean(init.body), href: String(url) });
      if (calls.length === 1) {
        return new Response(null, {
          headers: { location: "https://api.telegram.org/follow" },
          status: 303,
        });
      }
      return new Response(encoder.encode("ok"), { status: 200 });
    },
  });

  await outbound.request({
    ...baseRequest,
    body: encoder.encode("payload"),
    method: "POST",
  });

  assert.equal(calls[0].method, "POST");
  assert.equal(calls[0].hasBody, true);
  assert.equal(calls[1].method, "GET");
  assert.equal(calls[1].hasBody, false);
});

test("301 and 302 convert non-GET to GET without a body", async () => {
  const calls = [];
  const outbound = client({
    fetchImpl: async (url, init) => {
      calls.push({ method: init.method, hasBody: Boolean(init.body) });
      if (calls.length === 1) {
        return new Response(null, {
          headers: { location: "https://api.telegram.org/follow" },
          status: 302,
        });
      }
      return new Response(encoder.encode("ok"), { status: 200 });
    },
  });

  await outbound.request({
    ...baseRequest,
    body: encoder.encode("payload"),
    method: "POST",
  });

  assert.equal(calls[1].method, "GET");
  assert.equal(calls[1].hasBody, false);
});

test("307 and 308 preserve method and body when policy allows", async () => {
  const calls = [];
  const outbound = client({
    fetchImpl: async (url, init) => {
      calls.push({ method: init.method, hasBody: Boolean(init.body) });
      if (calls.length === 1) {
        return new Response(null, {
          headers: { location: "https://api.telegram.org/follow" },
          status: 307,
        });
      }
      return new Response(encoder.encode("ok"), { status: 200 });
    },
  });

  await outbound.request({
    ...baseRequest,
    body: encoder.encode("payload"),
    method: "POST",
  });

  assert.equal(calls[1].method, "POST");
  assert.equal(calls[1].hasBody, true);
});

test("cross-host redirects drop auth-like headers and re-check host plus IP", async () => {
  const resolved = [];
  const calls = [];
  const outbound = client({
    allowedHosts: ["api.telegram.org", "core.telegram.org"],
    resolveHostAddresses: async (hostname) => {
      resolved.push(hostname);
      return hostname === "core.telegram.org" ? ["149.154.167.221"] : ["149.154.167.220"];
    },
    fetchImpl: async (url, init) => {
      calls.push({
        href: String(url),
        authorization: init.headers?.authorization ?? init.headers?.Authorization,
        contentType: init.headers?.["content-type"] ?? init.headers?.["Content-Type"],
      });
      if (calls.length === 1) {
        return new Response(null, {
          headers: { location: "https://core.telegram.org/follow" },
          status: 307,
        });
      }
      return new Response(encoder.encode("ok"), { status: 200 });
    },
  });

  await outbound.request({
    ...baseRequest,
    body: encoder.encode("payload"),
    headers: {
      authorization: "Bearer secret",
      "content-type": "application/json",
    },
    method: "POST",
  });

  assert.equal(calls[0].authorization, "Bearer secret");
  assert.equal(calls[1].authorization, undefined);
  assert.equal(calls[1].contentType, "application/json");
  assert.deepEqual(resolved, ["api.telegram.org", "core.telegram.org"]);
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

test("oversized Content-Length rejects before the response body is read", async () => {
  let pulls = 0;
  let cancelled = false;
  const body = new ReadableStream({
    cancel() {
      cancelled = true;
    },
    pull(controller) {
      pulls += 1;
      controller.enqueue(encoder.encode("too-large"));
      controller.close();
    },
  });
  const outbound = client({
    fetchImpl: async () => new Response(body, { headers: { "content-length": "9" } }),
  });

  await rejectsWithSafeCode(
    () => outbound.requestStream({ ...baseRequest, maxResponseBytes: 4 }),
    "outbound_response_too_large",
  );
  assert.equal(cancelled, true);
  assert.equal(pulls <= 1, true);
});

test("chunked oversized bodies abort before the remaining body is produced", async () => {
  let produced = 0;
  let producedBytes = 0;
  let cancelled = false;
  const chunks = [encoder.encode("abc"), encoder.encode("def"), encoder.encode("ghi")];
  const fullBodyBytes = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
  const body = new ReadableStream({
    cancel() {
      cancelled = true;
    },
    pull(controller) {
      const chunk = chunks[produced];
      produced += 1;
      if (chunk) {
        producedBytes += chunk.byteLength;
        controller.enqueue(chunk);
      }
      else controller.close();
    },
  }, { highWaterMark: 0 });
  const outbound = client({ fetchImpl: async () => new Response(body) });

  await rejectsWithSafeCode(
    () => outbound.request({ ...baseRequest, maxResponseBytes: 4 }),
    "outbound_response_too_large",
  );
  assert.equal(cancelled, true);
  assert.equal(produced, 2);
  assert.ok(producedBytes <= 4 + chunks[0].byteLength, "reader must be bounded to the limit plus one transport chunk");
  assert.ok(producedBytes < fullBodyBytes, "producer must be cancelled before the full body is emitted");
});

test("the exact response limit succeeds", async () => {
  const outbound = client({ fetchImpl: async () => new Response(encoder.encode("four")) });
  const response = await outbound.request({ ...baseRequest, maxResponseBytes: 4 });
  assert.equal(new TextDecoder().decode(response.body), "four");
});

test("requestStream exposes bounded chunks without using the buffered helper", async () => {
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("ab"));
      controller.enqueue(encoder.encode("cd"));
      controller.close();
    },
  });
  const response = await client({ fetchImpl: async () => new Response(body) })
    .requestStream({ ...baseRequest, maxResponseBytes: 4 });
  const chunks = [];
  for await (const chunk of response.body) chunks.push(new TextDecoder().decode(chunk));
  assert.deepEqual(chunks, ["ab", "cd"]);
});

test("timeout remains active while a response body is streaming", async () => {
  let cancelled = false;
  let completed = false;
  let producedBytes = 0;
  const body = new ReadableStream({
    cancel() {
      cancelled = true;
    },
    async pull(controller) {
      await new Promise((resolve) => setTimeout(resolve, 80));
      const chunk = encoder.encode("late");
      producedBytes += chunk.byteLength;
      controller.enqueue(chunk);
      completed = true;
      controller.close();
    },
  }, { highWaterMark: 0 });
  const outbound = client({ fetchImpl: async () => new Response(body) });

  await rejectsWithSafeCode(
    () => outbound.request({ ...baseRequest, timeoutMs: 20 }),
    "outbound_request_timeout",
  );
  assert.equal(cancelled, true);
  assert.equal(completed, false);
  assert.equal(producedBytes, 0);
});

test("DNS lookup is pinned to the address already validated as public", async () => {
  assert.deepEqual(pickPinnedAddress(["149.154.167.220", "2a00:1450:4001:81b::200e"]), {
    address: "149.154.167.220",
    family: 4,
  });

  const lookup = createPinnedLookup(["149.154.167.220"]);
  const pinned = await new Promise((resolve, reject) => {
    lookup("evil.example", {}, (error, address, family) => {
      if (error) reject(error);
      else resolve({ address, family });
    });
  });
  assert.deepEqual(pinned, { address: "149.154.167.220", family: 4 });

  const outbound = client({
    fetchImpl: async (url) => {
      assert.equal(url.hostname, "api.telegram.org");
      return new Response(encoder.encode("ok"), { status: 200 });
    },
  });

  await outbound.request(baseRequest);
});

test("SSRF matrix allows only HTTPS allowlisted public targets", async () => {
  const allowed = await client().request(baseRequest);
  assert.equal(allowed.status, 200);

  await rejectsWithSafeCode(
    () => client().request({ ...baseRequest, url: new URL("http://api.telegram.org/botx/sendMessage") }),
    "outbound_non_https",
  );
  await rejectsWithSafeCode(
    () => client({ resolveHostAddresses: async () => ["127.0.0.1"] }).request(baseRequest),
    "outbound_address_not_allowed",
  );
  await rejectsWithSafeCode(
    () => client({ resolveHostAddresses: async () => ["10.1.2.3"] }).request(baseRequest),
    "outbound_address_not_allowed",
  );
  await rejectsWithSafeCode(
    () => client({ resolveHostAddresses: async () => ["169.254.1.1"] }).request(baseRequest),
    "outbound_address_not_allowed",
  );
  await rejectsWithSafeCode(
    () => client({ resolveHostAddresses: async () => ["fd12:3456:789a:1::1"] }).request(baseRequest),
    "outbound_address_not_allowed",
  );
  await rejectsWithSafeCode(
    () =>
      client({
        allowedHosts: ["api.telegram.org", "evil.local"],
        fetchImpl: async () =>
          new Response(null, {
            headers: { location: "https://evil.local/private" },
            status: 302,
          }),
        resolveHostAddresses: async (hostname) =>
          hostname === "evil.local" ? ["192.168.0.10"] : ["149.154.167.220"],
      }).request(baseRequest),
    "outbound_address_not_allowed",
  );
  await rejectsWithSafeCode(
    () =>
      client({
        fetchImpl: async () =>
          new Response(null, {
            headers: { location: "https://example.com/handoff" },
            status: 302,
          }),
      }).request(baseRequest),
    "outbound_host_not_allowed",
  );
});
