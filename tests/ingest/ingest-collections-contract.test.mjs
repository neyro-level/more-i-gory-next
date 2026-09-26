import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { FeedSources } from "../../src/project/collections/feed-sources.ts";
import { ImportIssues } from "../../src/project/collections/import-issues.ts";
import { ImportRuns } from "../../src/project/collections/import-runs.ts";

function field(collection, name) {
  return collection.fields.find((candidate) => candidate.name === name);
}

function fieldNames(collection) {
  return collection.fields.map((candidate) => candidate.name);
}

function relationField(collection, name) {
  const candidate = field(collection, name);
  assert.ok(candidate, `${collection.slug}.${name} field is missing`);
  assert.equal(candidate.type, "relationship", `${collection.slug}.${name} must be a relationship`);
  return candidate;
}

function optionValues(collection, name) {
  return field(collection, name).options.map((option) => option.value);
}

test("feed-sources exposes the approved scheduling, safety and secret-reference fields", () => {
  assert.equal(FeedSources.slug, "feed-sources");
  assert.deepEqual(fieldNames(FeedSources), [
    "code",
    "parser",
    "market",
    "feedUrlRef",
    "enabled",
    "refreshIntervalMinutes",
    "nextDueAt",
    "lastAttemptAt",
    "lastSuccessfulRunAt",
    "lastFullRunAt",
    "safetyThresholdPercent",
    "maxDeactivationsPerRun",
    "lastOfferCount",
    "lastEtag",
    "lastModified",
    "lastFeedHash",
    "deactivationApproval",
  ]);
  assert.equal(field(FeedSources, "code").unique, true);
  assert.equal(field(FeedSources, "parser").index, true);
  assert.equal(field(FeedSources, "feedUrlRef").type, "text");
  assert.match(field(FeedSources, "feedUrlRef").admin.description, /Secret Master reference/);
  assert.equal(field(FeedSources, "feedUrlRef").validate("FEED_URL_PRIMARY"), true);
  assert.match(field(FeedSources, "feedUrlRef").validate("https://example.com/feed.xml"), /env name/);
  assert.equal(field(FeedSources, "refreshIntervalMinutes").defaultValue, 60);
  assert.equal(field(FeedSources, "safetyThresholdPercent").defaultValue, 20);
  assert.match(field(FeedSources, "safetyThresholdPercent").validate(101), /percent/);
  assert.equal(field(FeedSources, "maxDeactivationsPerRun").defaultValue, 0);
  const approval = field(FeedSources, "deactivationApproval");
  assert.equal(approval.type, "group");
  assert.deepEqual(
    approval.fields.map((item) => item.name),
    ["runId", "approvedBy", "approvedAt", "expiresAt", "consumedAt", "decision"],
  );
  assert.deepEqual(
    approval.fields.find((item) => item.name === "decision").options.map((option) => option.value),
    ["approved", "rejected"],
  );
});

test("import-runs tracks queue, job and counter state per feed source", () => {
  assert.equal(ImportRuns.slug, "import-runs");
  assert.equal(relationField(ImportRuns, "feedSource").relationTo, "feed-sources");
  assert.deepEqual(optionValues(ImportRuns, "status"), [
    "queued",
    "running",
    "success",
    "unchanged",
    "suspicious",
    "failed",
    "interrupted",
  ]);
  assert.deepEqual(optionValues(ImportRuns, "mode"), ["incremental", "full"]);
  assert.equal(field(ImportRuns, "jobId").index, true);
  assert.equal(field(ImportRuns, "heartbeatAt").index, true);
  for (const name of ["createdCount", "updatedCount", "skippedCount", "deactivatedCount", "issueCount"]) {
    assert.equal(field(ImportRuns, name).defaultValue, 0);
    assert.match(field(ImportRuns, name).validate(1.5), /integer/);
  }
  assert.deepEqual(ImportRuns.indexes, [
    { fields: ["feedSource", "status"] },
    { fields: ["feedSource", "startedAt"] },
  ]);
});

test("import-issues link local feed problems to a run without publishing anything", () => {
  assert.equal(ImportIssues.slug, "import-issues");
  assert.equal(relationField(ImportIssues, "feedSource").relationTo, "feed-sources");
  assert.equal(relationField(ImportIssues, "importRun").relationTo, "import-runs");
  assert.deepEqual(optionValues(ImportIssues, "severity"), ["info", "warning", "error", "critical"]);
  assert.equal(field(ImportIssues, "code").required, true);
  assert.equal(field(ImportIssues, "message").required, true);
  assert.equal(field(ImportIssues, "details").type, "json");
  assert.deepEqual(ImportIssues.indexes, [
    { fields: ["importRun", "severity"] },
    { fields: ["feedSource", "code"] },
  ]);
});

test("ingest collections are registered in Payload config before inventory collections", () => {
  const payloadConfig = fs.readFileSync("payload.config.ts", "utf8");
  const collectionsBlock = payloadConfig.slice(payloadConfig.indexOf("collections: ["), payloadConfig.indexOf("  ],", payloadConfig.indexOf("collections: [")));

  for (const name of ["FeedSources", "ImportRuns", "ImportIssues", "Properties"]) {
    assert.ok(collectionsBlock.includes(name), `${name} must be registered in payload.config.ts`);
  }
  assert.ok(collectionsBlock.indexOf("FeedSources") < collectionsBlock.indexOf("Properties"));
  assert.ok(collectionsBlock.indexOf("ImportRuns") < collectionsBlock.indexOf("Properties"));
  assert.ok(collectionsBlock.indexOf("ImportIssues") < collectionsBlock.indexOf("Properties"));
});
