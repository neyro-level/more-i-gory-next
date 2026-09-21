import assert from "node:assert/strict";
import test from "node:test";

import { handlePublicLeadRequest } from "../src/core/leads/intake-endpoint.ts";

const now = Date.parse("2026-09-17T09:00:00.000Z");

function payload(overrides = {}) {
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
    ...overrides,
  };
}

function request(body, init = {}) {
  const method = init.method ?? "POST";
  return new Request("https://moreigori.ru/api/public/leads", {
    body: method === "GET" || method === "HEAD" ? undefined : JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.10",
      ...init.headers,
    },
    method,
  });
}

function logger() {
  return {
    error() {},
    info() {},
    warn() {},
  };
}

test("public lead endpoint validates and creates a lead without returning PII", async () => {
  let received;
  const response = await handlePublicLeadRequest(
    request(payload(), { headers: { "x-moreigory-client-ip": "203.0.113.10" } }),
    {
      activeChannelIds: ["telegram"],
      consentVersion: "consent-v1",
      createLead: async (input) => {
        received = input;
        return { id: 1 };
      },
      enabled: true,
      logger: logger(),
      now: () => now,
      store: new Map(),
    },
  );

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(received.name, "Ольга");
  assert.equal(received.phone, "+7 900 000-00-00");
  assert.deepEqual(received.activeChannelIds, ["telegram"]);
  assert.equal(received.consent.version, "consent-v1");
  assert.equal(received.consent.acceptedAt, "2026-09-17T09:00:00.000Z");
  assert.deepEqual(received.metadata, { requester: "present" });
});

test("public lead endpoint is fail-closed while leads are disabled", async () => {
  let called = false;
  const response = await handlePublicLeadRequest(request(payload()), {
    consentVersion: "consent-v1",
    createLead: async () => {
      called = true;
      return { id: 1 };
    },
    enabled: false,
    logger: logger(),
    now: () => now,
    store: new Map(),
  });

  assert.equal(response.status, 503);
  assert.equal(called, false);
});

test("public lead endpoint rejects honeypot and too-fast submissions", async () => {
  const config = {
    consentVersion: "consent-v1",
    createLead: async () => ({ id: 1 }),
    enabled: true,
    logger: logger(),
    now: () => now,
    store: new Map(),
  };

  assert.equal((await handlePublicLeadRequest(request(payload({ honeypot: "company" })), config)).status, 400);
  assert.equal(
    (await handlePublicLeadRequest(request(payload({ formStartedAt: "2026-09-17T08:59:59.000Z" })), config)).status,
    400,
  );
});

test("public lead endpoint rate limits by requester key", async () => {
  const store = new Map();
  const config = {
    consentVersion: "consent-v1",
    createLead: async () => ({ id: 1 }),
    enabled: true,
    logger: logger(),
    now: () => now,
    rateLimit: { maxRequests: 1, windowMs: 60_000 },
    store,
  };

  assert.equal((await handlePublicLeadRequest(request(payload()), config)).status, 201);
  assert.equal((await handlePublicLeadRequest(request(payload()), config)).status, 429);
});

test("spoofed public forwarding headers cannot select a different rate-limit bucket", async () => {
  const store = new Map();
  const config = {
    consentVersion: "consent-v1",
    createLead: async () => ({ id: 1 }),
    enabled: true,
    logger: logger(),
    now: () => now,
    rateLimit: { maxRequests: 1, windowMs: 60_000 },
    store,
  };

  const first = request(payload(), {
    headers: {
      forwarded: "for=198.51.100.1",
      "x-forwarded-for": "198.51.100.1",
      "x-real-ip": "198.51.100.1",
    },
  });
  const spoofed = request(payload(), {
    headers: {
      forwarded: "for=198.51.100.2",
      "x-forwarded-for": "198.51.100.2",
      "x-real-ip": "198.51.100.2",
    },
  });

  assert.equal((await handlePublicLeadRequest(first, config)).status, 201);
  assert.equal((await handlePublicLeadRequest(spoofed, config)).status, 429);
  assert.deepEqual([...store.keys()], ["unknown"]);
});

test("trusted Nginx client header selects a validated IP bucket", async () => {
  const store = new Map();
  const config = {
    consentVersion: "consent-v1",
    createLead: async () => ({ id: 1 }),
    enabled: true,
    logger: logger(),
    now: () => now,
    rateLimit: { maxRequests: 1, windowMs: 60_000 },
    store,
  };

  assert.equal(
    (
      await handlePublicLeadRequest(
        request(payload(), { headers: { "x-moreigory-client-ip": "203.0.113.10" } }),
        config,
      )
    ).status,
    201,
  );
  assert.deepEqual([...store.keys()], ["203.0.113.10"]);
});

test("public lead endpoint rejects unsafe source paths and non-POST methods", async () => {
  const config = {
    consentVersion: "consent-v1",
    createLead: async () => ({ id: 1 }),
    enabled: true,
    logger: logger(),
    now: () => now,
    store: new Map(),
  };

  assert.equal((await handlePublicLeadRequest(request(payload({ sourcePath: "//evil" })), config)).status, 400);
  assert.equal(
    (
      await handlePublicLeadRequest(
        request(payload({ consent: { ...payload().consent, version: "stale-version" } })),
        config,
      )
    ).status,
    400,
  );
  assert.equal((await handlePublicLeadRequest(request(payload(), { method: "GET" }), config)).status, 405);
});
