import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  cacheTargets,
  createCacheInvalidationBatch,
  createCacheInvalidator,
  invalidateAfterCommit,
} from "../src/core/cache/invalidator.ts";
import {
  cmsCacheEntities,
  cmsMutationCacheTargets,
  createCmsMutationInvalidationHook,
} from "../src/core/cache/collection-invalidation.ts";

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
    { kind: "path", path: "/novostroyki/" },
  ]);
  assert.deepEqual(cacheTargets.catalogSlice("krym/novostroyki"), [
    { kind: "tag", tag: "catalog-slice:krym:novostroyki" },
    { kind: "path", path: "/investicionnaya-nedvizhimost/krym/novostroyki/" },
    { kind: "tag", tag: "catalog" },
    { kind: "path", path: "/obekty/" },
    { kind: "path", path: "/novostroyki/" },
  ]);
  assert.deepEqual(cacheTargets.complexPage("sample-complex"), [
    { kind: "tag", tag: "complex:sample-complex" },
    { kind: "path", path: "/novostroyki/sample-complex/" },
    { kind: "tag", tag: "catalog" },
    { kind: "path", path: "/obekty/" },
    { kind: "path", path: "/novostroyki/" },
  ]);
  assert.deepEqual(cacheTargets.propertyPage("sample-resort"), [
    { kind: "tag", tag: "property:sample-resort" },
    { kind: "path", path: "/obekty/sample-resort/" },
    { kind: "tag", tag: "catalog" },
    { kind: "path", path: "/obekty/" },
    { kind: "path", path: "/novostroyki/" },
  ]);
  assert.deepEqual(cacheTargets.regionPage("krym"), [
    { kind: "tag", tag: "region:krym" },
    { kind: "path", path: "/investicionnaya-nedvizhimost/krym/" },
    { kind: "tag", tag: "catalog" },
    { kind: "tag", tag: "sitemap" },
    { kind: "tag", tag: "navigation" },
  ]);
  assert.deepEqual(cacheTargets.regionPage("krym/yalta"), [
    { kind: "tag", tag: "region:krym:yalta" },
    { kind: "path", path: "/investicionnaya-nedvizhimost/krym/yalta/" },
    { kind: "tag", tag: "catalog" },
    { kind: "tag", tag: "sitemap" },
    { kind: "tag", tag: "navigation" },
  ]);
  assert.deepEqual(cacheTargets.pageDoc("privacy"), [
    { kind: "tag", tag: "page:privacy" },
    { kind: "path", path: "/privacy/" },
  ]);
  assert.deepEqual(cacheTargets.developerPage("sample-developer"), [
    { kind: "tag", tag: "developer:sample-developer" },
    { kind: "path", path: "/zastroyshchik/sample-developer/" },
    { kind: "tag", tag: "developers" },
    { kind: "tag", tag: "catalog" },
    { kind: "path", path: "/obekty/" },
    { kind: "path", path: "/novostroyki/" },
  ]);
  assert.deepEqual(cacheTargets.redirects(), [
    { kind: "tag", tag: "redirects" },
    { kind: "tag", tag: "navigation" },
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
    { kind: "path", path: "/novostroyki/" },
    { kind: "tag", tag: "navigation" },
  ]);
});

test("import cache targets cover catalog group, complex pages and affected slices in one batch", async () => {
  const batches = [];
  const invalidator = createCacheInvalidator({
    branch: "http",
    invalidateBatch: async (batch) => batches.push(batch),
  });
  const batch = cacheTargets.importAffectedBatch({
    complexSlugs: ["sample-complex", "sample-complex"],
    sliceSlugs: ["krym/novostroyki"],
  });

  await invalidator.invalidate(batch);

  assert.equal(batches.length, 1);
  assert.deepEqual(batches[0], [
    { kind: "tag", tag: "catalog" },
    { kind: "path", path: "/obekty/" },
    { kind: "path", path: "/novostroyki/" },
    { kind: "tag", tag: "complex:sample-complex" },
    { kind: "path", path: "/novostroyki/sample-complex/" },
    { kind: "tag", tag: "catalog-slice:krym:novostroyki" },
    { kind: "path", path: "/investicionnaya-nedvizhimost/krym/novostroyki/" },
  ]);
});

test("typed cache targets reject unsafe slugs", () => {
  assert.throws(() => cacheTargets.catalogSlice("krym?draft=true"));
  assert.throws(() => cacheTargets.complexPage("sample?draft=true"));
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

test("CMS mutations map to CacheInvalidator targets after commit", () => {
  assert.deepEqual(cmsCacheEntities, [
    "pages",
    "properties",
    "regions",
    "residential-complexes",
    "developers",
    "redirects",
    "site-settings",
    "navigation",
  ]);
  assert.ok(cmsMutationCacheTargets("pages", { slug: "privacy" }).some((target) => target.kind === "tag" && target.tag === "page:privacy"));
  assert.ok(cmsMutationCacheTargets("properties", { slug: "sample-resort" }).some((target) => target.kind === "tag" && target.tag === "properties"));
  assert.ok(cmsMutationCacheTargets("regions", { parent: { slug: "krym" }, slug: "yalta" }).some((target) => target.kind === "path" && target.path === "/investicionnaya-nedvizhimost/krym/yalta/"));
  assert.ok(cmsMutationCacheTargets("residential-complexes", { slug: "sample-complex" }).some((target) => target.kind === "tag" && target.tag === "complex:sample-complex"));
  assert.ok(cmsMutationCacheTargets("developers", { slug: "sample-developer" }).some((target) => target.kind === "path" && target.path === "/zastroyshchik/sample-developer/"));
  assert.ok(cmsMutationCacheTargets("redirects").some((target) => target.kind === "tag" && target.tag === "redirects"));
  assert.ok(cmsMutationCacheTargets("site-settings").some((target) => target.kind === "tag" && target.tag === "site-settings"));
  assert.deepEqual(cmsMutationCacheTargets("navigation"), [{ kind: "tag", tag: "navigation" }]);
});

test("CMS collection hook invalidates after commit and does not throw on cache failure", async () => {
  const batches = [];
  const hook = createCmsMutationInvalidationHook("residential-complexes", {
    invalidator: {
      async invalidate(targets) {
        batches.push(targets);
      },
    },
    logger: { error() {}, info() {} },
  });

  await hook({ doc: { slug: "fresh-complex" } });
  assert.equal(batches.length, 1);
  assert.ok(batches[0].some((target) => target.kind === "tag" && target.tag === "complex:fresh-complex"));

  const logs = [];
  const failingHook = createCmsMutationInvalidationHook("pages", {
    invalidator: {
      async invalidate() {
        throw new Error("revalidate unavailable");
      },
    },
    logger: {
      error: (message, context) => logs.push({ message, context }),
      info() {},
    },
  });
  await failingHook({ doc: { slug: "privacy" } });
  assert.deepEqual(logs, [
    {
      message: "cache invalidation operational issue",
      context: { code: "cache_invalidation_failed", targetCount: 2 },
    },
  ]);
});

test("B2 proof: CMS mutation HTTP-revalidates so the next public request sees fresh data", async () => {
  const secret = "12345678901234567890123456789012";
  const publicByTag = new Map([["complex:fresh-complex", { title: "stale title" }]]);
  const outboundCalls = [];
  const { handleInternalRevalidateRequest } = await import("../src/core/cache/revalidate-endpoint.ts");
  const { createHttpRevalidateInvalidator } = await import("../src/core/cache/http-revalidate-invalidator.ts");

  const httpInvalidator = await createHttpRevalidateInvalidator({
    loadEnv: () => ({
      INTERNAL_REVALIDATE_BASE_URL: "https://more-previu.tw1.ru",
      REVALIDATE_SECRET: secret,
    }),
    outbound: {
      async request(request) {
        outboundCalls.push({ method: request.method, url: String(request.url) });
        const response = await handleInternalRevalidateRequest(
          new Request(request.url, {
            body: request.body,
            headers: request.headers,
            method: request.method,
          }),
          {
            invalidator: {
              async invalidate(targets) {
                for (const target of targets) {
                  if (target.kind === "tag") publicByTag.delete(target.tag);
                }
              },
            },
            logger: { error() {}, info() {}, warn() {} },
            secret,
            store: new Map(),
          },
        );
        return {
          body: new Uint8Array(),
          contentType: "application/json",
          etag: null,
          lastModified: null,
          status: response.status,
        };
      },
    },
  });

  assert.equal(publicByTag.get("complex:fresh-complex")?.title, "stale title");

  const hook = createCmsMutationInvalidationHook("residential-complexes", {
    invalidator: httpInvalidator,
    logger: { error() {}, info() {} },
  });
  await hook({ doc: { slug: "fresh-complex", status: "published", title: "fresh title" } });

  assert.deepEqual(outboundCalls, [
    { method: "POST", url: "https://more-previu.tw1.ru/api/internal/revalidate" },
  ]);
  assert.equal(publicByTag.has("complex:fresh-complex"), false);

  publicByTag.set("complex:fresh-complex", { title: "fresh title" });
  assert.equal(publicByTag.get("complex:fresh-complex")?.title, "fresh title");
});

test("CMS collections and globals wire after-commit CacheInvalidator hooks", async () => {
  const files = [
    "src/project/collections/pages.ts",
    "src/project/collections/properties.ts",
    "src/project/collections/regions.ts",
    "src/project/collections/residential-complexes.ts",
    "src/project/collections/developers.ts",
    "src/project/collections/redirects.ts",
    "src/project/globals/site-settings.ts",
    "src/project/globals/navigation.ts",
  ];
  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.match(source, /createCmsMutationInvalidationHook/);
    assert.match(source, /afterChange/);
  }
});
