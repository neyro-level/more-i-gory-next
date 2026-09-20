import assert from "node:assert/strict";
import test from "node:test";

import { validatePreviewEnv } from "../ops/runtime/validate-preview-env.mjs";

const valid = [
  "AMS_PROFILE=REALTY_BASE",
  "TZ=Europe/Moscow",
  "AMS_RUNTIME_CONTOUR=staging",
  "JOBS_AUTORUN=false",
  "NEXT_PUBLIC_LEADS_ENABLED=false",
  "DATABASE_URI=postgresql://user:redacted@example.invalid:5432/default_db",
  "PAYLOAD_SECRET=payload-secret-at-least-32-characters",
  "NEXT_PUBLIC_SERVER_URL=https://more-previu.tw1.ru",
  "CACHE_INVALIDATION_MODE=http",
  "REVALIDATE_SECRET=revalidate-secret-at-least-32-characters",
  "INTERNAL_REVALIDATE_BASE_URL=http://127.0.0.1:3000",
  "S3_ENDPOINT=https://s3.twcstorage.ru",
  "S3_REGION=ru-1",
  "S3_BUCKET=moreigory-media",
  "S3_ACCESS_KEY=redacted-access-key",
  "S3_SECRET_KEY=redacted-secret-key",
  "S3_MEDIA_PREFIX=staging/media",
].join("\n");

test("accepts the complete LF-normalized preview environment", () => {
  assert.deepEqual(validatePreviewEnv(`${valid}\n`), { keyCount: 17 });
});

test("rejects CRLF, stale database aliases and CAPTCHA keys", () => {
  assert.throws(() => validatePreviewEnv(valid.replaceAll("\n", "\r\n")), /LF line endings/);
  assert.throws(() => validatePreviewEnv(`${valid}\nDATABASE_URL=redacted\n`), /forbidden key DATABASE_URL/);
  assert.throws(() => validatePreviewEnv(`${valid}\nTURNSTILE_SECRET_KEY=redacted\n`), /forbidden key TURNSTILE_SECRET_KEY/);
});

test("rejects incomplete revalidation and unsafe contour values", () => {
  assert.throws(
    () => validatePreviewEnv(valid.replace("REVALIDATE_SECRET=revalidate-secret-at-least-32-characters\n", "")),
    /missing key REVALIDATE_SECRET/,
  );
  assert.throws(() => validatePreviewEnv(valid.replace("AMS_RUNTIME_CONTOUR=staging", "AMS_RUNTIME_CONTOUR=production")), /AMS_RUNTIME_CONTOUR/);
  assert.throws(() => validatePreviewEnv(valid.replace("JOBS_AUTORUN=false", "JOBS_AUTORUN=true")), /JOBS_AUTORUN/);
});
