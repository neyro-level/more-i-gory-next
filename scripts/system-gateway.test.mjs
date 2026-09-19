import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { z } from "zod";

import {
  createSystemGateway,
  systemOperationScopes,
  UnlistedSystemOperationError,
} from "../src/core/data-access/system/gateway.ts";
import { upsertMediaSeedAsset } from "../src/core/data-access/system/seed-media.ts";
import { resolveSeedRegionMediaId, upsertRegionSeed } from "../src/core/data-access/system/seed-regions.ts";

const input = {
  email: "owner@example.com",
  password: "not-a-real-password",
};

test("System Gateway is protected by the server-only marker", () => {
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", "import('./src/core/data-access/system/gateway.ts')"],
    { cwd: process.cwd(), encoding: "utf8" },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /cannot be imported from a Client Component/);
});

test("System Gateway exposes only the approved operation scopes", () => {
  assert.deepEqual(systemOperationScopes, [
    "bootstrap",
    "maintenance",
    "jobs-recovery",
    "migration-helper",
  ]);
});

test("System Gateway returns an audit-safe result for registered bootstrap", async () => {
  let receivedInput;
  const gateway = createSystemGateway({
    "bootstrap.owner": async (value) => {
      receivedInput = value;
      return { status: "created" };
    },
  });

  const audit = await gateway.run({ input, operation: "bootstrap.owner" });

  assert.deepEqual(receivedInput, input);
  assert.deepEqual(audit, {
    operation: "bootstrap.owner",
    outcome: "created",
    scope: "bootstrap",
  });
  assert.equal(JSON.stringify(audit).includes(input.email), false);
  assert.equal(JSON.stringify(audit).includes(input.password), false);
});

test("System Gateway rejects allowed categories without registered operations", async () => {
  let called = false;
  const gateway = createSystemGateway({
    "bootstrap.owner": async () => {
      called = true;
      return { status: "exists" };
    },
  });

  for (const operation of [
    "maintenance.cleanup",
    "jobs-recovery.retry",
    "migration-helper.repair",
  ]) {
    await assert.rejects(
      () => gateway.run({ input: {}, operation }),
      UnlistedSystemOperationError,
    );
  }
  assert.equal(called, false);
});

test("System Gateway validates bootstrap input before privileged execution", async () => {
  let called = false;
  const gateway = createSystemGateway({
    "bootstrap.owner": async () => {
      called = true;
      return { status: "created" };
    },
  });

  await assert.rejects(
    () => gateway.run({ input: { email: "invalid", password: "short" }, operation: "bootstrap.owner" }),
    z.ZodError,
  );
  assert.equal(called, false);
});

test("System Gateway propagates denied privileged execution without fallback", async () => {
  const denied = new Error("denied");
  const gateway = createSystemGateway({
    "bootstrap.owner": async () => {
      throw denied;
    },
  });

  await assert.rejects(
    () => gateway.run({ input, operation: "bootstrap.owner" }),
    (error) => error === denied,
  );
});

test("region seed operations are collection-specific and always privileged", async () => {
  const calls = [];
  const payload = {
    create: async (options) => {
      calls.push(["create", options]);
      return { id: 77 };
    },
    find: async (options) => {
      calls.push(["find", options]);
      return options.collection === "media" ? { docs: [{ id: 11 }] } : { docs: [] };
    },
  };

  assert.equal(await resolveSeedRegionMediaId(payload, "media-region-krym"), 11);
  assert.deepEqual(await upsertRegionSeed(payload, { data: { slug: "krym", title: "Крым" }, slug: "krym" }), {
    id: 77,
    outcome: "created",
  });
  assert.equal(calls.every(([, options]) => options.overrideAccess === true), true);
  assert.deepEqual(calls.map(([, options]) => options.collection), ["media", "regions", "regions"]);
});

test("media seed operation updates only the matched media asset", async () => {
  const calls = [];
  const payload = {
    find: async (options) => {
      calls.push(["find", options]);
      return { docs: [{ id: 15 }] };
    },
    update: async (options) => {
      calls.push(["update", options]);
      return { id: 15 };
    },
  };

  assert.equal(
    await upsertMediaSeedAsset(payload, {
      data: { alt: "Крым", decorative: false, kind: "region", sourceLabel: "media-region-krym" },
      filename: "crimea-coast.webp",
      filePath: "C:/fixture/crimea-coast.webp",
    }),
    "updated",
  );
  assert.equal(calls.every(([, options]) => options.collection === "media" && options.overrideAccess === true), true);
  assert.equal(calls[1][1].id, 15);
  assert.equal(calls[1][1].overwriteExistingFiles, true);
});
