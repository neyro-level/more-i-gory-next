import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import { parseFeedStreamByRegistry } from "../src/core/ingest/parsers/registry.ts";

const xml = "<?xml version=\"1.0\"?><yml_catalog><shop><offers><offer id=\"1\"><name>Море</name></offer></offers></shop></yml_catalog>";

async function* chunks(bytes, size) {
  for (let offset = 0; offset < bytes.byteLength; offset += size) {
    yield bytes.slice(offset, offset + size);
  }
}

test("streaming parser decodes, hashes and feeds SAX incrementally", async () => {
  const bytes = new TextEncoder().encode(xml);
  const result = await parseFeedStreamByRegistry({ body: chunks(bytes, 7), parser: "yrl" });

  assert.equal(result.suspicious, false);
  assert.equal(result.offers[0].externalId, "1");
  assert.equal(result.feedHash, createHash("sha256").update(bytes).digest("hex"));
});

test("feed runtime has no full-body decode or buffered outbound request", () => {
  const fetchSource = readFileSync(new URL("../src/core/ingest/fetch-feed.ts", import.meta.url), "utf8");
  const parseSource = readFileSync(new URL("../src/core/ingest/parse-feed.ts", import.meta.url), "utf8");
  assert.match(fetchSource, /requestStream\(/);
  assert.doesNotMatch(fetchSource, /outbound\.request\(/);
  assert.doesNotMatch(parseSource, /decodeFeedXml|Uint8Array\)\s*:\s*string/);
});

test("forbidden declarations are detected across byte chunk boundaries", async () => {
  const bytes = new TextEncoder().encode("<!DOC" + "TYPE yml_catalog><yml_catalog/>");
  const result = await parseFeedStreamByRegistry({ body: chunks(bytes, 5), parser: "yrl" });
  assert.equal(result.suspicious, true);
  assert.equal(result.issues[0].code, "xml-declarations-forbidden");
});
