import assert from "node:assert/strict";
import test from "node:test";

import { finalizeUnchangedImportRun } from "../../src/core/data-access/system/import-feed-run.ts";
import { createClassifyConditionalHandler } from "../../src/core/ingest/classify-conditional.ts";
import { runIngestPipeline } from "../../src/project/ingest/pipeline.ts";
import { createImportFeedPipelineHandlers } from "../../src/project/jobs/imports/import-feed.ts";

test("finalizeUnchangedImportRun marks a running import as unchanged without property writes", async () => {
  const writes = [];
  const payload = {
    async update(args) {
      writes.push(args);
      return { docs: [{ id: "501" }] };
    },
  };

  assert.equal(
    await finalizeUnchangedImportRun(payload, { feedSourceId: "101", fullBodyRead: false, importRunId: "501", reason: "http-304" }, new Date("2026-09-18T12:00:00.000Z")),
    true,
  );
  assert.equal(writes[0].collection, "import-runs");
  assert.equal(writes[0].data.status, "unchanged");
  assert.equal(writes[0].data.finishedAt, "2026-09-18T12:00:00.000Z");
  assert.equal("offeredCount" in writes[0].data, false);
  assert.equal(writes[0].where.and[2].status.equals, "running");
  assert.equal(writes.some((write) => write.collection === "properties"), false);
});

test("304 stops ingest without parse/upsert and finalizes the run as unchanged", async () => {
  const writes = [];
  const payload = {
    async update(args) {
      writes.push(args);
      return { docs: [{ id: "501" }] };
    },
    async findByID(args) {
      if (args.select?.feedUrlRef) return { feedUrlRef: "FEED_URL_PRIMARY" };
      return { lastEtag: '"abc"', lastModified: null };
    },
  };

  const result = await runIngestPipeline({
    handlers: createImportFeedPipelineHandlers(
      payload,
      () => "https://feeds.example/primary.xml",
      {
        async requestStream() {
          return {
            body: (async function* () {})(),
            contentType: null,
            etag: '"abc"',
            lastModified: null,
            status: 304,
          };
        },
      },
    ),
    input: { feedSourceId: "101", importRunId: "501" },
  });

  assert.equal(result.status, "unchanged");
  assert.equal(result.pendingStage, null);
  assert.equal(result.state.conditional?.kind, "not-modified");
  assert.equal(result.state.conditional?.businessWrite, false);
  assert.equal(result.completedStages.includes("parse"), false);
  assert.equal(result.completedStages.includes("upsert"), false);
  const runWrite = writes.find((write) => write.collection === "import-runs" && write.data.status === "unchanged");
  assert.ok(runWrite);
  assert.equal(writes.some((write) => write.collection === "properties"), false);
});

test("non-304 body continues toward parse without treating it as a business write", async () => {
  let finalized = false;
  const handler = createClassifyConditionalHandler({
    finalizeUnchanged: async () => {
      finalized = true;
      return true;
    },
  });
  const state = {
    fetch: {
      body: (async function* () { yield new TextEncoder().encode("<yml/>"); })(),
      contentType: "application/xml",
      etag: null,
      lastModified: null,
      previousFeedHash: null,
      status: 200,
    },
  };

  const result = await handler({
    input: { feedSourceId: "101", importRunId: "501" },
    state,
  });

  assert.deepEqual(result, { continue: true, status: "running" });
  assert.equal(finalized, false);
  assert.deepEqual(state.conditional, { businessWrite: false, kind: "read-body" });
});
