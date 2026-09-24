import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

import { regionSchema } from "@more-i-gory/contracts";
import { z } from "zod";

import { createPublicGateway } from "../src/core/data-access/public/gateway.ts";

const inputSchema = z.object({ slug: z.string().min(1) });
const select = {
  childPageIds: true,
  heroMediaId: true,
  id: true,
  investmentThesis: true,
  lead: true,
  pageId: true,
  parentPageId: true,
  path: true,
  primaryQuery: true,
  riskSummary: true,
  slug: true,
  status: true,
  title: true,
};

function region(status, extra = {}) {
  return {
    childPageIds: [],
    heroMediaId: "media-crimea",
    id: `region-${status}`,
    investmentThesis: "Инвестиционный тезис достаточной длины.",
    lead: "Описание региона достаточной длины.",
    pageId: "PAGE-101",
    path: "/investicionnaya-nedvizhimost/krym/",
    primaryQuery: "инвестиционная недвижимость Крыма",
    riskSummary: "Проверяемые риски достаточной длины.",
    slug: "krym",
    status,
    title: "Крым",
    ...extra,
  };
}

function createGateway(read) {
  return createPublicGateway({
    depth: 1,
    inputSchema,
    isPublished: (document) => document.status === "published",
    limit: 20,
    map: (document) => ({ ...document }),
    outputSchema: regionSchema,
    publicationWhere: ({ slug }) => ({
      and: [{ status: { equals: "published" } }, { slug: { equals: slug } }],
    }),
    read,
    select,
  });
}

test("Public Gateway is protected by the server-only marker", () => {
  const result = spawnSync(
    process.execPath,
    ["--input-type=module", "--eval", "import('./src/core/data-access/public/gateway.ts')"],
    { cwd: process.cwd(), encoding: "utf8" },
  );

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /cannot be imported from a Client Component/);
});

test("Public Gateway uses explicit safe query options and returns DTOs only", async () => {
  let capturedQuery;
  const gateway = createGateway(async (query) => {
    capturedQuery = query;
    return {
      docs: [
        region("draft"),
        region("published", {
          cadastralNumber: "private-value",
          rawPayload: { source: "must-not-leak" },
        }),
      ],
    };
  });

  const result = await gateway.findMany({ slug: "krym" });

  assert.deepEqual(capturedQuery, {
    depth: 1,
    limit: 20,
    overrideAccess: false,
    pagination: false,
    select,
    where: {
      and: [{ status: { equals: "published" } }, { slug: { equals: "krym" } }],
    },
  });
  assert.equal(result.length, 1);
  assert.equal(result[0].status, "published");
  assert.equal("cadastralNumber" in result[0], false);
  assert.equal("rawPayload" in result[0], false);
});

test("Public Gateway validates input before invoking the read port", async () => {
  let called = false;
  const gateway = createGateway(async () => {
    called = true;
    return { docs: [] };
  });

  await assert.rejects(() => gateway.findMany({ slug: "" }), z.ZodError);
  assert.equal(called, false);
});

test("Public Gateway propagates access denied without privileged fallback", async () => {
  const denied = new Error("access denied");
  const gateway = createGateway(async (query) => {
    assert.equal(query.overrideAccess, false);
    throw denied;
  });

  await assert.rejects(() => gateway.findMany({ slug: "krym" }), (error) => error === denied);
});

test("publicReadOrThrow logs infrastructure failure and propagates an operational error", async () => {
  const { PUBLIC_READ_FAILED, PublicReadOperationalError, publicReadOrThrow } = await import(
    "../src/core/data-access/public/read-fallback.ts"
  );
  const issues = [];
  const cause = new Error("payload unavailable");
  await assert.rejects(() => publicReadOrThrow({
    logger: {
      error(_message, context) {
        issues.push(context);
      },
    },
    read: async () => {
      throw cause;
    },
    reader: "published-manual-properties",
  }), (error) => {
    assert.equal(error instanceof PublicReadOperationalError, true);
    assert.equal(error.cause, cause);
    assert.equal(error.code, PUBLIC_READ_FAILED);
    assert.equal(error.reader, "published-manual-properties");
    return true;
  });

  assert.deepEqual(issues, [{ code: PUBLIC_READ_FAILED, reader: "published-manual-properties" }]);
});

test("publicReadOrThrow keeps valid zero-row reads distinct from infrastructure failure", async () => {
  const { publicReadOrThrow } = await import("../src/core/data-access/public/read-fallback.ts");
  let logged = false;
  const result = await publicReadOrThrow({
    logger: {
      error() {
        logged = true;
      },
    },
    read: async () => [],
    reader: "published-manual-properties",
  });

  assert.deepEqual(result, []);
  assert.equal(logged, false);
});

test("public readers propagate operational failure instead of returning cacheable absence", () => {
  const sources = [
    "src/core/data-access/public/pages.ts",
    "src/core/data-access/public/properties.ts",
    "src/core/data-access/public/site-chrome.ts",
    "src/core/data-access/public/newbuilds.ts",
    "src/core/data-access/public/sitemap-pages.ts",
  ];

  for (const file of sources) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /publicReadOrThrow\(/);
    assert.doesNotMatch(source, /fallback:\s*(null|\[\]|fallbackSiteChrome|listFallbackPublicRegions\(\))/s);
  }
});
