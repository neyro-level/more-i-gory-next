import assert from "node:assert/strict";
import test from "node:test";

import { planSafeDeactivation } from "../src/core/ingest/safe-deactivation.ts";
import { FeedSources } from "../src/project/collections/feed-sources.ts";

const baseInput = {
  deactivationApproval: {},
  feedSourceId: "feed-a",
  importRunId: "run-1",
  isBaseline: false,
  lastOfferCount: 100,
  market: "newbuild",
  maxDeactivationsPerRun: 20,
  missingFromFeedCount: 5,
  nowIso: "2026-09-17T02:00:00.000Z",
  safetyThresholdPercent: 20,
};

test("feed source schema stores run-bound deactivation approval instead of a global required/approved/rejected flag", () => {
  const group = FeedSources.fields.find((item) => "name" in item && item.name === "deactivationApproval");

  assert.equal(group?.type, "group");
  assert.deepEqual(
    group.fields.map((item) => item.name),
    ["runId", "approvedBy", "approvedAt", "expiresAt", "consumedAt", "decision"],
  );
  assert.equal(
    FeedSources.fields.some((item) => "name" in item && item.name === "deactivationApprovalConsumedAt"),
    false,
  );
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

test("first full run never mass deactivates even with a matching approval", () => {
  assert.deepEqual(
    planSafeDeactivation({
      ...baseInput,
      deactivationApproval: {
        approvedAt: "2026-09-17T01:00:00.000Z",
        decision: "approved",
        expiresAt: "2026-09-17T03:00:00.000Z",
        runId: "run-1",
      },
      missingFromFeedCount: 90,
      mode: "full",
    }),
    {
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
    },
  );
});

test("explicit baseline flag still skips deactivation", () => {
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

  const approved = planSafeDeactivation({
    ...baseInput,
    deactivationApproval: {
      approvedAt: "2026-09-17T01:00:00.000Z",
      decision: "approved",
      expiresAt: "2026-09-17T03:00:00.000Z",
      runId: "run-1",
    },
    missingFromFeedCount: 25,
  });
  assert.equal(approved.action, "deactivate");
  assert.equal(approved.consumeApprovalAt, "2026-09-17T02:00:00.000Z");
});

test("consumed or rejected approval blocks mass deactivation as suspicious", () => {
  assert.equal(
    planSafeDeactivation({
      ...baseInput,
      deactivationApproval: {
        approvedAt: "2026-09-17T01:00:00.000Z",
        consumedAt: "2026-09-17T01:00:00.000Z",
        decision: "approved",
        expiresAt: "2026-09-17T03:00:00.000Z",
        runId: "run-1",
      },
      missingFromFeedCount: 25,
    }).issueCode,
    "deactivation-approval-consumed",
  );
  assert.equal(
    planSafeDeactivation({
      ...baseInput,
      deactivationApproval: { decision: "rejected" },
      missingFromFeedCount: 25,
    }).issueCode,
    "deactivation-approval-rejected",
  );
});

test("mass deactivation requires the live run-bound approval contract", () => {
  const valid = {
    approvedAt: "2026-09-17T01:00:00.000Z",
    decision: "approved",
    expiresAt: "2026-09-17T03:00:00.000Z",
    runId: "run-1",
  };

  assert.equal(
    planSafeDeactivation({
      ...baseInput,
      deactivationApproval: { ...valid, runId: "run-B" },
      missingFromFeedCount: 25,
    }).issueCode,
    "deactivation-approval-run-mismatch",
  );
  assert.equal(
    planSafeDeactivation({
      ...baseInput,
      deactivationApproval: { ...valid, expiresAt: "2026-09-17T01:30:00.000Z" },
      missingFromFeedCount: 25,
    }).issueCode,
    "deactivation-approval-expired",
  );
  assert.equal(
    planSafeDeactivation({
      ...baseInput,
      deactivationApproval: { ...valid, approvedAt: null },
      missingFromFeedCount: 25,
    }).issueCode,
    "deactivation-approval-required",
  );
});

const liveApproval = {
  approvedAt: "2026-09-17T01:00:00.000Z",
  decision: "approved",
  expiresAt: "2026-09-17T03:00:00.000Z",
  runId: "run-1",
};

test("TASK 24.8: approval A cannot approve run B", () => {
  assert.equal(
    planSafeDeactivation({
      ...baseInput,
      deactivationApproval: { ...liveApproval, runId: "run-A" },
      importRunId: "run-B",
      missingFromFeedCount: 25,
    }).issueCode,
    "deactivation-approval-run-mismatch",
  );
});

test("TASK 24.8: expired approval is rejected", () => {
  assert.equal(
    planSafeDeactivation({
      ...baseInput,
      deactivationApproval: { ...liveApproval, expiresAt: "2026-09-17T01:59:00.000Z" },
      missingFromFeedCount: 25,
    }).issueCode,
    "deactivation-approval-expired",
  );
});

test("TASK 24.8: consumed approval is rejected", () => {
  assert.equal(
    planSafeDeactivation({
      ...baseInput,
      deactivationApproval: { ...liveApproval, consumedAt: "2026-09-17T01:50:00.000Z" },
      missingFromFeedCount: 25,
    }).issueCode,
    "deactivation-approval-consumed",
  );
});

test("TASK 24.8: rejected approval is rejected", () => {
  assert.equal(
    planSafeDeactivation({
      ...baseInput,
      deactivationApproval: { ...liveApproval, decision: "rejected" },
      missingFromFeedCount: 25,
    }).issueCode,
    "deactivation-approval-rejected",
  );
});

test("TASK 24.8: baseline cannot deactivate", () => {
  assert.equal(
    planSafeDeactivation({
      ...baseInput,
      deactivationApproval: liveApproval,
      isBaseline: true,
      missingFromFeedCount: 90,
    }).action,
    "skip",
  );
});

test("TASK 24.8: threshold breach is suspicious without a live approval", () => {
  const plan = planSafeDeactivation({
    ...baseInput,
    maxDeactivationsPerRun: 100,
    missingFromFeedCount: 21,
  });
  assert.equal(plan.action, "suspicious");
  assert.equal(plan.issueCode, "deactivation-approval-required");
});

test("TASK 24.8: absolute limit breach is suspicious without a live approval", () => {
  const plan = planSafeDeactivation({
    ...baseInput,
    maxDeactivationsPerRun: 10,
    missingFromFeedCount: 11,
  });
  assert.equal(plan.action, "suspicious");
  assert.equal(plan.issueCode, "deactivation-approval-required");
});

test("TASK 24.8: approved exact run may deactivate once", () => {
  const first = planSafeDeactivation({
    ...baseInput,
    deactivationApproval: liveApproval,
    missingFromFeedCount: 25,
  });
  assert.equal(first.action, "deactivate");
  assert.equal(first.consumeApprovalAt, "2026-09-17T02:00:00.000Z");

  const second = planSafeDeactivation({
    ...baseInput,
    deactivationApproval: { ...liveApproval, consumedAt: first.consumeApprovalAt },
    missingFromFeedCount: 25,
  });
  assert.equal(second.action, "suspicious");
  assert.equal(second.issueCode, "deactivation-approval-consumed");
});
