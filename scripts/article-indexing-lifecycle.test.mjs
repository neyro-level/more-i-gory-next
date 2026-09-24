import assert from "node:assert/strict";
import test from "node:test";

import { articleSitemapEntries } from "../src/seo/sitemap-source-contract.ts";

const registry = {
  canonical: "/analitika/[slug]/", contentGate: "editorial", description: "x".repeat(50), h1: "Статья",
  index: "yes", kind: "dynamic", pageId: "PAGE-017", primaryQuery: "аналитика", priority: "P2",
  secondaryQueries: [], sitemap: "yes", title: "Аналитическая статья",
};
const article = { contentGate: "pass", path: "/analitika/test/", registry, status: "published" };

test("article lifecycle requires publication and its own content gate", () => {
  assert.deepEqual(articleSitemapEntries([{ ...article, status: "draft" }]), []);
  assert.deepEqual(articleSitemapEntries([{ ...article, status: "review" }]), []);
  assert.deepEqual(articleSitemapEntries([{ ...article, contentGate: "missing" }]), []);
  assert.deepEqual(articleSitemapEntries([{ ...article, status: "archived" }]), []);
  assert.deepEqual(articleSitemapEntries([article]), [{ canonical: "/analitika/test/", priority: "P2" }]);
});

test("PAGE-017 policy cannot open a draft article namespace", async () => {
  process.env.AMS_PROFILE = "REALTY_BASE";
  process.env.TZ = "Europe/Moscow";
  process.env.DATABASE_URI = "postgresql://test:test@127.0.0.1:5432/test";
  process.env.PAYLOAD_SECRET = "test-secret-that-is-long-enough-for-validation";
  process.env.NEXT_PUBLIC_SERVER_URL = "http://127.0.0.1:3000";
  const { sourceFromArticle } = await import("../src/seo/page-metadata.ts");
  const source = sourceFromArticle({
    canonical: article.path, contentGate: "missing", description: "Draft", registry,
    status: "draft", title: "Draft article",
  });
  assert.equal(source.robots, "noindex-follow");
});
