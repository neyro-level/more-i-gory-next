import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { z } from "zod";

import {
  createSystemGateway,
  systemOperationScopes,
  UnlistedSystemOperationError,
} from "../src/core/data-access/system/gateway.ts";

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
