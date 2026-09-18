import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createJobsConfig, jobsAutoRun } from "../src/project/jobs/config.ts";
import { dispatchDueFeedsTask, ingestAutorunFrozen } from "../src/project/jobs/imports/dispatch-due-feeds.ts";

const requiredEnv = {
  AMS_PROFILE: "REALTY_BASE",
  TZ: "Europe/Moscow",
  JOBS_AUTORUN: "false",
  DATABASE_URI: "postgresql://moreigori_app:replace-me@127.0.0.1:5432/moreigori_dev",
  PAYLOAD_SECRET: "replace-with-at-least-32-random-characters",
  NEXT_PUBLIC_SERVER_URL: "http://127.0.0.1:3000",
};

test("ingest autorun stays frozen after deploy without FEED_SOURCE_*", async () => {
  assert.equal(ingestAutorunFrozen, true);
  assert.deepEqual(dispatchDueFeedsTask.schedule, []);
  assert.equal(jobsAutoRun.find((entry) => entry.queue === "imports")?.disableScheduling, true);

  Object.assign(process.env, requiredEnv);
  const { parseProjectEnv } = await import("../src/project/env.ts");
  const env = parseProjectEnv(requiredEnv);
  assert.equal(env.JOBS_AUTORUN, "false");
  assert.equal("FEED_SOURCE_PRIMARY" in env, false);

  const autorun = createJobsConfig("true");
  const dispatch = autorun.tasks?.find((task) => task.slug === "dispatchDueFeeds");
  assert.deepEqual(dispatch?.schedule, []);
  assert.equal(autorun.autoRun.find((entry) => entry.queue === "imports")?.disableScheduling, true);
});

test("OPERATIONS records the feed catalog freeze until an explicit owner command", () => {
  const operations = readFileSync(new URL("../docs/OPERATIONS.md", import.meta.url), "utf8");
  assert.match(operations, /Каталог из фида заморожен до отдельной команды/);
  const example = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
  assert.match(example, /Ingest stays frozen/);
  assert.doesNotMatch(example, /^FEED_SOURCE_/m);
});
