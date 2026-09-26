import assert from "node:assert/strict";
import test from "node:test";

import { loadFeedSourceParser } from "../../src/core/data-access/system/load-feed-source-parser.ts";
import { createParseFeedHandler } from "../../src/core/ingest/parse-feed.ts";

const validYrl = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog>
  <shop>
    <offers>
      <offer id="flat-1">
        <name>Апартамент у моря</name>
      </offer>
    </offers>
  </shop>
</yml_catalog>`;

const forbiddenXml = `<!DOCTYPE yml_catalog [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><yml_catalog>&xxe;</yml_catalog>`;

async function* stream(text) {
  yield new TextEncoder().encode(text);
}

test("System Gateway loads only the parser slug", async () => {
  const payload = {
    async findByID(args) {
      assert.deepEqual(args.select, { parser: true });
      assert.equal(args.overrideAccess, true);
      return { parser: "yrl", feedUrlRef: "must-not-load" };
    },
  };

  assert.equal(await loadFeedSourceParser(payload, "101"), "yrl");
});

test("parse stage uses the YRL registry and continues a healthy feed", async () => {
  const handler = createParseFeedHandler({
    loadParser: async () => "yrl",
  });
  const state = {
    fetch: {
      body: stream(validYrl),
      contentType: "application/xml",
      etag: null,
      lastModified: null,
      previousFeedHash: null,
      status: 200,
    },
  };

  const result = await handler({ input: { feedSourceId: "101" }, state });
  assert.deepEqual(result, { continue: true, status: "running" });
  assert.equal(state.parse.parser, "yrl");
  assert.equal(state.parse.suspicious, false);
  assert.equal(state.parse.offers[0].externalId, "flat-1");
});

test("critical or suspicious parse stops before normalize and upsert", async () => {
  const handler = createParseFeedHandler({
    loadParser: async () => "yrl",
  });
  const state = {
    fetch: {
      body: stream(forbiddenXml),
      contentType: "application/xml",
      etag: null,
      lastModified: null,
      previousFeedHash: null,
      status: 200,
    },
  };

  const result = await handler({ input: { feedSourceId: "101" }, state });
  assert.deepEqual(result, { continue: false, status: "suspicious" });
  assert.equal(state.parse.suspicious, true);
  assert.equal(state.parse.offers.length, 0);
});
