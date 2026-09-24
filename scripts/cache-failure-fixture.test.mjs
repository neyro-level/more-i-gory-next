import assert from "node:assert/strict";
import test from "node:test";

import {
  PublicReadOperationalError,
  publicReadOrThrow,
} from "../src/core/data-access/public/read-fallback.ts";

test("temporary DB failure is never cached as an empty successful read", async () => {
  let attempts = 0;
  let cached;
  const load = async () => {
    if (cached !== undefined) return cached;
    const result = await publicReadOrThrow({
      logger: { error() {} },
      reader: "cache-failure-fixture",
      read: async () => {
        attempts += 1;
        if (attempts === 1) throw new Error("temporary database outage");
        return [{ id: "existing-entity" }];
      },
    });
    cached = result;
    return result;
  };

  await assert.rejects(load, PublicReadOperationalError);
  assert.equal(cached, undefined);
  assert.deepEqual(await load(), [{ id: "existing-entity" }]);
  assert.deepEqual(await load(), [{ id: "existing-entity" }]);
  assert.equal(attempts, 2);
});
