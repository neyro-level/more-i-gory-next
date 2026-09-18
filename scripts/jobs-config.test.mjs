import assert from "node:assert/strict";
import test from "node:test";

import {
  createJobsConfig,
  jobsAutoRun,
  jobsCollectionDiagnosticOverrides,
} from "../src/project/jobs/config.ts";

const expectedAutoRun = [
  { disableScheduling: false, limit: 5, queue: "system" },
  { disableScheduling: true, limit: 5, queue: "imports" },
  { disableScheduling: false, limit: 5, queue: "maintenance" },
  { disableScheduling: true, limit: 10, queue: "lead-deliveries" },
];

test("jobs config declares the approved queue scheduling matrix", () => {
  const config = createJobsConfig("false");

  assert.deepEqual(jobsAutoRun, expectedAutoRun);
  assert.deepEqual(config.autoRun, expectedAutoRun);
  assert.equal(config.enableConcurrencyControl, true);

  for (const entry of jobsAutoRun) {
    assert.equal(typeof entry.queue, "string");
    assert.equal(typeof entry.limit, "number");
    assert.equal(typeof entry.disableScheduling, "boolean");
    assert.ok(Number.isInteger(entry.limit) && entry.limit > 0);
  }
});

test("jobs autorun follows the validated JOBS_AUTORUN flag", async () => {
  const disabled = createJobsConfig("false");
  const enabled = createJobsConfig("true");

  assert.equal(await disabled.shouldAutoRun?.({}), false);
  assert.equal(await enabled.shouldAutoRun?.({}), true);
});

test("imports queue keeps scheduling disabled while EPIC 16 registers import tasks explicitly", () => {
  const config = createJobsConfig("false");
  const taskSlugs = config.tasks?.map((task) => task.slug) ?? [];

  assert.deepEqual(taskSlugs, [
    "systemHealth",
    "dispatchDueFeeds",
    "importFeed",
    "deliverLead",
    "jobsJanitor",
    "recoverLeadDeliveries",
    "catalogLifecycle",
    "leadRetentionCleanup",
  ]);
  assert.equal(jobsAutoRun.find((entry) => entry.queue === "imports")?.disableScheduling, true);
});

test("existing jobs operations remain owner-only", async () => {
  const config = createJobsConfig("false");
  const ownerRequest = { req: { user: { collection: "users", role: "owner" } } };
  const editorRequest = { req: { user: { collection: "users", role: "editor" } } };

  for (const operation of ["cancel", "queue", "run"]) {
    assert.equal(await config.access?.[operation]?.(ownerRequest), true);
    assert.equal(await config.access?.[operation]?.(editorRequest), false);
  }
});

test("payload-jobs diagnostics are owner-only and read-only", async () => {
  const config = createJobsConfig("false");
  const defaultJobsCollection = {
    access: {
      create: () => true,
      delete: () => true,
      read: () => false,
      update: () => true,
    },
    admin: {
      group: "System",
      hidden: true,
    },
    fields: [],
    slug: "payload-jobs",
  };

  assert.equal(
    config.jobsCollectionOverrides,
    jobsCollectionDiagnosticOverrides.jobsCollectionOverrides,
  );

  const collection = config.jobsCollectionOverrides?.({ defaultJobsCollection });
  const ownerRequest = { req: { user: { collection: "users", role: "owner" } } };
  const editorRequest = { req: { user: { collection: "users", role: "editor" } } };

  assert.equal(collection?.admin?.hidden, false);
  assert.equal(await collection?.access?.read?.(ownerRequest), true);
  assert.equal(await collection?.access?.read?.(editorRequest), false);
  assert.equal(await collection?.access?.create?.(ownerRequest), false);
  assert.equal(await collection?.access?.update?.(ownerRequest), false);
  assert.equal(await collection?.access?.delete?.(ownerRequest), false);
});

test("jobs owner contract allows exactly one JOBS_AUTORUN=true in steady state", async () => {
  const { assertJobsOwnerContract, readJobsAutorunFromEnvText } = await import("./lib/jobs-owner-contract.mjs");

  assert.deepEqual(assertJobsOwnerContract("steady", ["false", "true"]), { mode: "steady", owners: 1 });
  assert.deepEqual(assertJobsOwnerContract("handover-none", ["false", "false"]), {
    mode: "handover-none",
    owners: 0,
  });
  assert.throws(() => assertJobsOwnerContract("steady", ["true", "true"]), /exactly one/);
  assert.throws(() => assertJobsOwnerContract("handover-none", ["true"]), /zero/);
  assert.equal(readJobsAutorunFromEnvText("JOBS_AUTORUN=true\n"), "true");
});
