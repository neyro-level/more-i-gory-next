import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  assertLocalApiInventory,
  classifyLocalApiPath,
  formatLocalApiInventoryMarkdown,
  scanLocalApiCalls,
} from "./lib/payload-local-api-inventory.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const normalizeLineEndings = (value) => value.replaceAll("\r\n", "\n");

test("path classifier distinguishes System Gateway owners from orchestration", () => {
  assert.equal(classifyLocalApiPath("src/core/data-access/public/pages.ts"), "PUBLIC GATEWAY");
  assert.equal(classifyLocalApiPath("src/seo/sitemap-source.ts"), "PUBLIC GATEWAY");
  assert.equal(classifyLocalApiPath("src/core/data-access/system/create-lead.ts"), "SYSTEM GATEWAY");
  assert.equal(classifyLocalApiPath("scripts/seed-regions.mjs"), "ORCHESTRATION");
  assert.equal(classifyLocalApiPath("src/project/jobs/imports/dispatch-due-feeds.ts"), "SYSTEM GATEWAY");
  assert.equal(classifyLocalApiPath("src/project/leads/owner-retry.ts"), "SYSTEM GATEWAY");
  assert.equal(classifyLocalApiPath("src/project/collections/redirects.ts"), "CMS ADMIN");
  assert.equal(classifyLocalApiPath("migrations/20260917.ts"), "MIGRATION");
  assert.equal(classifyLocalApiPath("scripts/jobs-config.test.mjs"), "TEST");
  assert.equal(classifyLocalApiPath("src/app/(site)/page.tsx"), null);
});

test("every live Payload Local API call has an allowed class and matches the inventory doc", () => {
  const calls = assertLocalApiInventory(scanLocalApiCalls(projectRoot));
  assert.ok(calls.length > 0);
  const markdown = readFileSync(path.join(projectRoot, "docs/research/payload-local-api-inventory.md"), "utf8");
  assert.equal(
    normalizeLineEndings(markdown),
    normalizeLineEndings(formatLocalApiInventoryMarkdown(calls)),
  );

  for (const required of ["PUBLIC GATEWAY", "SYSTEM GATEWAY", "CMS ADMIN", "ORCHESTRATION", "TEST"]) {
    assert.ok(
      calls.some((call) => call.class === required),
      `inventory must include ${required}`,
    );
  }
});
