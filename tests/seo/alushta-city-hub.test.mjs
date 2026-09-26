import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildCityHubModel } from "../../src/core/regions/city-hub.ts";
import { resolveSeoState } from "../../src/seo/seo-state.ts";

const image = { alt: "fixture", height: 1, src: "/images/fallback.svg", width: 1 };
const city = (overrides = {}) => ({
  id: "alushta", image,
  investmentThesis: "Самостоятельный проверенный тезис Алушты описывает компактный курортный рынок, сезонность, инфраструктуру и сценарий владения.",
  kind: "locality", lead: "Проверенный локальный рынок без рекламных обещаний.", pageId: "PAGE-011", pageKey: "CITY",
  parentSlug: "krym", path: "/krym/alushta/",
  riskSummary: "Проверенные ограничения расходов, управления, сезонного спроса и ликвидности конкретного объекта.",
  slug: "alushta", status: "published", title: "Алушта", verifiedAt: "2026-09-24", ...overrides,
});
const project = (overrides = {}) => ({
  facts: [{ label: "Факт", value: "Значение" }],
  geoContext: { cityOrArea: { id: "alushta", path: "/krym/alushta/", slug: "alushta", title: "Алушта" }, region: { id: "krym", path: "/krym/", slug: "krym", title: "Крым" } },
  id: "project", image, path: "/obekty/alushta-project/", publishedAt: "2026-09-24", regionLabel: "Алушта",
  riskSummary: "risk", slug: "alushta-project", sources: [{ label: "source" }], status: "active", title: "Project",
  verdict: "verdict", verifiedAt: "2026-09-24", ...overrides,
});
const openRegistry = { canonical: "/krym/alushta/", index: "yes", sitemap: "yes" };

test("Alushta gate PASS activates only a complete local market candidate", () => {
  const model = buildCityHubModel(city(), [], [project()]);
  const state = resolveSeoState({ canonical: openRegistry.canonical, contentGate: model.gate.state, publicationStatus: "published", registry: openRegistry, runtimeContour: "production" });
  assert.equal(model.gate.state, "pass");
  assert.equal(model.projects[0]?.path, "/obekty/alushta-project/");
  assert.equal(state.index, true);
  assert.equal(state.sitemap, true);
});

test("Alushta gate MISSING remains outside sitemap", () => {
  const model = buildCityHubModel(city({ investmentThesis: "Перед публикацией нужны факты.", status: "hidden", verifiedAt: undefined }), [], []);
  const state = resolveSeoState({ canonical: openRegistry.canonical, contentGate: model.gate.state, publicationStatus: "hidden", registry: openRegistry, runtimeContour: "production" });
  assert.equal(model.gate.state, "missing");
  assert.equal(state.index, false);
  assert.equal(state.sitemap, false);
});

test("Alushta uses the shared city contract and unique metadata without category routes", () => {
  const route = readFileSync("src/app/(site)/_shared/region-route-page.tsx", "utf8");
  const registry = JSON.parse(readFileSync("src/seo/registry.json", "utf8"));
  const seo = registry.find((entry) => entry.pageId === "PAGE-011");
  assert.match(route, /"\/krym\/alushta\/": \{ genitive: "Алушты", prepositional: "Алуште" \}/);
  assert.doesNotMatch(route, /krym\/alushta\/(?:novostroyki|apartamenty)/);
  assert.equal(seo.canonical, "/krym/alushta/");
  assert.match(`${seo.title} ${seo.h1} ${seo.description}`, /Алушт/);
});
