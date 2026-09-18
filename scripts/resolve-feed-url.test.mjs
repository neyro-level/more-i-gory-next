import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { loadFeedSourceUrlRef } from "../src/core/data-access/system/load-feed-source-url-ref.ts";
import {
  FeedUrlResolveError,
  createResolveFeedUrlHandler,
  resolveFeedUrlFromRuntimeEnv,
  validateFeedUrlRef,
} from "../src/core/ingest/resolve-feed-url.ts";
import { FeedSources } from "../src/project/collections/feed-sources.ts";
import { createImportFeedClaimHandler, runIngestPipeline } from "../src/project/ingest/pipeline.ts";
import { createImportFeedPipelineHandlers } from "../src/project/jobs/imports/import-feed.ts";

test("feedUrlRef accepts env names and rejects URLs", () => {
  assert.equal(validateFeedUrlRef(undefined), true);
  assert.equal(validateFeedUrlRef(""), true);
  assert.equal(validateFeedUrlRef("FEED_URL_PRIMARY"), true);
  assert.match(validateFeedUrlRef("https://feeds.example/secret.xml"), /env name/);
  assert.match(validateFeedUrlRef("feed-url"), /env name/);
  assert.match(validateFeedUrlRef("lowercase"), /env name/);

  const field = FeedSources.fields.find((candidate) => candidate.name === "feedUrlRef");
  assert.equal(field.validate("FEED_URL_PRIMARY"), true);
  assert.match(field.validate("https://example.com/feed.xml"), /env name/);
});

test("runtime env adapter resolves a named URL and fails closed when unset", async () => {
  assert.equal(
    await resolveFeedUrlFromRuntimeEnv({
      feedUrlRef: "FEED_URL_PRIMARY",
      lookup: (name) => (name === "FEED_URL_PRIMARY" ? "https://feeds.example/primary.xml" : undefined),
    }),
    "https://feeds.example/primary.xml",
  );

  await assert.rejects(
    () =>
      resolveFeedUrlFromRuntimeEnv({
        feedUrlRef: "FEED_URL_PRIMARY",
        lookup: () => undefined,
      }),
    (error) => error instanceof FeedUrlResolveError && error.safeCode === "feed_url_env_missing",
  );

  await assert.rejects(
    () =>
      resolveFeedUrlFromRuntimeEnv({
        feedUrlRef: "https://feeds.example/secret.xml",
        lookup: () => "https://feeds.example/secret.xml",
      }),
    (error) => error instanceof FeedUrlResolveError && error.safeCode === "feed_url_ref_invalid",
  );
});

test("System Gateway loads feedUrlRef without other feed fields", async () => {
  const payload = {
    async findByID(args) {
      assert.equal(args.collection, "feed-sources");
      assert.equal(args.overrideAccess, true);
      assert.deepEqual(args.select, { feedUrlRef: true });
      assert.equal(args.id, "101");
      return { feedUrlRef: "FEED_URL_PRIMARY", lastEtag: "must-not-be-selected" };
    },
  };

  assert.equal(await loadFeedSourceUrlRef(payload, "101"), "FEED_URL_PRIMARY");
});

test("resolve-feed-url stage writes feedUrl into pipeline state and does not continue on missing env", async () => {
  const resolved = await runIngestPipeline({
    handlers: {
      "claim-running": createImportFeedClaimHandler(async () => true),
      "resolve-feed-url": createResolveFeedUrlHandler({
        loadFeedUrlRef: async () => "FEED_URL_PRIMARY",
        lookupEnv: (name) => (name === "FEED_URL_PRIMARY" ? "https://feeds.example/primary.xml" : undefined),
      }),
    },
    input: { feedSourceId: "101", importRunId: "501" },
  });

  assert.deepEqual(resolved, {
    completedStages: ["claim-running", "resolve-feed-url"],
    pendingStage: "fetch",
    status: "running",
    state: { feedUrl: "https://feeds.example/primary.xml" },
  });

  const failed = await runIngestPipeline({
    handlers: {
      "claim-running": createImportFeedClaimHandler(async () => true),
      "resolve-feed-url": createResolveFeedUrlHandler({
        loadFeedUrlRef: async () => "FEED_URL_PRIMARY",
        lookupEnv: () => undefined,
      }),
    },
    input: { feedSourceId: "101", importRunId: "501" },
  });

  assert.equal(failed.status, "failed");
  assert.equal(failed.state.feedUrl, undefined);
});

test("importFeed composition resolves feedUrlRef through runtime lookup and never persists a URL", async () => {
  const writes = [];
  const payload = {
    async update(args) {
      writes.push(args);
      return { docs: [{ id: "501" }] };
    },
    async findByID(args) {
      assert.deepEqual(args.select, { feedUrlRef: true });
      return { feedUrlRef: "FEED_URL_PRIMARY" };
    },
  };

  const result = await runIngestPipeline({
    handlers: createImportFeedPipelineHandlers(payload, (name) =>
      name === "FEED_URL_PRIMARY" ? "https://feeds.example/primary.xml" : undefined,
    ),
    input: { feedSourceId: "101", importRunId: "501" },
  });

  assert.equal(result.status, "running");
  assert.equal(result.state.feedUrl, "https://feeds.example/primary.xml");
  assert.equal(result.pendingStage, "fetch");
  assert.equal(
    JSON.stringify(writes).includes("https://feeds.example/primary.xml"),
    false,
  );
});

test("importFeed job lazy-loads runtime env instead of storing feed URLs", () => {
  const source = readFileSync(new URL("../src/project/jobs/imports/import-feed.ts", import.meta.url), "utf8");
  assert.match(source, /await import\("\.\.\/\.\.\/env\.ts"\)/);
  assert.match(source, /lookupRuntimeEnv/);
  assert.equal(source.includes("feedUrl:"), false);
});
