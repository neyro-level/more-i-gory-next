import assert from "node:assert/strict";
import test from "node:test";

import { Media } from "../src/project/collections/media.ts";
import { createStoragePlugins, isS3StorageConfigured } from "../src/project/storage/s3.ts";

const baseEnv = {
  AMS_PROFILE: "REALTY_BASE",
  DATABASE_URI: "postgresql://user:pass@127.0.0.1:5432/db",
  JOBS_AUTORUN: "false",
  NEXT_PUBLIC_LEADS_ENABLED: "false",
  NEXT_PUBLIC_SERVER_URL: "http://127.0.0.1:3000",
  PAYLOAD_SECRET: "replace-with-at-least-32-random-characters",
  TZ: "Europe/Moscow",
};

test("S3 storage plugin is disabled without S3 env", () => {
  assert.equal(isS3StorageConfigured(baseEnv), false);
  assert.deepEqual(createStoragePlugins(baseEnv), []);
});

test("S3 storage plugin requires the approved env-only contract", () => {
  const env = {
    ...baseEnv,
    S3_ACCESS_KEY: "access-key",
    S3_BUCKET: "moreigori-media",
    S3_ENDPOINT: "https://s3.timeweb.cloud",
    S3_REGION: "ru-1",
    S3_SECRET_KEY: "secret-key",
  };

  assert.equal(isS3StorageConfigured(env), true);
  assert.equal(createStoragePlugins(env).length, 1);
});

test("media upload does not use VPS disk as source of truth", () => {
  assert.equal(Media.upload.disableLocalStorage, true);
});
