import assert from "node:assert/strict";
import test from "node:test";

import {
  assertBreadcrumbAgreement,
  inspectSeoDocument,
  parseSitemapLocations,
} from "./lib/seo-crawl-invariants.mjs";

test("sitemap parser returns exact crawl targets", () => {
  assert.deepEqual(parseSitemapLocations("<urlset><url><loc>https://example.test/</loc></url><url><loc>https://example.test/obekty/a/</loc></url></urlset>"), [
    "https://example.test/",
    "https://example.test/obekty/a/",
  ]);
});

test("SEO document inspection exposes canonical robots H1 and server-rendered links", () => {
  const document = inspectSeoDocument(`<!doctype html><html><head><title>Title</title><meta name="description" content="Description"><meta name="robots" content="index, follow"><link rel="canonical" href="https://example.test/krym/"></head><body><h1>Крым</h1><a href="/obekty/">Объекты</a></body></html>`);
  assert.deepEqual(document, {
    breadcrumbNames: [],
    breadcrumbVisibleText: "",
    canonical: "https://example.test/krym/",
    description: "Description",
    h1s: ["Крым"],
    internalLinks: ["/obekty/"],
    robots: "index, follow",
    title: "Title",
  });
});

test("visible breadcrumbs and JSON-LD must share the same names", () => {
  const html = `<nav aria-label="breadcrumb"><ol><li>Главная</li><li>Объекты</li><li>Проект</li></ol></nav><script type="application/ld+json">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"name":"Главная"},{"name":"Объекты"},{"name":"Проект"}]}</script>`;
  assert.doesNotThrow(() => assertBreadcrumbAgreement(inspectSeoDocument(html), "/obekty/project/"));
  assert.throws(() => assertBreadcrumbAgreement(inspectSeoDocument(html.replace("Проект</li>", "Другой</li>")), "/obekty/project/"), /disagree/);
});
