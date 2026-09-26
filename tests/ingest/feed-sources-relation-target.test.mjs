import assert from "node:assert/strict";
import test from "node:test";

import { FeedSources } from "../../src/project/collections/feed-sources.ts";
import { Properties } from "../../src/project/collections/properties.ts";

test("feed-sources exists as owner-only relation target for properties.feedSource", () => {
  assert.equal(FeedSources.slug, "feed-sources");
  assert.equal(FeedSources.access.read, FeedSources.access.create);
  assert.equal(FeedSources.versions, false);

  const feedSource = Properties.fields.find((field) => field.name === "feedSource");
  assert.equal(feedSource?.relationTo, FeedSources.slug);
});
