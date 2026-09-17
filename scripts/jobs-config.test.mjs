import assert from "node:assert/strict";
import test from "node:test";

import {
  createJobsConfig,
  jobsAutoRun,
} from "../src/project/jobs/config.ts";

const expectedAutoRun = [
  { disableScheduling: false, queue: "system" },
  { disableScheduling: true, queue: "imports" },
  { disableScheduling: false, queue: "maintenance" },
  { disableScheduling: true, queue: "lead-deliveries" },
];

test("jobs config declares the approved queue scheduling matrix", () => {
  const config = createJobsConfig("false");

  assert.deepEqual(jobsAutoRun, expectedAutoRun);
  assert.deepEqual(config.autoRun, expectedAutoRun);
  assert.equal(config.enableConcurrencyControl, true);
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

  assert.deepEqual(taskSlugs, ["systemHealth", "dispatchDueFeeds", "importFeed", "deliverLead"]);
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
