import assert from "node:assert/strict";
import test from "node:test";

import { planSafeDeactivation } from "../src/core/ingest/safe-deactivation.ts";
import { FeedSources } from "../src/project/collections/feed-sources.ts";

const baseInput = {
  activeInScopeCount: 100,
  deactivationApproval: "required",
  feedSourceId: "feed-a",
  importRunId: "run-1",
  isBaseline: false,
  market: "newbuild",
  maxDeactivationsPerRun: 20,
  missingFromFeedCount: 5,
  nowIso: "2026-09-17T02:00:00.000Z",
  safetyThresholdPercent: 20,
};

test("feed source schema stores one-time deactivation approval consumedAt marker", () => {
  const field = FeedSources.fields.find((item) => "name" in item && item.name === "deactivationApprovalConsumedAt");

  assert.equal(field?.type, "date");
});

test("deactivation scope is locked to feed origin, feed source, market and active status", () => {
  const plan = planSafeDeactivation(baseInput);

  assert.equal(plan.action, "deactivate");
  assert.deepEqual(plan.scope, {
    and: [
      { origin: { equals: "feed" } },
      { feedSource: { equals: "feed-a" } },
      { market: { equals: "newbuild" } },
      { status: { equals: "active" } },
    ],
  });
});

test("first baseline run never deactivates inventory", () => {
  assert.deepEqual(planSafeDeactivation({ ...baseInput, isBaseline: true, missingFromFeedCount: 90 }), {
    action: "skip",
    reason: "baseline",
    scope: {
      and: [
        { origin: { equals: "feed" } },
        { feedSource: { equals: "feed-a" } },
        { market: { equals: "newbuild" } },
        { status: { equals: "active" } },
      ],
    },
  });
});

test("safe deactivation inside percentage and max gates does not consume approval", () => {
  const plan = planSafeDeactivation(baseInput);

  assert.equal(plan.action, "deactivate");
  assert.equal("consumeApprovalAt" in plan, false);
  assert.deepEqual(plan.deactivationPatch, {
    deactivatedAt: "2026-09-17T02:00:00.000Z",
    deactivatedByRun: "run-1",
    status: "archived",
  });
});

test("gate breach requires fresh one-time approval and consumes it", () => {
  assert.deepEqual(planSafeDeactivation({ ...baseInput, missingFromFeedCount: 25 }), {
    action: "suspicious",
    issueCode: "deactivation-approval-required",
    missingFromFeedCount: 25,
    scope: {
      and: [
        { origin: { equals: "feed" } },
        { feedSource: { equals: "feed-a" } },
        { market: { equals: "newbuild" } },
        { status: { equals: "active" } },
      ],
    },
  });

  const approved = planSafeDeactivation({ ...baseInput, deactivationApproval: "approved", missingFromFeedCount: 25 });
  assert.equal(approved.action, "deactivate");
  assert.equal(approved.consumeApprovalAt, "2026-09-17T02:00:00.000Z");
});

test("consumed or rejected approval blocks mass deactivation as suspicious", () => {
  assert.equal(
    planSafeDeactivation({
      ...baseInput,
      deactivationApproval: "approved",
      deactivationApprovalConsumedAt: "2026-09-17T01:00:00.000Z",
      missingFromFeedCount: 25,
    }).issueCode,
    "deactivation-approval-consumed",
  );
  assert.equal(
    planSafeDeactivation({ ...baseInput, deactivationApproval: "rejected", missingFromFeedCount: 25 }).issueCode,
    "deactivation-approval-rejected",
  );
});
