import assert from "node:assert/strict";
import test from "node:test";

import {
  embeddedFeedSourceMarket,
  feedMarketMismatchError,
  feedOriginIdentityError,
  mergeFeedPropertyIdentity,
} from "../src/core/catalog/feed-property-invariants.ts";
import { Properties } from "../src/project/collections/properties.ts";

test("manual origin is not constrained by feed identity fields", () => {
  assert.equal(feedOriginIdentityError({ origin: "manual", market: "secondary" }), null);
});

test("feed origin requires feedSource, externalId and importHash after successful import", () => {
  assert.match(feedOriginIdentityError({ origin: "feed" }) ?? "", /feedSource/);
  assert.match(
    feedOriginIdentityError({ origin: "feed", feedSource: "feed-a" }) ?? "",
    /externalId/,
  );
  assert.match(
    feedOriginIdentityError({ origin: "feed", externalId: "ext-1", feedSource: 12 }) ?? "",
    /importHash/,
  );
  assert.equal(
    feedOriginIdentityError({
      origin: "feed",
      externalId: "ext-1",
      feedSource: 12,
      importHash: "abc",
      market: "newbuild",
    }),
    null,
  );
});

test("feed property market must match the owning feed source market", () => {
  assert.match(feedMarketMismatchError("secondary", "newbuild") ?? "", /must match/);
  assert.equal(feedMarketMismatchError("newbuild", "newbuild"), null);
  assert.equal(embeddedFeedSourceMarket({ id: 3, market: "secondary" }), "secondary");
});

test("partial updates keep previously stored feed identity", () => {
  const merged = mergeFeedPropertyIdentity(
    {
      origin: "feed",
      externalId: "ext-1",
      feedSource: "feed-a",
      importHash: "hash-1",
      market: "newbuild",
    },
    { title: "Updated" },
  );
  assert.equal(feedOriginIdentityError(merged), null);
});

test("properties collection enforces feed invariants before validate", async () => {
  const hook = Properties.hooks?.beforeValidate?.[0];
  assert.equal(typeof hook, "function");
  await assert.rejects(
    () => hook({ data: { origin: "feed", title: "X" }, originalDoc: undefined, req: { payload: {} } }),
    /feedSource/,
  );
  await assert.rejects(
    () =>
      hook({
        data: {
          origin: "feed",
          externalId: "ext-1",
          feedSource: { id: 9, market: "newbuild" },
          importHash: "hash",
          market: "secondary",
        },
        originalDoc: undefined,
        req: { payload: {} },
      }),
    /must match/,
  );
  const payload = {
    findByID: async () => ({ market: "newbuild" }),
  };
  const saved = await hook({
    data: {
      origin: "feed",
      externalId: "ext-1",
      feedSource: 9,
      importHash: "hash",
      market: "newbuild",
    },
    originalDoc: undefined,
    req: { payload },
  });
  assert.equal(saved.origin, "feed");
});
