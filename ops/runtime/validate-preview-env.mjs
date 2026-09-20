import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const REQUIRED = [
  "AMS_PROFILE",
  "TZ",
  "AMS_RUNTIME_CONTOUR",
  "JOBS_AUTORUN",
  "NEXT_PUBLIC_LEADS_ENABLED",
  "DATABASE_URI",
  "PAYLOAD_SECRET",
  "NEXT_PUBLIC_SERVER_URL",
  "CACHE_INVALIDATION_MODE",
  "REVALIDATE_SECRET",
  "INTERNAL_REVALIDATE_BASE_URL",
  "S3_ENDPOINT",
  "S3_REGION",
  "S3_BUCKET",
  "S3_ACCESS_KEY",
  "S3_SECRET_KEY",
  "S3_MEDIA_PREFIX",
];

const EXPECTED = new Map([
  ["AMS_PROFILE", "REALTY_BASE"],
  ["TZ", "Europe/Moscow"],
  ["AMS_RUNTIME_CONTOUR", "staging"],
  ["JOBS_AUTORUN", "false"],
  ["NEXT_PUBLIC_LEADS_ENABLED", "false"],
  ["NEXT_PUBLIC_SERVER_URL", "https://more-previu.tw1.ru"],
  ["CACHE_INVALIDATION_MODE", "http"],
  ["INTERNAL_REVALIDATE_BASE_URL", "http://127.0.0.1:3000"],
  ["S3_ENDPOINT", "https://s3.twcstorage.ru"],
  ["S3_REGION", "ru-1"],
  ["S3_BUCKET", "moreigory-media"],
  ["S3_MEDIA_PREFIX", "staging/media"],
]);

function fail(message) {
  throw new Error(`preview env contract failed: ${message}`);
}

export function validatePreviewEnv(raw) {
  if (raw.includes("\r")) fail("file must use LF line endings");

  const values = new Map();
  for (const sourceLine of raw.split("\n")) {
    const line = sourceLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) fail("invalid assignment line");
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1);
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) fail("invalid variable name");
    if (values.has(key)) fail(`duplicate key ${key}`);
    values.set(key, value);
  }

  for (const key of REQUIRED) {
    if (!values.get(key)) fail(`missing key ${key}`);
  }
  for (const [key, expected] of EXPECTED) {
    if (values.get(key) !== expected) fail(`unexpected value for ${key}`);
  }
  if (!/^(postgresql|postgres):\/\//.test(values.get("DATABASE_URI") ?? "")) {
    fail("DATABASE_URI must be a PostgreSQL URL");
  }
  for (const key of ["PAYLOAD_SECRET", "REVALIDATE_SECRET"]) {
    if ((values.get(key)?.length ?? 0) < 32) fail(`${key} must contain at least 32 characters`);
  }
  for (const key of ["S3_ACCESS_KEY", "S3_SECRET_KEY"]) {
    if (!values.get(key)) fail(`missing key ${key}`);
  }

  for (const key of values.keys()) {
    if (
      key === "DATABASE_URL" ||
      key === "MOREIGORY_STAGING_DATABASE_URL" ||
      key.includes("TURNSTILE") ||
      key.includes("CAPTCHA")
    ) {
      fail(`forbidden key ${key}`);
    }
  }

  return { keyCount: values.size };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const path = process.argv[2] ?? "/etc/moreigory/app.env";
  const result = validatePreviewEnv(readFileSync(path, "utf8"));
  console.log(`preview env contract PASS (${result.keyCount} keys; values redacted)`);
}
