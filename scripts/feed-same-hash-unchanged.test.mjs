import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { createImportFeedPipelineHandlers } from "../src/project/jobs/imports/import-feed.ts";
import { runIngestPipeline } from "../src/project/ingest/pipeline.ts";

const xml = "<yml_catalog><shop><offers><offer id=\"1\"><name>Море</name></offer></offers></shop></yml_catalog>";
const bytes = new TextEncoder().encode(xml);
const hash = createHash("sha256").update(bytes).digest("hex");

async function* body() { yield bytes.slice(0, 11); yield bytes.slice(11); }

test("HTTP 200 with the same full-stream hash persists unchanged before business writes", async () => {
  const writes = [];
  const payload = {
    async update(args) { writes.push(args); return { docs: [{ id: "run" }] }; },
    async find() { return { docs: [] }; },
    async findByID(args) {
      if (args.collection === "import-runs") return { mode: "full" };
      if (args.select?.feedUrlRef) return { feedUrlRef: "FEED_URL" };
      if (args.select?.parser) return { parser: "yrl" };
      if (args.select?.lastFeedHash) return { lastEtag: null, lastFeedHash: hash, lastModified: null };
      return {};
    },
  };
  const result = await runIngestPipeline({
    handlers: createImportFeedPipelineHandlers(payload, () => "https://feeds.example/feed.xml", {
      async requestStream() {
        return { body: body(), contentType: "application/xml", etag: '"v2"', lastModified: null, status: 200 };
      },
    }),
    input: { feedSourceId: "source", importRunId: "run" },
  });

  assert.equal(result.status, "unchanged");
  assert.equal(result.state.conditional.kind, "same-hash");
  assert.equal(result.completedStages.includes("upsert"), false);
  assert.equal(writes.some((entry) => entry.collection === "properties"), false);
  const runWrite = writes.find((entry) => entry.collection === "import-runs" && entry.data.status === "unchanged");
  const sourceWrite = writes.find((entry) => entry.collection === "feed-sources");
  assert.ok(runWrite);
  assert.equal("offeredCount" in runWrite.data, false);
  assert.equal(typeof sourceWrite.data.lastSuccessfulRunAt, "string");
  assert.equal(sourceWrite.data.lastFullRunAt, sourceWrite.data.lastSuccessfulRunAt);
  assert.equal("lastOfferCount" in sourceWrite.data, false);
});
