import assert from "node:assert/strict";
import test from "node:test";

import { parseFeedByRegistry, resolveFeedParserSlug } from "../src/core/ingest/parsers/registry.ts";

const validYrl = `<?xml version="1.0" encoding="UTF-8"?>
<yml_catalog>
  <shop>
    <offers>
      <offer id="flat-1">
        <name>Апартамент у моря</name>
        <price>12500000</price>
        <address>Ялта, Набережная</address>
      </offer>
      <offer id="flat-2">
        <title>Видовой номер</title>
      </offer>
    </offers>
  </shop>
</yml_catalog>`;

test("feed parser registry resolves supported YRL aliases", () => {
  assert.equal(resolveFeedParserSlug("yrl"), "yrl");
  assert.equal(resolveFeedParserSlug(" XML-YRL "), "yrl");
  assert.equal(resolveFeedParserSlug("yandex-realty"), "yrl");
  assert.equal(resolveFeedParserSlug("unknown"), null);
});

test("YRL parser reads offers through the registry without marking a healthy local feed suspicious", () => {
  const result = parseFeedByRegistry({ parser: "yrl", xml: validYrl });

  assert.equal(result.parser, "yrl");
  assert.equal(result.suspicious, false);
  assert.equal(result.offeredCount, 2);
  assert.equal(result.skippedCount, 0);
  assert.deepEqual(
    result.offers.map((offer) => [offer.externalId, offer.title]),
    [
      ["flat-1", "Апартамент у моря"],
      ["flat-2", "Видовой номер"],
    ],
  );
});

test("local bad offer is skipped and converted to import-issue shaped warning", () => {
  const result = parseFeedByRegistry({
    parser: "yrl",
    xml: `<yml_catalog><shop><offers><offer><name>Без id</name></offer><offer id="ok"><name>OK</name></offer></offers></shop></yml_catalog>`,
  });

  assert.equal(result.suspicious, false);
  assert.equal(result.offeredCount, 2);
  assert.equal(result.skippedCount, 1);
  assert.equal(result.offers.length, 1);
  assert.deepEqual(result.issues[0], {
    code: "offer-missing-external-id",
    message: "Offer has no stable external identifier and was skipped.",
    path: "offer.@id",
    severity: "warning",
  });
});

test("DTD and entity declarations are forbidden and make the run suspicious", () => {
  const result = parseFeedByRegistry({
    parser: "yrl",
    xml: `<!DOCTYPE yml_catalog [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><yml_catalog>&xxe;</yml_catalog>`,
  });

  assert.equal(result.suspicious, true);
  assert.equal(result.offers.length, 0);
  assert.equal(result.issues[0]?.severity, "critical");
  assert.equal(result.issues[0]?.code, "xml-declarations-forbidden");
});

test("size, depth, offer count and timeout limits produce suspicious critical results", () => {
  assert.equal(
    parseFeedByRegistry({ limits: { maxBytes: 10 }, parser: "yrl", xml: validYrl }).issues[0]?.code,
    "xml-max-size-exceeded",
  );
  assert.equal(
    parseFeedByRegistry({ limits: { maxDepth: 1 }, parser: "yrl", xml: validYrl }).issues[0]?.code,
    "xml-max-depth-exceeded",
  );
  assert.equal(
    parseFeedByRegistry({ limits: { maxOffers: 1 }, parser: "yrl", xml: validYrl }).issues[0]?.code,
    "xml-max-offers-exceeded",
  );

  let ticks = 0;
  const timeout = parseFeedByRegistry({
    limits: { chunkSize: 4, timeoutMs: 1 },
    nowMs: () => {
      ticks += 1;
      return ticks;
    },
    parser: "yrl",
    xml: validYrl,
  });
  assert.equal(timeout.suspicious, true);
  assert.equal(timeout.issues[0]?.code, "xml-parse-timeout");
});

test("unknown parser is blocked before parsing feed body", () => {
  const result = parseFeedByRegistry({ parser: "custom", xml: validYrl });

  assert.equal(result.parser, "unknown");
  assert.equal(result.suspicious, true);
  assert.equal(result.issues[0]?.code, "unknown-parser");
});
