#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

const NOINDEX = "noindex, nofollow";

function parsePublicOrigin(value, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    fail(`${label} must be a valid URL.`);
  }
  if (url.protocol !== "https:" || url.pathname !== "/" || url.search || url.hash) {
    fail(`${label} must be an exact HTTPS origin.`);
  }
  if (/^(?:localhost|127\.0\.0\.1|\[::1\])$/iu.test(url.hostname)) fail(`${label} must not use loopback.`);
  return url.origin;
}

function fail(message) {
  throw new Error(message);
}

export function parseArguments(argv) {
  const values = new Map();
  for (const option of argv) {
    const match = /^--([a-z-]+)=(.*)$/u.exec(option);
    if (!match) fail(`Unsupported argument: ${option}`);
    if (values.has(match[1])) fail(`Duplicate argument: --${match[1]}`);
    values.set(match[1], match[2]);
  }

  const allowed = new Set(["base-url", "published-slug", "draft-slug", "expected-title", "phase"]);
  for (const key of values.keys()) if (!allowed.has(key)) fail(`Unsupported argument: --${key}`);

  const baseUrl = values.get("base-url") ?? "";
  const publishedSlug = values.get("published-slug") ?? "";
  const draftSlug = values.get("draft-slug") ?? "";
  const expectedTitle = values.get("expected-title") ?? "";
  const phase = values.get("phase") ?? "";
  const publicOrigin = parsePublicOrigin(baseUrl, "--base-url");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(publishedSlug)) fail("--published-slug is invalid.");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(draftSlug)) fail("--draft-slug is invalid.");
  if (!expectedTitle.trim()) fail("--expected-title is required.");
  if (!new Set(["before-restart", "after-restart"]).has(phase)) fail("--phase is invalid.");
  return { baseUrl: publicOrigin, publishedSlug, draftSlug, expectedTitle, phase };
}

export function resolveTransportBaseUrl(source = process.env) {
  const value = source.DB_SMOKE_TRANSPORT_BASE_URL;
  if (!value) return parsePublicOrigin(source.NEXT_PUBLIC_SERVER_URL ?? "", "NEXT_PUBLIC_SERVER_URL");
  if (!/^http:\/\/127\.0\.0\.1:\d{2,5}$/u.test(value)) {
    fail("DB_SMOKE_TRANSPORT_BASE_URL must use loopback HTTP with an explicit port.");
  }
  return value;
}

function assertNoindex(response, label, required) {
  if (!required) return;
  const value = response.headers.get("x-robots-tag") ?? "";
  if (!value.toLowerCase().includes(NOINDEX)) fail(`${label} is missing the preview noindex header.`);
}

async function responseText(response, label, requireNoindex) {
  if (response.status !== 200) fail(`${label} returned HTTP ${response.status}.`);
  assertNoindex(response, label, requireNoindex);
  return response.text();
}

export async function runApplicationSmoke(options, dependencies = {}) {
  const fetchImpl = dependencies.fetchImpl ?? fetch;
  const transportBaseUrl = dependencies.transportBaseUrl
    ?? (process.env.DB_SMOKE_TRANSPORT_BASE_URL ? resolveTransportBaseUrl(process.env) : options.baseUrl);
  const requireNoindex = !/^http:\/\/127\.0\.0\.1:/u.test(transportBaseUrl);
  const ownerEmail = dependencies.ownerEmail ?? process.env.DB_SMOKE_OWNER_EMAIL;
  const ownerPassword = dependencies.ownerPassword ?? process.env.DB_SMOKE_OWNER_PASSWORD;
  if (!ownerEmail || !ownerPassword) fail("DB_SMOKE_OWNER_EMAIL and DB_SMOKE_OWNER_PASSWORD are required.");

  const request = (pathname, init) => fetchImpl(new URL(pathname, `${transportBaseUrl}/`), {
    cache: "no-store",
    redirect: "manual",
    ...init,
  });

  const health = await request("/api/health/");
  const healthBody = await responseText(health, "health", requireNoindex);
  let healthPayload;
  try {
    healthPayload = JSON.parse(healthBody);
  } catch {
    fail("health returned invalid JSON.");
  }
  if (healthPayload?.ok !== true) fail("health payload is not ok.");

  const admin = await request("/admin/");
  await responseText(admin, "admin", requireNoindex);

  const login = await request("/api/users/login/", {
    body: JSON.stringify({ email: ownerEmail, password: ownerPassword }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  if (login.status !== 200) fail(`owner login returned HTTP ${login.status}.`);
  assertNoindex(login, "owner login", requireNoindex);

  const list = await request("/obekty/");
  const listHtml = await responseText(list, "public property list", requireNoindex);
  if (!listHtml.includes(options.expectedTitle) || !listHtml.includes(`/obekty/${options.publishedSlug}/`)) {
    fail("Published proof record is absent from the public list.");
  }

  const detail = await request(`/obekty/${options.publishedSlug}/`);
  const detailHtml = await responseText(detail, "published property detail", requireNoindex);
  if (!detailHtml.includes(options.expectedTitle)) fail("Published proof record is absent from its detail route.");

  const draft = await request(`/obekty/${options.draftSlug}/`);
  if (draft.status !== 404) fail(`Unpublished property route returned HTTP ${draft.status}, expected 404.`);
  assertNoindex(draft, "unpublished property route", requireNoindex);

  return {
    admin: "PASS",
    draftBoundary: "PASS",
    health: "PASS",
    ownerLogin: "PASS",
    phase: options.phase,
    previewNoindex: requireNoindex ? "PASS" : "NOT_APPLICABLE_LOOPBACK",
    publishedDetail: "PASS",
    publishedList: "PASS",
  };
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);
  const result = await runApplicationSmoke(options);
  process.stdout.write(`${JSON.stringify({ verdict: "PASS", ...result })}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch {
    process.stderr.write("single-db-application-smoke: operation failed; details redacted\n");
    process.exitCode = 1;
  }
}
