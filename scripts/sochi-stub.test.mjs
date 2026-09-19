import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const registry = JSON.parse(readFileSync("src/seo/registry.json", "utf8"));
const { regionDtos } = await import("../src/content/regions/region-dtos.ts");
const landingPages = [];

test("Sochi is a noindex stub outside sitemap", () => {
  const sochi = registry.find((entry) => entry.pageId === "PAGE-003");

  assert.equal(sochi.canonical, "/investicionnaya-nedvizhimost/sochi/");
  assert.equal(sochi.index, "noindex");
  assert.equal(sochi.sitemap, "no");
  assert.match(sochi.h1, /регион в проработке/i);
});

test("removed Sochi PAGE-004/005/006 routes cannot return as static pages", () => {
  const removedPageIds = new Set(["PAGE-004", "PAGE-005", "PAGE-006"]);

  assert.equal(registry.some((entry) => removedPageIds.has(entry.pageId)), false);
  assert.equal(landingPages.some((entry) => removedPageIds.has(entry.pageId)), false);
  assert.equal(regionDtos.find((entry) => entry.id === "region-sochi").childPageIds.length, 0);
  assert.equal(existsSync("src/app/(site)/investicionnaya-nedvizhimost/sochi/novostroyki/page.tsx"), false);
  assert.equal(existsSync("src/app/(site)/investicionnaya-nedvizhimost/sochi/apartamenty/page.tsx"), false);
  assert.equal(existsSync("src/app/(site)/investicionnaya-nedvizhimost/sochi/adler/page.tsx"), false);
});

test("Sochi stub page renders honest copy and CTA", () => {
  const source = readFileSync("src/app/(site)/investicionnaya-nedvizhimost/sochi/page.tsx", "utf8");

  assert.match(source, /robots:\s*"noindex-follow"/);
  assert.match(source, /Регион в проработке/);
  assert.match(source, /\/podbor\//);
});

test("CMS-backed hub and catch-all keep Sochi as a dedicated noindex stub without a child cluster", () => {
  const hubReader = readFileSync("src/core/data-access/public/regions.ts", "utf8");
  assert.match(hubReader, /status !== "stub"/);
  assert.match(hubReader, /slug !== "sochi"/);

  const catchAll = readFileSync("src/app/(site)/investicionnaya-nedvizhimost/[...path]/page.tsx", "utf8");
  assert.match(catchAll, /region\.status === "stub"/);

  const seed = readFileSync("src/content/regions/region-seed-content.ts", "utf8");
  assert.match(seed, /status: "stub"/);
});
