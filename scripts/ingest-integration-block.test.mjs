import assert from "node:assert/strict";
import test from "node:test";

import { applyFeedFieldOwnership } from "../src/core/ingest/field-ownership.ts";
import { planImportRunJanitor } from "../src/core/ingest/import-maintenance.ts";
import { parseFeedByRegistry } from "../src/core/ingest/parsers/registry.ts";
import { planOfferImport } from "../src/core/ingest/import-state.ts";
import { planSafeDeactivation } from "../src/core/ingest/safe-deactivation.ts";

const feedAXml = `<yml_catalog><shop><offers>
  <offer id="a-1"><name>Feed A one</name><price>100</price></offer>
  <offer id="a-2"><name>Feed A two</name><price>200</price></offer>
</offers></shop></yml_catalog>`;

const feedBXml = `<yml_catalog><shop><offers>
  <offer id="b-1"><name>Feed B one</name><price>300</price></offer>
</offers></shop></yml_catalog>`;

test("§18.5 import block: local feed parses, hashes and plans writes per feed source", () => {
  const parsedA = parseFeedByRegistry({ parser: "yrl", xml: feedAXml });
  const parsedB = parseFeedByRegistry({ parser: "yrl", xml: feedBXml });

  assert.equal(parsedA.suspicious, false);
  assert.equal(parsedA.offeredCount, 2);
  assert.equal(parsedB.suspicious, false);
  assert.equal(parsedB.offeredCount, 1);

  const createA = planOfferImport({
    feedSourceId: "feed-a",
    importRunId: "run-a",
    nowIso: "2026-09-17T04:00:00.000Z",
    offer: parsedA.offers[0],
  });
  const createB = planOfferImport({
    feedSourceId: "feed-b",
    importRunId: "run-b",
    nowIso: "2026-09-17T04:00:00.000Z",
    offer: parsedB.offers[0],
  });

  assert.equal(createA.kind, "create");
  assert.equal(createA.businessWrite, true);
  assert.equal(createA.data.feedSource, "feed-a");
  assert.equal(createB.kind, "create");
  assert.equal(createB.businessWrite, true);
  assert.equal(createB.data.feedSource, "feed-b");
  assert.notEqual(createA.data.externalId, createB.data.externalId);
});

test("§18.5 import-run cannot deactivate manual origin even during mass-missing feed", () => {
  const deactivation = planSafeDeactivation({
    activeInScopeCount: 10,
    deactivationApproval: "approved",
    feedSourceId: "feed-a",
    importRunId: "run-a",
    isBaseline: false,
    market: "newbuild",
    maxDeactivationsPerRun: 20,
    missingFromFeedCount: 9,
    nowIso: "2026-09-17T04:00:00.000Z",
    safetyThresholdPercent: 90,
  });

  assert.equal(deactivation.action, "deactivate");
  assert.deepEqual(deactivation.scope.and, [
    { origin: { equals: "feed" } },
    { feedSource: { equals: "feed-a" } },
    { market: { equals: "newbuild" } },
    { status: { equals: "active" } },
  ]);
  assert.equal(
    deactivation.scope.and.some((predicate) => predicate.origin?.equals === "manual"),
    false,
    "deactivation scope must never include manual origin",
  );

  const manualWrite = planOfferImport({
    existing: { feedSource: null, id: "manual-1", origin: "manual" },
    feedSourceId: "feed-a",
    importRunId: "run-a",
    nowIso: "2026-09-17T04:00:00.000Z",
    offer: { externalId: "manual-1", source: { id: "manual-1", name: "Manual" } },
  });
  assert.deepEqual(manualWrite, { businessWrite: false, kind: "skip-foreign-owner", reason: "manual-origin" });
});

test("§18.5 multi-feed independence: Feed A cannot touch Feed B rows or fields", () => {
  const parsedA = parseFeedByRegistry({ parser: "yrl", xml: feedAXml });
  const feedBExisting = {
    description: "Feed B description",
    priceMinor: 300,
    title: "Feed B title",
  };

  assert.deepEqual(
    planOfferImport({
      existing: { feedSource: "feed-b", id: "b-1", importHash: "old", origin: "feed" },
      feedSourceId: "feed-a",
      importRunId: "run-a",
      nowIso: "2026-09-17T04:00:00.000Z",
      offer: parsedA.offers[0],
    }),
    { businessWrite: false, kind: "skip-foreign-owner", reason: "different-feed" },
  );

  assert.deepEqual(
    applyFeedFieldOwnership({
      current: feedBExisting,
      importingFeedSourceId: "feed-a",
      incoming: { priceMinor: 100, title: "Feed A title" },
      record: { feedSource: "feed-b", origin: "feed" },
    }),
    {
      denied: [
        { field: "priceMinor", reason: "different-owning-feed" },
        { field: "title", reason: "different-owning-feed" },
      ],
      patch: {},
    },
  );

  const deactivation = planSafeDeactivation({
    activeInScopeCount: 2,
    deactivationApproval: "approved",
    feedSourceId: "feed-a",
    importRunId: "run-a",
    isBaseline: false,
    market: "newbuild",
    maxDeactivationsPerRun: 10,
    missingFromFeedCount: 1,
    nowIso: "2026-09-17T04:00:00.000Z",
    safetyThresholdPercent: 80,
  });
  assert.equal(deactivation.scope.and.find((predicate) => predicate.feedSource)?.feedSource.equals, "feed-a");
});

test("§18.5 import maintenance proof: interrupted import cannot mutate baseline or trigger deactivation", () => {
  const actions = planImportRunJanitor({
    dispatcherIntervalMinutes: 5,
    nowIso: "2026-09-17T04:00:00.000Z",
    runs: [{ heartbeatAt: "2026-09-17T03:40:00.000Z", id: "run-a", startedAt: "2026-09-17T03:30:00.000Z", status: "running" }],
    staleRunningThresholdMinutes: 15,
  });

  assert.deepEqual(actions, [
    {
      baselinePreserved: true,
      data: {
        finishedAt: "2026-09-17T04:00:00.000Z",
        status: "interrupted",
        summary: "Import run was interrupted by jobsJanitor after stale heartbeat.",
      },
      id: "run-a",
      massDeactivationForbidden: true,
      reason: "stale-running",
    },
  ]);
});

test("§18.5 baseline import does not deactivate even when feed appears empty", () => {
  assert.deepEqual(planSafeDeactivation({
    activeInScopeCount: 25,
    deactivationApproval: "approved",
    feedSourceId: "feed-a",
    importRunId: "baseline-run",
    isBaseline: true,
    market: "newbuild",
    maxDeactivationsPerRun: 25,
    missingFromFeedCount: 25,
    nowIso: "2026-09-17T04:00:00.000Z",
    safetyThresholdPercent: 100,
  }).action, "skip");
});
