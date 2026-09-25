import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const runtime = { NEXT_PUBLIC_SERVER_URL: "https://preview.example.test" };
Object.assign(process.env, {
  AMS_PROFILE: "REALTY_BASE",
  DATABASE_URI: "postgresql://verify:verify@127.0.0.1:5432/runtime_seo_test",
  JOBS_AUTORUN: "false",
  NEXT_PUBLIC_LEADS_ENABLED: "false",
  NEXT_PUBLIC_SERVER_URL: runtime.NEXT_PUBLIC_SERVER_URL,
  PAYLOAD_SECRET: "ci-validation-only-payload-secret-not-for-production",
  TZ: "Europe/Moscow",
});

const { buildPageMetadata, sourceFromSeoEntry } = await import("../src/seo/page-metadata.ts");
const { buildRobotsPolicy } = await import("../src/seo/robots-policy.ts");
const { articleStructuredData, siteStructuredData } = await import("../src/seo/structured-data.ts");

test("robots fail closed outside production and production protects private namespaces", () => {
  assert.deepEqual(buildRobotsPolicy("staging", runtime), { rules: { userAgent: "*", disallow: "/" } });
  assert.deepEqual(buildRobotsPolicy(undefined, runtime), { rules: { userAgent: "*", disallow: "/" } });
  assert.deepEqual(buildRobotsPolicy("production", runtime), {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
    sitemap: "https://preview.example.test/sitemap.xml",
  });
});

test("home and catalog metadata use exact runtime canonical and the default OG image", () => {
  const previous = process.env.NEXT_PUBLIC_SERVER_URL;
  process.env.NEXT_PUBLIC_SERVER_URL = runtime.NEXT_PUBLIC_SERVER_URL;
  try {
    for (const entry of [
      { pageId: "PAGE-001", canonical: "/", title: "Главная | Море и Горы" },
      { pageId: "PAGE-014", canonical: "/obekty/", title: "Объекты | Море и Горы" },
    ]) {
      Object.assign(entry, {
        contentGate: "Проверенный content gate для тестового контракта",
        description: "Проверенное описание страницы достаточной длины для SEO-контракта.",
        h1: "Проверенный заголовок",
        index: "yes",
        kind: "static",
        ogImage: "/images/og/default.webp",
        primaryQuery: "инвестиционная недвижимость",
        priority: "P1",
        secondaryQueries: [],
        sitemap: "yes",
      });
      const metadata = buildPageMetadata(sourceFromSeoEntry(entry, "production"));
      assert.equal(metadata.alternates.canonical, entry.canonical);
      assert.equal(metadata.openGraph.url, new URL(entry.canonical, runtime.NEXT_PUBLIC_SERVER_URL).toString());
      assert.equal(metadata.openGraph.images[0].url, "https://preview.example.test/images/og/default.webp");
      assert.equal(metadata.twitter.card, "summary_large_image");
      assert.doesNotMatch(metadata.title, /\|\s*Море и Горы$/u);
    }
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SERVER_URL;
    else process.env.NEXT_PUBLIC_SERVER_URL = previous;
  }
});

test("home metadata preserves the registry title outside the root layout template", () => {
  const homePage = readFileSync("src/app/(site)/page.tsx", "utf8");

  assert.match(homePage, /const homeSeo = getSeoEntry\("PAGE-001"\)/);
  assert.match(homePage, /title: \{ absolute: homeSeo\.title \}/);
});

test("runtime verification applies the layout title template to nested routes", () => {
  const runtimeVerification = readFileSync("scripts/verify-runtime.mjs", "utf8");

  assert.match(runtimeVerification, /if \(pathname === "\/"\) return entry\.title/);
  assert.match(runtimeVerification, /return `\$\{pageTitle\} \| Море и Горы`/);
});

test("both 404 boundaries declare noindex metadata and an explicit title", () => {
  const globalNotFound = readFileSync("src/app/global-not-found.tsx", "utf8");
  const siteNotFound = readFileSync("src/app/(site)/not-found.tsx", "utf8");

  assert.match(globalNotFound, /title: "Страница не найдена \| Море и Горы"/);
  assert.match(siteNotFound, /title: "Страница не найдена"/);
  assert.match(globalNotFound, /robots: \{ follow: true, index: false \}/);
  assert.match(siteNotFound, /robots: \{ follow: true, index: false \}/);
});

test("structured data stays factual and Article exists only for published content", () => {
  const graph = siteStructuredData(runtime);
  assert.equal(graph[0].legalName, "Индивидуальный предприниматель Колобова Ольга Викторовна");
  assert.equal(graph[1].publisher["@id"], "https://preview.example.test/#organization");

  const fixture = { description: "Проверенное описание", path: "/analitika/proof/", title: "Материал | Море и Горы" };
  assert.equal(articleStructuredData({ ...fixture, status: "draft" }), null);
  const previous = process.env.NEXT_PUBLIC_SERVER_URL;
  process.env.NEXT_PUBLIC_SERVER_URL = runtime.NEXT_PUBLIC_SERVER_URL;
  try {
    assert.equal(articleStructuredData({ ...fixture, status: "published" }).mainEntityOfPage, "https://preview.example.test/analitika/proof/");
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SERVER_URL;
    else process.env.NEXT_PUBLIC_SERVER_URL = previous;
  }
});
