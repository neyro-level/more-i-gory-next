import assert from "node:assert/strict";
import test from "node:test";

import { applyFeedFieldOwnership, decideFeedFieldWrite } from "../src/core/ingest/field-ownership.ts";

test("manual property wins and feed cannot update it", () => {
  assert.deepEqual(
    decideFeedFieldWrite({
      currentValue: "manual title",
      importingFeedSourceId: "feed-a",
      record: { feedSource: null, origin: "manual" },
    }),
    { allow: false, reason: "manual-origin" },
  );
});

test("explicit manual field owner wins over feed ownership", () => {
  assert.deepEqual(
    decideFeedFieldWrite({
      currentValue: "owner title",
      explicitOwner: { kind: "manual" },
      importingFeedSourceId: "feed-a",
      record: { feedSource: "feed-a", origin: "feed" },
    }),
    { allow: false, reason: "manual-field-owner" },
  );
});

test("explicit feed owner allows only the same feed", () => {
  assert.deepEqual(
    decideFeedFieldWrite({
      currentValue: "old",
      explicitOwner: { feedSourceId: "feed-a", kind: "feed" },
      importingFeedSourceId: "feed-a",
      record: { feedSource: "feed-b", origin: "feed" },
    }),
    { allow: true, reason: "explicit-feed-owner" },
  );
  assert.deepEqual(
    decideFeedFieldWrite({
      currentValue: "old",
      explicitOwner: { feedSourceId: "feed-b", kind: "feed" },
      importingFeedSourceId: "feed-a",
      record: { feedSource: "feed-a", origin: "feed" },
    }),
    { allow: false, reason: "different-explicit-feed-owner" },
  );
});

test("owning feed can update populated fields but another feed cannot", () => {
  assert.deepEqual(
    decideFeedFieldWrite({
      currentValue: "old",
      importingFeedSourceId: "feed-a",
      record: { feedSource: "feed-a", origin: "feed" },
    }),
    { allow: true, reason: "owning-feed" },
  );
  assert.deepEqual(
    decideFeedFieldWrite({
      currentValue: "old",
      importingFeedSourceId: "feed-a",
      record: { feedSource: "feed-b", origin: "feed" },
    }),
    { allow: false, reason: "different-owning-feed" },
  );
});

test("empty field can be filled by incoming feed when no stronger owner exists", () => {
  assert.deepEqual(
    decideFeedFieldWrite({
      currentValue: "",
      importingFeedSourceId: "feed-a",
      record: { feedSource: "feed-b", origin: "feed" },
    }),
    { allow: true, reason: "empty-field" },
  );
});

test("field ownership filter returns patch plus denied evidence", () => {
  const result = applyFeedFieldOwnership({
    current: {
      description: "",
      priceMinor: 10,
      title: "Manual title",
    },
    explicitOwners: {
      title: { kind: "manual" },
    },
    importingFeedSourceId: "feed-a",
    incoming: {
      description: "Filled by feed",
      priceMinor: 20,
      title: "Feed title",
    },
    record: { feedSource: "feed-b", origin: "feed" },
  });

  assert.deepEqual(result.patch, { description: "Filled by feed" });
  assert.deepEqual(result.denied, [
    { field: "priceMinor", reason: "different-owning-feed" },
    { field: "title", reason: "manual-field-owner" },
  ]);
});
