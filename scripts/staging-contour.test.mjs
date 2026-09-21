import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { STAGING_CONTOUR, resolveS3MediaPrefix } from "../src/project/runtime-contour.ts";
import { TIMEWEB_S3_CONTRACT, createStoragePlugins } from "../src/project/storage/s3.ts";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("preview contour pins host, single DB, S3 prefix, secret names, noindex and frozen ingest", () => {
  assert.equal(STAGING_CONTOUR.publicHost, "more-previu.tw1.ru");
  assert.equal(STAGING_CONTOUR.databaseName, "default_db");
  assert.equal(STAGING_CONTOUR.s3Prefix, "staging/media");
  assert.equal(STAGING_CONTOUR.s3Bucket, TIMEWEB_S3_CONTRACT.bucket);
  assert.equal(STAGING_CONTOUR.databaseSecretName, "MOREIGORY_DATABASE_URL");
  assert.equal(STAGING_CONTOUR.forbiddenLeadSecretNames.includes("TELEGRAM_BOT_TOKEN"), true);
  assert.equal(STAGING_CONTOUR.jobsAutorun, "false");
  assert.equal(STAGING_CONTOUR.ingest, "frozen");
  assert.equal(resolveS3MediaPrefix({ AMS_RUNTIME_CONTOUR: "staging" }), "staging/media");
  assert.equal(resolveS3MediaPrefix({ AMS_RUNTIME_CONTOUR: "production" }), "media");

  const operations = read("docs/OPERATIONS.md");
  assert.match(operations, /default_db/);
  assert.match(operations, /prefix staging\/media/);
  assert.match(operations, /JOBS_AUTORUN=false/);

  const unit = read("ops/systemd/moreigory.service");
  assert.match(unit, /AMS_RUNTIME_CONTOUR=staging/);
  assert.match(unit, /JOBS_AUTORUN=false/);
  assert.doesNotMatch(unit, /TELEGRAM_BOT_TOKEN=/);

  const nginx = read("ops/nginx/more-previu.tw1.ru.conf");
  assert.match(nginx, /X-Robots-Tag "noindex, nofollow"/);

  assert.doesNotMatch(operations, /ensure-staging-database/);
});

test("staging robots.txt disallows crawlers and does not advertise sitemap", () => {
  const source = read("src/app/robots.ts");
  const runtimeVerifier = read("scripts/verify-runtime.mjs");
  assert.match(source, /resolveRuntimeContour\(\) === "staging"/);
  assert.match(source, /disallow: "\/"/);
  assert.match(runtimeVerifier, /Staging robots\.txt must disallow all crawlers/);
  assert.match(runtimeVerifier, /Staging robots\.txt must not advertise a sitemap/);
});

test("staging S3 plugin writes under staging/media, not the production media prefix", () => {
  const plugins = createStoragePlugins({
    AMS_PROFILE: "REALTY_BASE",
    AMS_RUNTIME_CONTOUR: "staging",
    DATABASE_URI: "postgresql://user:pass@127.0.0.1:5432/default_db",
    JOBS_AUTORUN: "false",
    NEXT_PUBLIC_LEADS_ENABLED: "false",
    NEXT_PUBLIC_SERVER_URL: "https://more-previu.tw1.ru",
    PAYLOAD_SECRET: "replace-with-at-least-32-random-characters",
    TZ: "Europe/Moscow",
    S3_ACCESS_KEY: "access-key",
    S3_BUCKET: "moreigory-media",
    S3_ENDPOINT: "https://s3.twcstorage.ru",
    S3_REGION: "ru-1",
    S3_SECRET_KEY: "secret-key",
  });
  assert.equal(plugins.length, 1);
});
