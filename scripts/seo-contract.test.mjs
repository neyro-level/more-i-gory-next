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

test("SEO validator no longer pins registry to exactly 23 entries", () => {
  const source = readFileSync("scripts/validate-seo.mjs", "utf8");

  assert.equal(source.includes("=== 23"), false);
  assert.equal(source.includes("got ${entries.length}"), false);
});
