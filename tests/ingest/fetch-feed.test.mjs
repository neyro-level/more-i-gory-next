import assert from "node:assert/strict";
import test from "node:test";

import { loadFeedSourceConditionalState } from "../../src/core/data-access/system/load-feed-source-conditional.ts";
import {
  FeedFetchError,
  createFetchFeedHandler,
  fetchFeedDocument,
  parseOutboundAllowedHosts,
} from "../../src/core/ingest/fetch-feed.ts";
import { DEFAULT_FEED_PARSER_LIMITS } from "../../src/core/ingest/parsers/limits.ts";
import { createImportFeedClaimHandler, runIngestPipeline } from "../../src/project/ingest/pipeline.ts";
import { createResolveFeedUrlHandler } from "../../src/core/ingest/resolve-feed-url.ts";
import { createCacheInvalidator } from "../../src/core/cache/invalidator.ts";
import { createImportFeedPipelineHandlers } from "../../src/project/jobs/imports/import-feed.ts";
import { SafeOutboundRequestError } from "../../src/core/security/outbound-http/index.ts";

async function* stream(bytes) {
  if (bytes.byteLength > 0) yield bytes;
}

test("parseOutboundAllowedHosts splits unique hosts", () => {
  assert.deepEqual(parseOutboundAllowedHosts("Feeds.Example, feeds.example, other.test"), [
    "feeds.example",
    "other.test",
  ]);
  assert.deepEqual(parseOutboundAllowedHosts(undefined), []);
});

test("fetchFeedDocument sends conditional headers, limits and timeout through SafeOutboundClient", async () => {
  const requests = [];
  const outbound = {
    async requestStream(request) {
      requests.push(request);
      return {
        body: stream(new TextEncoder().encode("<yml/>")),
        contentType: "application/xml",
        etag: '"abc"',
        lastModified: "Wed, 16 Sep 2026 12:00:00 GMT",
        status: 200,
      };
    },
  };

  const result = await fetchFeedDocument({
    feedUrl: "https://feeds.example/primary.xml",
    lastEtag: '"abc"',
    lastModified: "Wed, 16 Sep 2026 12:00:00 GMT",
    outbound,
  });

  assert.equal(requests[0].method, "GET");
  assert.equal(requests[0].url.href, "https://feeds.example/primary.xml");
  assert.deepEqual(requests[0].headers, {
    "If-Modified-Since": "Wed, 16 Sep 2026 12:00:00 GMT",
    "If-None-Match": '"abc"',
  });
  assert.equal(requests[0].maxResponseBytes, DEFAULT_FEED_PARSER_LIMITS.maxBytes);
  assert.equal(requests[0].timeoutMs, DEFAULT_FEED_PARSER_LIMITS.timeoutMs);
  assert.equal(result.status, 200);
  assert.equal(result.etag, '"abc"');
});

test("fetchFeedDocument fails closed when SafeOutboundClient rejects the request", async () => {
  await assert.rejects(
    () =>
      fetchFeedDocument({
        feedUrl: "https://feeds.example/primary.xml",
        outbound: {
          async requestStream() {
            throw new SafeOutboundRequestError("outbound_response_too_large");
          },
        },
      }),
    (error) => error instanceof FeedFetchError && error.safeCode === "outbound_response_too_large",
  );
});

test("System Gateway loads only conditional cache validators", async () => {
  const payload = {
    async findByID(args) {
      assert.deepEqual(args.select, { lastEtag: true, lastFeedHash: true, lastModified: true });
      assert.equal(args.overrideAccess, true);
      return { lastEtag: '"abc"', lastFeedHash: "hash", lastModified: "Wed, 16 Sep 2026 12:00:00 GMT", feedUrlRef: "must-not-load" };
    },
  };

  assert.deepEqual(await loadFeedSourceConditionalState(payload, "101"), {
    lastEtag: '"abc"',
    lastFeedHash: "hash",
    lastModified: "Wed, 16 Sep 2026 12:00:00 GMT",
  });
});

test("fetch stage stores the outbound response and stops before parse", async () => {
  const body = new TextEncoder().encode("<yml/>");
  const result = await runIngestPipeline({
    handlers: {
      "claim-running": createImportFeedClaimHandler(async () => true),
      "resolve-feed-url": createResolveFeedUrlHandler({
        loadFeedUrlRef: async () => "FEED_URL_PRIMARY",
        lookupEnv: () => "https://feeds.example/primary.xml",
      }),
      fetch: createFetchFeedHandler({
        loadConditionalState: async () => ({ lastEtag: null, lastFeedHash: null, lastModified: null }),
        outbound: {
          async requestStream() {
            return {
              body: stream(body),
              contentType: "application/xml",
              etag: '"n"',
              lastModified: null,
              status: 200,
            };
          },
        },
      }),
    },
    input: { feedSourceId: "101", importRunId: "501" },
  });

  assert.equal(result.status, "running");
  assert.equal(result.pendingStage, "classify-conditional");
  assert.equal(result.state.fetch?.status, 200);
  assert.equal(result.state.fetch?.etag, '"n"');
  assert.equal(typeof result.state.fetch?.body[Symbol.asyncIterator], "function");
});

test("importFeed composition fetches after resolving the env-named URL", async () => {
  const requests = [];
  const writes = [];
  const batches = [];
  const payload = {
    async update(args) {
      writes.push(args);
      return { docs: [{ id: "501" }] };
    },
    async findByID(args) {
      if (args.collection === "import-runs") return { mode: "incremental" };
      if (args.select?.feedUrlRef) return { feedUrlRef: "FEED_URL_PRIMARY" };
      if (args.select?.parser) return { parser: "yrl" };
      if (args.select?.market) return { market: "newbuild" };
      if (args.select?.maxDeactivationsPerRun) {
        return {
          deactivationApproval: {},
          lastFeedHash: "hash",
          lastFullRunAt: "2026-09-01T00:00:00.000Z",
          lastOfferCount: 10,
          market: "newbuild",
          maxDeactivationsPerRun: 20,
          safetyThresholdPercent: 20,
        };
      }
      return { lastEtag: '"abc"', lastModified: null };
    },
    async find() {
      return { docs: [] };
    },
    async create(args) {
      writes.push(args);
      return { id: args.collection === "import-issues" ? 800 : 900 };
    },
  };

  const result = await runIngestPipeline({
    handlers: createImportFeedPipelineHandlers(
      payload,
      (name) => (name === "FEED_URL_PRIMARY" ? "https://feeds.example/primary.xml" : undefined),
      {
        async requestStream(request) {
          requests.push(request);
          return {
            body: stream(new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8"?><yml_catalog><shop><offers><offer id="flat-1"><name>Апартамент</name></offer></offers></shop></yml_catalog>`)),
            contentType: "application/xml",
            etag: '"abc"',
            lastModified: null,
            status: 200,
          };
        },
      },
      {
        invalidator: createCacheInvalidator({
          branch: "http",
          invalidateBatch: async (batch) => batches.push(batch),
        }),
      },
    ),
    input: { feedSourceId: "101", importRunId: "501" },
  });

  assert.equal(requests[0].headers["If-None-Match"], '"abc"');
  assert.equal(result.state.fetch?.status, 200);
  assert.equal(result.pendingStage, null);
  assert.equal(result.status, "success");
  const runWrite = writes.find((write) => write.collection === "import-runs" && write.data.status === "success");
  assert.ok(runWrite);
  assert.equal(typeof runWrite.data.finishedAt, "string");
  assert.equal(runWrite.data.createdCount, 1);
  assert.equal(result.state.conditional?.kind, "read-body");
  assert.equal(result.state.parse?.suspicious, false);
  assert.equal(result.state.upsert?.createdCount, 1);
  assert.equal(JSON.stringify(requests[0].headers).includes("https://"), false);
  const created = writes.find((write) => write.collection === "properties");
  assert.equal(created.data.origin, "feed");
  assert.equal(created.data.externalId, "flat-1");
  assert.equal("source" in created.data, false);
  assert.equal(batches.length, 1);
  assert.ok(batches[0].some((target) => target.kind === "tag" && target.tag === "catalog"));
});
