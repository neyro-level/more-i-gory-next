import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  cacheTargets,
  createCacheInvalidationBatch,
  createCacheInvalidator,
  invalidateAfterCommit,
} from "../src/core/cache/invalidator.ts";

const targets = [
  { kind: "tag", tag: "catalog" },
  { kind: "path", path: "/obekty/example/" },
  { kind: "path", path: "/krym/", type: "layout" },
];

test("invalidator loads next/cache lazily only in the approved branch", async () => {
  const source = await readFile(
    new URL("../src/core/cache/invalidator.ts", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /(?:import|export)\s+[^;\n]*from\s+["']next\/cache["']/);
  assert.match(source, /await import\(["']next\/cache["']\)/);

  let loaded = 0;
  const invalidator = createCacheInvalidator({
    branch: "approved-route-handler",
    loadNextCache: async () => {
      loaded += 1;
      return { revalidatePath() {}, revalidateTag() {} };
    },
  });

  assert.equal(loaded, 0);
  await invalidator.invalidate([]);
  assert.equal(loaded, 0);
  await invalidator.invalidate(targets);
  assert.equal(loaded, 1);
});

test("HTTP invalidation sends one deduplicated batch", async () => {
  const batches = [];
  const invalidator = createCacheInvalidator({
    branch: "http",
    invalidateBatch: async (batch) => batches.push(batch),
  });

  await invalidator.invalidate([...targets, targets[0], targets[1]]);

  assert.equal(batches.length, 1);
  assert.deepEqual(batches[0], targets);
});

test("approved branch uses Next 16 tag profile and path API", async () => {
  const calls = [];
  const invalidator = createCacheInvalidator({
    branch: "approved-route-handler",
    loadNextCache: async () => ({
      revalidatePath: (path, type) => calls.push(["path", path, type]),
      revalidateTag: (tag, profile) => calls.push(["tag", tag, profile]),
    }),
  });

  await invalidator.invalidate(targets);

  assert.deepEqual(calls, [
    ["tag", "catalog", "max"],
    ["path", "/obekty/example/", undefined],
    ["path", "/krym/", "layout"],
  ]);
});

test("invalidation errors propagate to the caller", async () => {
  const failure = new Error("cache unavailable");
  const invalidator = createCacheInvalidator({
    branch: "http",
    invalidateBatch: async () => {
      throw failure;
    },
  });

  await assert.rejects(
    () => invalidator.invalidate(targets),
    (error) => error === failure,
  );
});

test("typed cache targets map approved domain changes to paths and tags", () => {
  assert.deepEqual(cacheTargets.catalogGroup(), [
    { kind: "tag", tag: "catalog" },
    { kind: "path", path: "/obekty/" },
  ]);
  assert.deepEqual(cacheTargets.propertyPage("sample-resort"), [
    { kind: "tag", tag: "property:sample-resort" },
    { kind: "path", path: "/obekty/sample-resort/" },
    { kind: "tag", tag: "catalog" },
    { kind: "path", path: "/obekty/" },
  ]);
  assert.deepEqual(cacheTargets.regionPage("krym"), [
    { kind: "tag", tag: "region:krym" },
    { kind: "path", path: "/investicionnaya-nedvizhimost/krym/" },
    { kind: "tag", tag: "navigation" },
  ]);
  assert.deepEqual(cacheTargets.regionPage("krym/yalta"), [
    { kind: "tag", tag: "region:krym:yalta" },
    { kind: "path", path: "/investicionnaya-nedvizhimost/krym/yalta/" },
    { kind: "tag", tag: "navigation" },
  ]);
  assert.deepEqual(cacheTargets.pageDoc("privacy"), [
    { kind: "tag", tag: "page:privacy" },
    { kind: "path", path: "/privacy/" },
  ]);
  assert.deepEqual(cacheTargets.navigation(), [{ kind: "tag", tag: "navigation" }]);
  assert.deepEqual(cacheTargets.siteSettings(), [
    { kind: "tag", tag: "site-settings" },
    { kind: "tag", tag: "navigation" },
  ]);
});

test("typed cache targets are combined into one deduplicated batch", async () => {
  const batches = [];
  const invalidator = createCacheInvalidator({
    branch: "http",
    invalidateBatch: async (batch) => batches.push(batch),
  });
  const batch = createCacheInvalidationBatch(
    cacheTargets.propertyPage("sample-resort"),
    cacheTargets.catalogGroup(),
    cacheTargets.navigation(),
  );

  await invalidator.invalidate(batch);

  assert.equal(batches.length, 1);
  assert.deepEqual(batches[0], [
    { kind: "tag", tag: "property:sample-resort" },
    { kind: "path", path: "/obekty/sample-resort/" },
    { kind: "tag", tag: "catalog" },
    { kind: "path", path: "/obekty/" },
    { kind: "tag", tag: "navigation" },
  ]);
});

test("typed cache targets reject unsafe slugs", () => {
  assert.throws(() => cacheTargets.propertyPage("../secret"));
  assert.throws(() => cacheTargets.regionPage("krym?draft=true"));
  assert.throws(() => cacheTargets.pageDoc("https://example.com"));
});

test("post-commit invalidation records operational issues without throwing", async () => {
  const logs = [];
  const targets = cacheTargets.navigation();
  const result = await invalidateAfterCommit({
    invalidator: createCacheInvalidator({
      branch: "http",
      invalidateBatch: async () => {
        throw new Error("network unavailable");
      },
    }),
    logger: {
      error: (message, context) => logs.push({ level: "error", message, context }),
      info: (message, context) => logs.push({ level: "info", message, context }),
    },
    targets,
  });

  assert.deepEqual(result, {
    issue: { code: "cache_invalidation_failed", targetCount: 1 },
    status: "operational-issue",
  });
  assert.deepEqual(logs, [
    {
      level: "error",
      message: "cache invalidation operational issue",
      context: { code: "cache_invalidation_failed", targetCount: 1 },
    },
  ]);
});

test("post-commit invalidation reports success after one batch", async () => {
  const batches = [];
  const logs = [];
  const targets = createCacheInvalidationBatch(cacheTargets.siteSettings(), cacheTargets.navigation());
  const result = await invalidateAfterCommit({
    invalidator: createCacheInvalidator({
      branch: "http",
      invalidateBatch: async (batch) => batches.push(batch),
    }),
    logger: {
      error: (message, context) => logs.push({ level: "error", message, context }),
      info: (message, context) => logs.push({ level: "info", message, context }),
    },
    targets,
  });

  assert.deepEqual(result, { status: "ok", targetCount: 2 });
  assert.equal(batches.length, 1);
  assert.deepEqual(logs, [
    {
      level: "info",
      message: "cache invalidation completed",
      context: { targetCount: 2 },
    },
  ]);
});
