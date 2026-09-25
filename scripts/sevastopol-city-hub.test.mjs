import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildCityHubModel } from "../src/core/regions/city-hub.ts";
import { resolveSeoState } from "../src/seo/seo-state.ts";

const image = { alt: "fixture", height: 1, src: "/images/fallback.svg", width: 1 };
const city = (overrides = {}) => ({
  id: "sevastopol", image,
  investmentThesis: "Самостоятельный проверенный тезис Севастополя описывает круглогодичный городской спрос, ограничения и сценарий владения.",
  kind: "locality", lead: "Проверенный городской рынок без рекламных обещаний.", pageId: "PAGE-009", pageKey: "CITY",
  parentSlug: "krym", path: "/krym/sevastopol/",
  riskSummary: "Проверенные правовые и операционные ограничения рынка, расходов, управления и ликвидности объекта.",
  slug: "sevastopol", status: "published", title: "Севастополь", verifiedAt: "2026-09-24", ...overrides,
});
const project = (overrides = {}) => ({
  facts: [{ label: "Факт", value: "Значение" }],
  geoContext: { cityOrArea: { id: "sevastopol", path: "/krym/sevastopol/", slug: "sevastopol", title: "Севастополь" }, region: { id: "krym", path: "/krym/", slug: "krym", title: "Крым" } },
  id: "project", image, path: "/obekty/sevastopol-project/", publishedAt: "2026-09-24", regionLabel: "Севастополь",
  riskSummary: "risk", slug: "sevastopol-project", sources: [{ label: "source" }], status: "active", title: "Project",
  verdict: "verdict", verifiedAt: "2026-09-24", ...overrides,
});
const openRegistry = { canonical: "/krym/sevastopol/", index: "yes", sitemap: "yes" };

test("Sevastopol gate PASS activates only a complete local market candidate", () => {
  const model = buildCityHubModel(city(), [], [project()]);
  const state = resolveSeoState({ canonical: openRegistry.canonical, contentGate: model.gate.state, publicationStatus: "published", registry: openRegistry, runtimeContour: "production" });
  assert.equal(model.gate.state, "pass");
  assert.equal(model.projects[0]?.path, "/obekty/sevastopol-project/");
  assert.equal(state.index, true);
  assert.equal(state.sitemap, true);
});

test("Sevastopol gate MISSING remains outside sitemap", () => {
  const model = buildCityHubModel(city({ investmentThesis: "Публикация требует проверки.", status: "hidden", verifiedAt: undefined }), [], []);
  const state = resolveSeoState({ canonical: openRegistry.canonical, contentGate: model.gate.state, publicationStatus: "hidden", registry: openRegistry, runtimeContour: "production" });
  assert.equal(model.gate.state, "missing");
  assert.equal(state.sitemap, false);
});

test("Sevastopol uses the shared city contract and unique metadata without category routes", () => {
  const route = readFileSync("src/app/(site)/_shared/region-route-page.tsx", "utf8");
  const registry = JSON.parse(readFileSync("src/seo/registry.json", "utf8"));
  const seo = registry.find((entry) => entry.pageId === "PAGE-009");
  assert.match(route, /"\/krym\/sevastopol\/": \{ genitive: "Севастополя", prepositional: "Севастополе" \}/);
  assert.doesNotMatch(route, /krym\/sevastopol\/(?:novostroyki|apartamenty)/);
  assert.equal(seo.canonical, "/krym/sevastopol/");
  assert.match(`${seo.title} ${seo.h1} ${seo.description}`, /Севастопол/);
});
