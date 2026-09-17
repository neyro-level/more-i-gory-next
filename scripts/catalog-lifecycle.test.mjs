import assert from "node:assert/strict";
import test from "node:test";

import { planCatalogLifecycle } from "../src/core/catalog/lifecycle.ts";
import { catalogLifecycle } from "../src/core/data-access/system/catalog-lifecycle.ts";

test("catalog lifecycle keeps recent archived objects noindex and expires old ones to catalog hub", () => {
  const plan = planCatalogLifecycle(
    [
      {
        deactivatedAt: "2026-09-01T00:00:00.000Z",
        id: 1,
        slug: "recent-archive",
        status: "archived",
      },
      {
        deactivatedAt: "2026-06-01T00:00:00.000Z",
        id: 2,
        slug: "expired-archive",
        status: "archived",
      },
    ],
    new Date("2026-09-17T00:00:00.000Z"),
  );

  assert.equal(plan.retentionDays, 60);
  assert.equal(plan.retained, 1);
  assert.equal(plan.expired, 1);
  assert.deepEqual(plan.entries[0]?.action, { kind: "serve-noindex" });
  assert.deepEqual(plan.entries[1]?.action, {
    kind: "redirect",
    status: 301,
    target: "/obekty/",
  });
});

test("catalog lifecycle system task scans only published manual archived properties", async () => {
  const findCalls = [];
  const payload = {
    async find(args) {
      findCalls.push(args);
      return {
        docs: [
          {
            deactivatedAt: "2026-06-01T00:00:00.000Z",
            id: "archive-1",
            slug: "expired-archive",
            status: "archived",
          },
        ],
      };
    },
  };

  assert.deepEqual(
    await catalogLifecycle(payload, new Date("2026-09-17T00:00:00.000Z")),
    { expired: 1, retained: 0 },
  );

  assert.equal(findCalls.length, 1);
  assert.equal(findCalls[0].collection, "properties");
  assert.equal(findCalls[0].overrideAccess, true);
  assert.deepEqual(findCalls[0].where, {
    and: [
      { origin: { equals: "manual" } },
      { status: { equals: "archived" } },
      { publishedAt: { exists: true } },
    ],
  });
});
