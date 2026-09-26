import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { Media } from "../../src/project/collections/media.ts";
import {
  createPublicS3ObjectUrl,
  createStoragePlugins,
  isS3StorageConfigured,
  isVpsDiskMediaSourceOfTruth,
} from "../../src/project/storage/s3.ts";
import {
  TIMEWEB_S3_RECOVERY_CONTRACT,
  assertTimewebS3RecoveryContract,
} from "../../src/project/storage/s3-recovery.ts";

const baseEnv = {
  AMS_PROFILE: "REALTY_BASE",
  DATABASE_URI: "postgresql://user:pass@127.0.0.1:5432/db",
  JOBS_AUTORUN: "false",
  NEXT_PUBLIC_LEADS_ENABLED: "false",
  NEXT_PUBLIC_SERVER_URL: "http://127.0.0.1:3000",
  PAYLOAD_SECRET: "replace-with-at-least-32-random-characters",
  TZ: "Europe/Moscow",
};
const fixtureBucket = "project-media-fixture";
const storageMigration = await readFile(
  new URL("../../migrations/20260926_070539_add_s3_storage_fields.ts", import.meta.url),
  "utf8",
);

test("S3 storage adapter stays disabled without S3 env while schema fields remain stable", () => {
  assert.equal(isS3StorageConfigured(baseEnv), false);
  assert.equal(createStoragePlugins(baseEnv).length, 1);
});

test("S3 storage plugin requires the approved env-only contract", () => {
  const env = {
    ...baseEnv,
    S3_ACCESS_KEY: "access-key",
    S3_BUCKET: fixtureBucket,
    S3_ENDPOINT: "https://s3.twcstorage.ru",
    S3_REGION: "ru-1",
    S3_SECRET_KEY: "secret-key",
  };

  assert.equal(isS3StorageConfigured(env), true);
  assert.equal(createStoragePlugins(env).length, 1);
});

test("S3 runtime fields have an additive committed migration", () => {
  assert.match(storageMigration, /ADD COLUMN "prefix" varchar DEFAULT 'staging\/media'/);
  assert.match(storageMigration, /ADD COLUMN "_objectkey" varchar/);
});

test("media upload does not use VPS disk as source of truth", () => {
  assert.equal(Media.upload.disableLocalStorage, true);
  assert.equal(isVpsDiskMediaSourceOfTruth(), false);
  assert.equal(
    createPublicS3ObjectUrl("cover.webp", fixtureBucket),
    `https://s3.twcstorage.ru/${fixtureBucket}/media/cover.webp`,
  );
  assert.equal(createPublicS3ObjectUrl("cover.webp", fixtureBucket).includes("/public/"), false);
  assert.throws(() => createPublicS3ObjectUrl("../../secret", fixtureBucket), /safe relative/);
});

test("Timeweb S3 recovery uses versioning and does not restore from VPS disk", () => {
  assert.doesNotThrow(() => assertTimewebS3RecoveryContract());
  assert.equal(TIMEWEB_S3_RECOVERY_CONTRACT.versioning, "enabled");
  assert.equal(TIMEWEB_S3_RECOVERY_CONTRACT.providerIndependentCopy, "required");
  assert.match(TIMEWEB_S3_RECOVERY_CONTRACT.retention, /30 days/);
  assert.equal(TIMEWEB_S3_RECOVERY_CONTRACT.restoreProcedure.length >= 3, true);
  assert.equal(
    TIMEWEB_S3_RECOVERY_CONTRACT.restoreProcedure.some((step) => /Do not rebuild/i.test(step)),
    true,
  );
});
