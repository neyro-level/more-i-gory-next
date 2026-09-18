import assert from "node:assert/strict";
import test from "node:test";

import { cacheTargets, createCacheInvalidator } from "../src/core/cache/invalidator.ts";
import {
  createInvalidateImportCacheHandler,
  importCacheTargetsFromState,
} from "../src/core/ingest/invalidate-import-cache.ts";

test("import cache targets are one catalog+complex+slice batch", () => {
  assert.deepEqual(
    importCacheTargetsFromState({
      affectedComplexSlugs: ["sample-complex"],
      affectedSliceSlugs: ["krym"],
    }),
    cacheTargets.importAffectedBatch({
      complexSlugs: ["sample-complex"],
      sliceSlugs: ["krym"],
    }),
  );
});

test("invalidate-cache stage sends one post-commit batch and keeps the terminal run status", async () => {
  const batches = [];
  const handler = createInvalidateImportCacheHandler({
    invalidator: createCacheInvalidator({
      branch: "http",
      invalidateBatch: async (batch) => batches.push(batch),
    }),
  });
  const result = await handler({
    state: {
      affectedComplexSlugs: ["sample-complex", "sample-complex"],
      affectedSliceSlugs: ["krym"],
      deactivation: { action: "skip", missingFromFeedCount: 0 },
    },
  });

  assert.deepEqual(result, { continue: false, status: "completed" });
  assert.equal(batches.length, 1);
  assert.ok(batches[0].some((target) => target.kind === "tag" && target.tag === "catalog"));
  assert.ok(batches[0].some((target) => target.kind === "tag" && target.tag === "complex:sample-complex"));
  assert.ok(batches[0].some((target) => target.kind === "path" && target.path === "/investicionnaya-nedvizhimost/krym/"));
});

test("cache invalidation failure does not roll back a completed import", async () => {
  const handler = createInvalidateImportCacheHandler({
    invalidator: createCacheInvalidator({
      branch: "http",
      invalidateBatch: async () => {
        throw new Error("network unavailable");
      },
    }),
  });
  const result = await handler({
    state: { deactivation: { action: "suspicious", missingFromFeedCount: 40 } },
  });
  assert.deepEqual(result, { continue: false, status: "suspicious" });
});
