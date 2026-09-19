import assert from "node:assert/strict";
import test from "node:test";

const baseEnv = {
  AMS_PROFILE: "REALTY_BASE",
  DATABASE_URI: "postgresql://user:pass@127.0.0.1:5432/db",
  JOBS_AUTORUN: "false",
  NEXT_PUBLIC_LEADS_ENABLED: "false",
  NEXT_PUBLIC_SERVER_URL: "http://127.0.0.1:3000",
  PAYLOAD_SECRET: "replace-with-at-least-32-random-characters",
  TZ: "Europe/Moscow",
};

const s3Env = {
  S3_ACCESS_KEY: "access-key",
  S3_BUCKET: "moreigory-media",
  S3_ENDPOINT: "https://s3.twcstorage.ru",
  S3_REGION: "ru-1",
  S3_SECRET_KEY: "secret-key",
};

Object.assign(process.env, baseEnv);

const { isProductionRuntimeProfile, parseProjectEnv } = await import("../src/project/env.ts");

test("local and build profiles may omit S3", () => {
  assert.equal(isProductionRuntimeProfile(baseEnv), false);
  assert.doesNotThrow(() => parseProjectEnv(baseEnv));
  assert.doesNotThrow(() =>
    parseProjectEnv({ ...baseEnv, NODE_ENV: "production", NEXT_PHASE: "phase-production-build" }),
  );
  assert.doesNotThrow(() => parseProjectEnv({ ...baseEnv, NODE_ENV: "production", VERIFY_RUNTIME: "1" }));
});

test("production runtime fail-fast requires the full S3 contract", () => {
  assert.equal(isProductionRuntimeProfile({ NODE_ENV: "production" }), true);
  assert.throws(
    () => parseProjectEnv({ ...baseEnv, NODE_ENV: "production" }),
    /S3_ENDPOINT is required in the production profile/,
  );
  assert.doesNotThrow(() => parseProjectEnv({ ...baseEnv, NODE_ENV: "production", ...s3Env }));
});
