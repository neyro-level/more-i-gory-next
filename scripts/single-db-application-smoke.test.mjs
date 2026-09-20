import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  parseArguments,
  runApplicationSmoke,
} from "../ops/runtime/single-db-application-smoke.mjs";

const options = {
  baseUrl: "https://more-previu.tw1.ru",
  draftSlug: "db-proof-draft",
  expectedTitle: "Техническая проверка DB",
  phase: "before-restart",
  publishedSlug: "db-proof-published",
};

function response(body, status = 200, headers = { "x-robots-tag": "noindex, nofollow" }) {
  return new Response(body, { headers, status });
}

function passingFetch(overrides = {}) {
  return async (url, init = {}) => {
    const pathname = url.pathname;
    if (pathname in overrides) return overrides[pathname];
    if (pathname === "/api/health") return response(JSON.stringify({ ok: true }));
    if (pathname === "/admin") return response("Payload Admin");
    if (pathname === "/api/users/login" && init.method === "POST") return response(JSON.stringify({ user: { role: "owner" } }));
    if (pathname === "/obekty/") return response(`<a href="/obekty/${options.publishedSlug}/">${options.expectedTitle}</a>`);
    if (pathname === `/obekty/${options.publishedSlug}/`) return response(`<h1>${options.expectedTitle}</h1>`);
    if (pathname === `/obekty/${options.draftSlug}/`) return response("Not found", 404);
    return response("Not found", 404);
  };
}

test("smoke is pinned to the technical preview and an explicit restart phase", () => {
  assert.deepEqual(
    parseArguments([
      `--base-url=${options.baseUrl}`,
      `--published-slug=${options.publishedSlug}`,
      `--draft-slug=${options.draftSlug}`,
      `--expected-title=${options.expectedTitle}`,
      "--phase=before-restart",
    ]),
    options,
  );
  assert.throws(() => parseArguments(["--base-url=https://moreigori.ru"]), /must be/);
  assert.equal(
    parseArguments([
      `--base-url=${options.baseUrl}`,
      `--published-slug=${options.publishedSlug}`,
      `--draft-slug=${options.draftSlug}`,
      `--expected-title=${options.expectedTitle}`,
      "--phase=after-restart",
    ]).phase,
    "after-restart",
  );
});

test("Payload keeps committed migrations as the only schema path", () => {
  const config = readFileSync(new URL("../payload.config.ts", import.meta.url), "utf8");
  assert.match(config, /migrationDir:/);
  assert.match(config, /push:\s*false/);
  assert.doesNotMatch(config, /push:\s*true/);
});

test("smoke proves owner login, Admin, public list/detail and unpublished 404", async () => {
  const result = await runApplicationSmoke(options, {
    fetchImpl: passingFetch(),
    ownerEmail: "owner@example.invalid",
    ownerPassword: "fixture-password",
  });
  assert.deepEqual(result, {
    admin: "PASS",
    draftBoundary: "PASS",
    health: "PASS",
    ownerLogin: "PASS",
    phase: "before-restart",
    publishedDetail: "PASS",
    publishedList: "PASS",
  });
});

test("smoke fails closed on login, publication boundary and noindex drift", async () => {
  const loginFailure = passingFetch({
    "/api/users/login": response("Unauthorized", 401),
  });
  await assert.rejects(
    () => runApplicationSmoke(options, { fetchImpl: loginFailure, ownerEmail: "x", ownerPassword: "y" }),
    /owner login/,
  );

  const publishedDraft = async (url, init) => {
    if (url.pathname === `/obekty/${options.draftSlug}/`) return response("Visible draft", 200);
    return passingFetch()(url, init);
  };
  await assert.rejects(
    () => runApplicationSmoke(options, { fetchImpl: publishedDraft, ownerEmail: "x", ownerPassword: "y" }),
    /expected 404/,
  );

  const missingNoindex = async (url, init) => {
    if (url.pathname === "/api/health") return response(JSON.stringify({ ok: true }), 200, {});
    return passingFetch()(url, init);
  };
  await assert.rejects(
    () => runApplicationSmoke(options, { fetchImpl: missingNoindex, ownerEmail: "x", ownerPassword: "y" }),
    /noindex/,
  );
});
