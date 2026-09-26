import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { assertJobsOwnerContract } from "../../scripts/lib/jobs-owner-contract.mjs";
import {
  JOBS_HANDOVER_STEPS,
  assertStagingCannotPromoteJobs,
  nextHandoverAssertMode,
} from "../../scripts/lib/jobs-handover.mjs";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("jobs handover follows false → readiness → stop old → none → true → health", () => {
  assert.deepEqual(JOBS_HANDOVER_STEPS, [
    "new runtime JOBS_AUTORUN=false",
    "readiness",
    "stop old jobs owner",
    "assert no owner",
    "start new owner JOBS_AUTORUN=true",
    "health",
  ]);
  assert.equal(nextHandoverAssertMode("assert no owner"), "handover-none");
  assert.equal(nextHandoverAssertMode("start new owner JOBS_AUTORUN=true"), "steady");
  assert.deepEqual(assertJobsOwnerContract("handover-none", ["false"]), { mode: "handover-none", owners: 0 });
  assert.deepEqual(assertJobsOwnerContract("steady", ["false", "true"]), { mode: "steady", owners: 1 });

  const script = read("ops/runtime/jobs-handover.sh");
  for (const step of JOBS_HANDOVER_STEPS) {
    assert.equal(script.includes(step), true, step);
  }
  assert.match(script, /assert-one-jobs-owner\.mjs"? --mode=handover-none/);
  assert.match(script, /assert-one-jobs-owner\.mjs"? --mode=steady/);
  assert.match(read("docs/OPERATIONS.md"), /ops\/runtime\/jobs-handover\.sh/);
});

test("staging contour cannot be promoted to jobs owner", () => {
  assert.doesNotThrow(() => assertStagingCannotPromoteJobs({ contour: "staging", jobsAutorun: "false" }));
  assert.throws(
    () => assertStagingCannotPromoteJobs({ contour: "staging", jobsAutorun: "true" }),
    /must not become JOBS_AUTORUN=true/,
  );
  assert.match(read("ops/systemd/moreigory.service"), /JOBS_AUTORUN=false/);
  assert.match(read("ops/runtime/jobs-handover.sh"), /staging contour refuses JOBS_AUTORUN=true/);
});
