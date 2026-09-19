import assert from "node:assert/strict";
import test from "node:test";

import {
  createJobsConfig,
  jobsAutoRun,
} from "../src/project/jobs/config.ts";
import {
  catalogLifecycleTask,
  jobsJanitorTask,
  leadRetentionCleanupTask,
  maintenanceQueue,
  maintenanceSchedules,
  maintenanceTasksBySlug,
  recoverLeadDeliveriesTask,
  registeredMaintenanceTasks,
} from "../src/project/jobs/maintenance/scheduled-tasks.ts";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { assertSafeScheduledCron, extractSixFieldCronLiterals, firesPerHour } from "./lib/cron-schedule-guard.mjs";

const srcRoot = join(dirname(fileURLToPath(import.meta.url)), "../src");

function listSourceFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listSourceFiles(path));
      continue;
    }

    if (entry.isFile() && path.endsWith(".ts")) {
      files.push(path);
    }
  }

  return files;
}

const expectedMaintenanceSchedules = [
  { slug: "jobsJanitor", cron: "0 0/5 * * * *" },
  { slug: "recoverLeadDeliveries", cron: "30 0/5 * * * *" },
  { slug: "catalogLifecycle", cron: "0 0 * * * *" },
  { slug: "leadRetentionCleanup", cron: "0 30 2 * * *" },
];

test("maintenance static schedules are registered in the maintenance queue", () => {
  assert.equal(maintenanceQueue, "maintenance");
  assert.deepEqual(maintenanceSchedules, expectedMaintenanceSchedules);

  const config = createJobsConfig("false");
  const taskSlugs = config.tasks?.map((task) => task.slug) ?? [];

  for (const { slug } of expectedMaintenanceSchedules) {
    assert.ok(taskSlugs.includes(slug));
  }

  assert.equal(
    jobsAutoRun.find((entry) => entry.queue === "maintenance")?.disableScheduling,
    false,
  );
});

test("maintenance tasks are resolved by slug instead of array index", () => {
  const source = readFileSync(new URL("../src/project/jobs/maintenance/scheduled-tasks.ts", import.meta.url), "utf8");

  assert.equal(source.includes("const ["), false);
  assert.match(source, /maintenanceTasksBySlug/);
  assert.equal(maintenanceTasksBySlug.jobsJanitor, jobsJanitorTask);
  assert.equal(maintenanceTasksBySlug.recoverLeadDeliveries, recoverLeadDeliveriesTask);
  assert.equal(maintenanceTasksBySlug.catalogLifecycle, catalogLifecycleTask);
  assert.equal(maintenanceTasksBySlug.leadRetentionCleanup, leadRetentionCleanupTask);
  assert.deepEqual(
    registeredMaintenanceTasks.map((task) => task.slug),
    maintenanceSchedules.map((schedule) => schedule.slug),
  );
  assert.equal(registeredMaintenanceTasks[0], maintenanceTasksBySlug[maintenanceSchedules[0].slug]);
});

test("maintenance jobs are no-retry singleton tasks gated by JOBS_AUTORUN", async () => {
  for (const task of registeredMaintenanceTasks) {
    assert.deepEqual(task.inputSchema, []);
    assert.equal(task.retries, 0);
    assert.equal(task.concurrency?.exclusive, true);
    assert.equal(task.concurrency?.supersedes, false);
    assert.equal(task.concurrency?.key?.({ input: {}, queue: "maintenance" }), `maintenance:${task.slug}`);
    assert.deepEqual(task.schedule, [
      {
        cron: expectedMaintenanceSchedules.find((entry) => entry.slug === task.slug)?.cron,
        queue: "maintenance",
      },
    ]);
  }

  assert.equal(await createJobsConfig("false").shouldAutoRun?.({}), false);
  assert.equal(await createJobsConfig("true").shouldAutoRun?.({}), true);
});

test("jobsJanitor maintenance task delegates to import-run janitor", async () => {
  const findCalls = [];
  const payload = {
    async find(args) {
      findCalls.push(args);
      return { docs: [] };
    },
    async update() {
      throw new Error("empty janitor should not update import runs");
    },
  };

  assert.deepEqual(await jobsJanitorTask.handler?.({ input: {}, req: { payload } }), {
    output: {
      interrupted: 0,
      massDeactivationForbidden: true,
      orphanQueued: 0,
      staleRunning: 0,
    },
  });
  assert.equal(findCalls.length, 1);
  assert.equal(findCalls[0].collection, "import-runs");
});

test("recoverLeadDeliveries maintenance task delegates to recovery handler", async () => {
  const findCalls = [];
  const payload = {
    async find(args) {
      findCalls.push(args);
      return { docs: [] };
    },
    async update() {
      throw new Error("empty recovery should not update deliveries");
    },
  };

  assert.deepEqual(
    await recoverLeadDeliveriesTask.handler?.({ input: {}, req: { payload } }),
    { output: { recovered: 0, requeued: 0 } },
  );
  assert.equal(findCalls.length, 2);
  assert.equal(findCalls[0].collection, "payload-jobs");
  assert.equal(findCalls[1].collection, "lead-deliveries");
});

test("catalogLifecycle maintenance task delegates to catalog lifecycle handler", async () => {
  const findCalls = [];
  const payload = {
    async find(args) {
      findCalls.push(args);
      return { docs: [] };
    },
  };

  assert.deepEqual(
    await catalogLifecycleTask.handler?.({ input: {}, req: { payload } }),
    { output: { expired: 0, retained: 0 } },
  );
  assert.equal(findCalls.length, 2);
  assert.equal(findCalls[0].collection, "properties");
  assert.equal(findCalls[1].collection, "properties");
});

test("leadRetentionCleanup maintenance task delegates to retention handler", async () => {
  const findCalls = [];
  const payload = {
    async delete() {
      throw new Error("empty retention cleanup should not delete rows");
    },
    async find(args) {
      findCalls.push(args);
      return { docs: [] };
    },
    async update() {
      throw new Error("empty retention cleanup should not update rows");
    },
  };

  assert.deepEqual(
    await leadRetentionCleanupTask.handler?.({ input: {}, req: { payload } }),
    { output: { anonymized: 0, purged: 0 } },
  );
  assert.equal(findCalls.length, 1);
  assert.equal(findCalls[0].collection, "leads");
});

test("maintenance and dispatcher cron expressions are not per-second and use 0/N steps", () => {
  const config = createJobsConfig("false");
  const crons = (config.tasks ?? []).flatMap((task) => task.schedule?.map((item) => item.cron) ?? []);

  assert.ok(crons.length > 0);
  for (const cron of crons) {
    assertSafeScheduledCron(cron);
  }

  assert.throws(() => assertSafeScheduledCron("* 0/5 * * * *"), /per-second/);
  assert.throws(() => assertSafeScheduledCron("0 */5 * * * *"), /0\/N/);
});

test("maintenance schedules fire at the approved frequency", () => {
  assert.equal(firesPerHour("0 0/5 * * * *"), 12);
  assert.equal(firesPerHour("30 0/5 * * * *"), 12);
  assert.equal(firesPerHour("0 0 * * * *"), 1);
  assert.equal(firesPerHour("0 30 2 * * *"), 1 / 24);
});

test("all source cron literals avoid per-second schedules and */N steps", () => {
  const crons = listSourceFiles(srcRoot).flatMap((file) => extractSixFieldCronLiterals(readFileSync(file, "utf8")));

  assert.ok(crons.includes("0 0/5 * * * *"));
  assert.ok(crons.includes("30 0/5 * * * *"));
  assert.equal(crons.some((cron) => cron.startsWith("* ")), false);

  for (const cron of crons) {
    assertSafeScheduledCron(cron);
  }
});
