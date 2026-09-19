import assert from "node:assert/strict";
import test from "node:test";

import { planCatalogLifecycle } from "../src/core/catalog/lifecycle.ts";
import { catalogLifecycle } from "../src/core/data-access/system/catalog-lifecycle.ts";

test("catalog lifecycle keeps recent archived objects noindex and expires old ones to 410 without listing 301", () => {
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
    kind: "gone",
    status: 410,
  });
});

test("catalog lifecycle plans a unique 301 when one published replacement matches type and region", () => {
  const plan = planCatalogLifecycle(
    [
      {
        deactivatedAt: "2026-06-01T00:00:00.000Z",
        id: 2,
        market: "secondary",
        region: "sochi",
        slug: "expired-archive",
        status: "archived",
      },
    ],
    new Date("2026-09-17T00:00:00.000Z"),
    [
      {
        market: "secondary",
        region: "sochi",
        slug: "live-replacement",
      },
    ],
  );

  assert.deepEqual(plan.entries[0]?.action, {
    kind: "redirect",
    status: 301,
    target: "/obekty/live-replacement/",
  });
});

test("catalog lifecycle system task loads published candidates and executes unique 301 redirects", async () => {
  const findCalls = [];
  const createCalls = [];
  const payload = {
    async create(args) {
      createCalls.push(args);
      return { id: "redirect-1" };
    },
    async find(args) {
      findCalls.push(args);
      if (args.collection === "redirects") return { docs: [] };
      const statusEquals = args.where.and.find((clause) => clause.status)?.status.equals;
      if (statusEquals === "active") {
        return {
          docs: [
            {
              id: "live-1",
              market: "secondary",
              region: "sochi",
              slug: "live-replacement",
              status: "active",
            },
          ],
        };
      }
      return {
        docs: [
          {
            deactivatedAt: "2026-06-01T00:00:00.000Z",
            id: "archive-1",
            market: "secondary",
            region: "sochi",
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

  assert.equal(findCalls.filter((call) => call.collection === "properties").length, 2);
  assert.equal(findCalls[0].overrideAccess, true);
  assert.deepEqual(findCalls[0].where, {
    and: [
      { origin: { equals: "manual" } },
      { status: { equals: "archived" } },
      { publishedAt: { exists: true } },
    ],
  });
  assert.deepEqual(findCalls[1].where, {
    and: [
      { origin: { equals: "manual" } },
      { status: { equals: "active" } },
      { publishedAt: { exists: true } },
    ],
  });
  assert.deepEqual(createCalls, [
    {
      collection: "redirects",
      data: {
        destination: "/obekty/live-replacement/",
        permanent: true,
        source: "/obekty/expired-archive/",
      },
      overrideAccess: true,
    },
  ]);
});

test("410 archive URLs are exported for the owner queue without listing redirects", async () => {
  const { archiveGonePaths, formatArchiveGoneOwnerQueue } = await import("../src/core/catalog/archive-gone-queue.ts");
  const { planCatalogLifecycle } = await import("../src/core/catalog/lifecycle.ts");
  const plan = planCatalogLifecycle(
    [
      {
        deactivatedAt: "2026-06-01T00:00:00.000Z",
        id: 2,
        slug: "expired-archive",
        status: "archived",
      },
    ],
    new Date("2026-09-17T00:00:00.000Z"),
  );

  assert.deepEqual(archiveGonePaths(plan.entries), ["/obekty/expired-archive/"]);
  const report = formatArchiveGoneOwnerQueue(archiveGonePaths(plan.entries));
  assert.match(report, /TASK 28.4 — Archived 410 URLs/);
  assert.match(report, /\/obekty\/expired-archive\//);
  assert.match(report, /без массового редиректа/);
});
