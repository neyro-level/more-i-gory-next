import assert from "node:assert/strict";
import test from "node:test";
import { extractJWT, headersWithCors } from "payload";
import { createPayloadOriginPolicy } from "../../src/project/security/payload-origin-policy.ts";

const trustedOrigin = "https://preview.example.test";
const foreignOrigin = "https://attacker.example.test";
const baseEnv = {
  AMS_PROFILE: "REALTY_BASE",
  DATABASE_URI: "postgresql://user:pass@127.0.0.1:5432/db",
  JOBS_AUTORUN: "false",
  NEXT_PUBLIC_LEADS_ENABLED: "false",
  NEXT_PUBLIC_SERVER_URL: trustedOrigin,
  PAYLOAD_SECRET: "replace-with-at-least-32-random-characters",
  TZ: "Europe/Moscow",
};

Object.assign(process.env, baseEnv);

const { parseProjectEnv } = await import("../../src/project/env.ts");
const policy = createPayloadOriginPolicy(trustedOrigin);
const payload = {
  config: {
    ...policy,
    auth: { jwtOrder: ["cookie"] },
    cookiePrefix: "payload",
  },
};

function requestHeaders(origin) {
  return new Headers({
    Cookie: "payload-token=signed-session-token",
    Origin: origin,
  });
}

function corsHeaders(origin) {
  return headersWithCors({
    headers: new Headers(),
    req: { headers: requestHeaders(origin), payload },
  });
}

test("Payload origin policy uses one exact env origin without wildcard", () => {
  assert.deepEqual(policy, {
    cors: [trustedOrigin],
    csrf: [trustedOrigin],
    serverURL: trustedOrigin,
  });
  assert.equal(policy.cors.includes("*"), false);
  assert.equal(policy.csrf.includes("*"), false);
});

test("same-origin cookie authentication and credentialed CORS are allowed", () => {
  assert.equal(extractJWT({ headers: requestHeaders(trustedOrigin), payload }), "signed-session-token");

  const headers = corsHeaders(trustedOrigin);
  assert.equal(headers.get("Access-Control-Allow-Origin"), trustedOrigin);
  assert.equal(headers.get("Access-Control-Allow-Credentials"), "true");
});

test("foreign Origin with a cookie is denied", () => {
  assert.equal(extractJWT({ headers: requestHeaders(foreignOrigin), payload }), null);

  const headers = corsHeaders(foreignOrigin);
  assert.equal(headers.has("Access-Control-Allow-Origin"), false);
  assert.equal(headers.has("Access-Control-Allow-Credentials"), false);
});

test("environment rejects non-origin and wildcard server URLs", () => {
  assert.doesNotThrow(() => parseProjectEnv({ ...baseEnv, NEXT_PUBLIC_SERVER_URL: trustedOrigin }));
  for (const invalid of [`${trustedOrigin}/admin`, `${trustedOrigin}/`, `${trustedOrigin}?preview=1`, "*"]) {
    assert.throws(() => parseProjectEnv({ ...baseEnv, NEXT_PUBLIC_SERVER_URL: invalid }), /exact HTTP\(S\) origin/);
  }
});
