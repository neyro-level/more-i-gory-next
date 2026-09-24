import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { assertPublishedSeo, seoFields } from "../src/project/fields/seo.ts";

process.env.AMS_PROFILE ??= "REALTY_BASE";
process.env.TZ ??= "Europe/Moscow";
process.env.JOBS_AUTORUN ??= "false";
process.env.DATABASE_URI ??= "postgresql://verify:verify@127.0.0.1:5432/moreigori_verify";
process.env.PAYLOAD_SECRET ??= "ci-validation-only-payload-secret-not-for-production";
process.env.NEXT_PUBLIC_SERVER_URL ??= "http://127.0.0.1:4311";

test("CMS SEO field group exposes the approved contract", () => {
  const names = seoFields.fields.map((field) => field.name);

  assert.deepEqual(names, ["title", "description", "canonicalOverride", "ogImagePath", "robots", "priority"]);
});

test("published CMS pages fail without SEO title and description", () => {
  assert.throws(() => assertPublishedSeo({ status: "published", seo: { title: "", description: "ok" } }), /requires seo/);
  assert.throws(() => assertPublishedSeo({ status: "published", seo: { title: "ok", description: "" } }), /requires seo/);
  assert.doesNotThrow(() => assertPublishedSeo({ status: "published", seo: { title: "ok", description: "ok" } }));
  assert.doesNotThrow(() => assertPublishedSeo({ status: "draft" }));
});

test("buildPageMetadata supports CMS-style source and noindex robots", async () => {
  const { buildPageMetadata } = await import("../src/seo/page-metadata.ts");
  const metadata = buildPageMetadata({
    canonical: "/cms-page/",
    description: "CMS description",
    ogImagePath: "/images/og/default.webp",
    robots: "noindex-follow",
    title: "CMS title",
  });

  assert.equal(metadata.title, "CMS title");
  assert.deepEqual(metadata.robots, { follow: true, index: false });
  assert.equal(metadata.alternates?.canonical, "/cms-page/");
  assert.deepEqual(metadata.openGraph?.images, ["http://127.0.0.1:4311/images/og/default.webp"]);
});

test("technical query state stays noindex with the clean registry canonical", async () => {
  const { sourceFromSeoEntry } = await import("../src/seo/page-metadata.ts");
  const source = sourceFromSeoEntry({
    canonical: "/obekty/",
    contentGate: "fixture",
    description: "Curated catalog",
    h1: "Objects",
    index: "yes",
    kind: "static",
    pageId: "TEST-CATALOG",
    primaryQuery: "objects",
    priority: "P1",
    secondaryQueries: [],
    sitemap: "yes",
    title: "Objects",
  }, "production", { technical: true });

  assert.equal(source.canonical, "/obekty/");
  assert.equal(source.robots, "noindex-follow");
});

test("manual passport metadata uses facts only: title, description, canonical, robots, OG and JSON-LD", async () => {
  const { buildPassportPageMetadata, passportStructuredData } = await import("../src/seo/passport-metadata.ts");
  const property = {
    description: "Подтверждённый инвестиционный тезис по фактам паспорта.",
    facts: [{ label: "Документы", value: "ЕГРН проверен." }],
    image: { src: "/images/projects/sample-resort/cover.webp" },
    path: "/obekty/yalta-passport/",
    status: "active",
    title: "Квартира в Ялте",
    verdict: "Подходит для ручного разбора.",
    verifiedAt: "2026-09-20T00:00:00.000Z",
  };

  const metadata = buildPassportPageMetadata(property);
  assert.equal(metadata.title, "Квартира в Ялте");
  assert.equal(metadata.description, "Подтверждённый инвестиционный тезис по фактам паспорта.");
  assert.equal(metadata.alternates?.canonical, "/obekty/yalta-passport/");
  assert.deepEqual(metadata.robots, { follow: true, index: true });
  assert.equal(metadata.openGraph?.title, "Квартира в Ялте");
  assert.deepEqual(metadata.openGraph?.images, ["http://127.0.0.1:4311/images/projects/sample-resort/cover.webp"]);

  const jsonLd = passportStructuredData(property);
  assert.equal(jsonLd["@type"], "RealEstateListing");
  assert.equal(jsonLd.name, "Квартира в Ялте");
  assert.equal(jsonLd.description, "Подтверждённый инвестиционный тезис по фактам паспорта.");
  assert.deepEqual(jsonLd.additionalProperty, [{ "@type": "PropertyValue", name: "Документы", value: "ЕГРН проверен." }]);
  assert.equal(jsonLd.dateModified, "2026-09-20T00:00:00.000Z");
  assert.equal("offers" in jsonLd, false);
  assert.equal(JSON.stringify(jsonLd).includes("15 000 000"), false);
});

test("archived passport metadata stays noindex and still uses only passport facts", async () => {
  const { buildPassportPageMetadata, passportStructuredData } = await import("../src/seo/passport-metadata.ts");
  const metadata = buildPassportPageMetadata({
    facts: [{ label: "Статус", value: "Снят с подборки." }],
    path: "/obekty/archived-passport/",
    status: "archived",
    title: "Архивный объект",
    verdict: "Больше не актуален.",
  });

  assert.deepEqual(metadata.robots, { follow: true, index: false });
  assert.equal(metadata.title, "Архивный объект");
  assert.equal(passportStructuredData({
    facts: [{ label: "Статус", value: "Снят с подборки." }],
    path: "/obekty/archived-passport/",
    status: "archived",
    title: "Архивный объект",
    verdict: "Больше не актуален.",
  }).offers, undefined);
});

test("SEO validator no longer pins registry to exactly 23 entries", () => {
  const source = readFileSync("scripts/validate-seo.mjs", "utf8");

  assert.equal(source.includes("=== 23"), false);
  assert.equal(source.includes("got ${entries.length}"), false);
});
