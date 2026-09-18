import assert from "node:assert/strict";
import test from "node:test";

import {
  boundImportIssues,
  maxImportIssuesPerRun,
  recordImportIssues,
  toRecordedImportIssue,
} from "../src/core/ingest/record-issues.ts";

test("recorded issues keep only safe diagnostic fields", () => {
  const recorded = toRecordedImportIssue({
    code: "offer-missing-external-id",
    details: { raw: "https://feeds.example/secret.xml", token: "should-not-store" },
    externalId: "flat-1",
    message: "Offer has no stable external identifier and was skipped.",
    path: "offer.@id",
    severity: "warning",
  });

  assert.deepEqual(recorded, {
    code: "offer-missing-external-id",
    externalId: "flat-1",
    message: "Offer has no stable external identifier and was skipped.",
    path: "offer.@id",
    severity: "warning",
  });
  assert.equal("details" in recorded, false);
  assert.equal(JSON.stringify(recorded).includes("secret"), false);
});

test("issue recording is bounded and omits credentials from persisted data", async () => {
  const writes = [];
  const payload = {
    async create(args) {
      writes.push(args);
      return { id: writes.length };
    },
  };

  const issues = Array.from({ length: maxImportIssuesPerRun + 5 }, (_, index) => ({
    code: "too-many",
    details: { feedUrl: "https://feeds.example/secret.xml" },
    message: "Bounded diagnostic",
    severity: "info",
    path: `offer[${index}]`,
  }));

  const recorded = await recordImportIssues({
    feedSourceId: "101",
    importRunId: "501",
    issues,
    payload,
  });

  assert.equal(boundImportIssues(issues).length, maxImportIssuesPerRun);
  assert.equal(recorded.length, maxImportIssuesPerRun);
  assert.equal(writes.length, maxImportIssuesPerRun);
  assert.equal(writes[0].collection, "import-issues");
  assert.equal(writes[0].data.code, "too-many");
  assert.equal(writes[0].data.severity, "info");
  assert.equal("details" in writes[0].data, false);
  assert.equal(JSON.stringify(writes).includes("secret"), false);
});
