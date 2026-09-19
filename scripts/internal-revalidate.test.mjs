import assert from "node:assert/strict";
import test from "node:test";

import { handleInternalRevalidateRequest } from "../src/core/cache/revalidate-endpoint.ts";

const secret = "12345678901234567890123456789012";
const validBody = {
  targets: [
    { kind: "tag", tag: "navigation" },
    { kind: "path", path: "/obekty/example/" },
  ],
};

function createLogger() {
  const entries = [];
  return {
    entries,
    logger: {
      error: (message, context) => entries.push({ level: "error", message, context }),
      info: (message, context) => entries.push({ level: "info", message, context }),
      warn: (message, context) => entries.push({ level: "warn", message, context }),
    },
  };
}

function createRequest({
  body = validBody,
  headers = { authorization: `Bearer ${secret}` },
  method = "POST",
} = {}) {
  return new Request("https://moreigori.ru/api/internal/revalidate", {
    body: body === null ? undefined : JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    method,
  });
}

function createConfig(overrides = {}) {
  const calls = [];
  const { entries, logger } = createLogger();
  return {
    calls,
    entries,
    config: {
      invalidator: {
        invalidate: async (targets) => {
          calls.push(targets);
        },
      },
      logger,
      rateLimit: { maxRequests: 2, windowMs: 60_000 },
      secret,
      store: new Map(),
      ...overrides,
    },
  };
}

test("internal revalidate is POST only", async () => {
  const { config, calls } = createConfig();
  const response = await handleInternalRevalidateRequest(createRequest({ method: "GET", body: null }), config);

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("allow"), "POST");
  assert.equal(calls.length, 0);
});

test("internal revalidate rejects missing or invalid secrets without leaking them", async () => {
  const { config, calls, entries } = createConfig();
  const response = await handleInternalRevalidateRequest(
    createRequest({ headers: { authorization: "Bearer wrong-secret" } }),
    config,
  );
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.deepEqual(body, { error: "unauthorized" });
  assert.equal(calls.length, 0);
  assert.equal(JSON.stringify(entries).includes("wrong-secret"), false);
});

test("internal revalidate applies the target allowlist", async () => {
  const { config, calls } = createConfig();
  const response = await handleInternalRevalidateRequest(
    createRequest({ body: { targets: [{ kind: "path", path: "https://example.com/" }] } }),
    config,
  );

  assert.equal(response.status, 400);
  assert.equal(calls.length, 0);
});

test("internal revalidate rejects internal route targets", async () => {
  const { config, calls } = createConfig();
  const response = await handleInternalRevalidateRequest(
    createRequest({ body: { targets: [{ kind: "path", path: "/api/internal/revalidate/" }] } }),
    config,
  );

  assert.equal(response.status, 400);
  assert.equal(calls.length, 0);
});

test("internal revalidate accepts ingest catalog, complex and novostroyki targets", async () => {
  const { config, calls } = createConfig();
  const targets = [
    { kind: "tag", tag: "catalog" },
    { kind: "tag", tag: "complex:sample-complex" },
    { kind: "tag", tag: "catalog-slice:krym" },
    { kind: "path", path: "/novostroyki/sample-complex/" },
  ];
  const response = await handleInternalRevalidateRequest(
    createRequest({ body: { targets } }),
    config,
  );
  assert.equal(response.status, 200);
  assert.deepEqual(calls, [targets]);
});

test("internal revalidate accepts developer, properties and zastroyshchik CMS targets", async () => {
  const { config, calls } = createConfig();
  const targets = [
    { kind: "tag", tag: "developers" },
    { kind: "tag", tag: "developer:sample-developer" },
    { kind: "tag", tag: "properties" },
    { kind: "tag", tag: "sitemap" },
    { kind: "tag", tag: "page" },
    { kind: "path", path: "/zastroyshchik/sample-developer/" },
  ];
  const response = await handleInternalRevalidateRequest(
    createRequest({ body: { targets } }),
    config,
  );
  assert.equal(response.status, 200);
  assert.deepEqual(calls, [targets]);
});

test("internal revalidate accepts nested approved region tags", async () => {
  const { config, calls } = createConfig();
  const response = await handleInternalRevalidateRequest(
    createRequest({ body: { targets: [{ kind: "tag", tag: "region:krym:yalta" }] } }),
    config,
  );

  assert.equal(response.status, 200);
  assert.deepEqual(calls, [[{ kind: "tag", tag: "region:krym:yalta" }]]);
});

test("internal revalidate rate limits repeated calls by requester", async () => {
  const { config } = createConfig();
  const headers = { authorization: `Bearer ${secret}`, "x-forwarded-for": "192.0.2.10" };

  assert.equal((await handleInternalRevalidateRequest(createRequest({ headers }), config)).status, 200);
  assert.equal((await handleInternalRevalidateRequest(createRequest({ headers }), config)).status, 200);
  assert.equal((await handleInternalRevalidateRequest(createRequest({ headers }), config)).status, 429);
});

test("internal revalidate sends one approved batch to the invalidator", async () => {
  const { config, calls, entries } = createConfig();
  const response = await handleInternalRevalidateRequest(createRequest(), config);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { revalidated: true, targetCount: 2 });
  assert.deepEqual(calls, [validBody.targets]);
  assert.deepEqual(entries.at(-1), {
    level: "info",
    message: "internal revalidate completed",
    context: { targetCount: 2 },
  });
});
