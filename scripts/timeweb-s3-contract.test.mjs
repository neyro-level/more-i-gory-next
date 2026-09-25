import assert from "node:assert/strict";
import test from "node:test";

import { createS3MediaRemotePatterns } from "../src/project/media/next-image.ts";
import {
  TIMEWEB_S3_CONTRACT,
  assertTimewebS3Compatibility,
  createS3SdkConfig,
  createStoragePlugins,
} from "../src/project/storage/s3.ts";

const env = {
  AMS_PROFILE: "REALTY_BASE",
  DATABASE_URI: "postgresql://user:pass@127.0.0.1:5432/db",
  JOBS_AUTORUN: "false",
  NEXT_PUBLIC_LEADS_ENABLED: "false",
  NEXT_PUBLIC_SERVER_URL: "http://127.0.0.1:3000",
  PAYLOAD_SECRET: "replace-with-at-least-32-random-characters",
  TZ: "Europe/Moscow",
  S3_ACCESS_KEY: "access-key",
  S3_BUCKET: "project-media-fixture",
  S3_ENDPOINT: TIMEWEB_S3_CONTRACT.endpoint,
  S3_REGION: TIMEWEB_S3_CONTRACT.region,
  S3_SECRET_KEY: "secret-key",
};

test("Timeweb S3 uses path-style addressing on the approved endpoint and region", () => {
  assert.doesNotThrow(() => assertTimewebS3Compatibility(env));
  const config = createS3SdkConfig(env);
  assert.equal(config.endpoint, "https://s3.twcstorage.ru");
  assert.equal(config.region, "ru-1");
  assert.equal(config.forcePathStyle, true);
  assert.equal(createStoragePlugins(env).length, 1);
  assert.throws(
    () => assertTimewebS3Compatibility({ ...env, S3_ENDPOINT: "https://s3.timeweb.cloud" }),
    /S3_ENDPOINT must be https:\/\/s3\.twcstorage\.ru/,
  );
});

test("next/image remotePatterns match path-style Timeweb objects", () => {
  assert.deepEqual(
    createS3MediaRemotePatterns({
      S3_BUCKET: env.S3_BUCKET,
      S3_ENDPOINT: TIMEWEB_S3_CONTRACT.endpoint,
    }),
    [
      {
        hostname: TIMEWEB_S3_CONTRACT.hostname,
        pathname: `/${env.S3_BUCKET}/${TIMEWEB_S3_CONTRACT.mediaPrefix}/**`,
        port: "",
        protocol: "https",
      },
      {
        hostname: TIMEWEB_S3_CONTRACT.hostname,
        pathname: `/${env.S3_BUCKET}/${TIMEWEB_S3_CONTRACT.stagingMediaPrefix}/**`,
        port: "",
        protocol: "https",
      },
    ],
  );
});
