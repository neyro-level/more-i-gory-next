import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildCityHubModel } from "../src/core/regions/city-hub.ts";
import { resolveSeoState } from "../src/seo/seo-state.ts";

const image = { alt: "fixture", height: 1, src: "/images/fallback.svg", width: 1 };
const city = (overrides = {}) => ({
  id: "evpatoriya", image,
  investmentThesis: "Самостоятельный проверенный тезис Евпатории описывает семейный курортный спрос, сезонность, инфраструктуру и сценарий владения.",
  kind: "locality", lead: "Проверенный локальный рынок без рекламных обещаний.", pageId: "PAGE-010", pageKey: "CITY",
  parentSlug: "krym", path: "/krym/evpatoriya/",
  riskSummary: "Проверенные ограничения сезонного спроса, расходов на управление и ликвидности конкретного объекта.",
  slug: "evpatoriya", status: "published", title: "Евпатория", verifiedAt: "2026-09-24", ...overrides,
});
const project = (overrides = {}) => ({
  facts: [{ label: "Факт", value: "Значение" }],
  geoContext: { cityOrArea: { id: "evpatoriya", path: "/krym/evpatoriya/", slug: "evpatoriya", title: "Евпатория" }, region: { id: "krym", path: "/krym/", slug: "krym", title: "Крым" } },
  id: "project", image, path: "/obekty/evpatoriya-project/", publishedAt: "2026-09-24", regionLabel: "Евпатория",
  riskSummary: "risk", slug: "evpatoriya-project", sources: [{ label: "source" }], status: "active", title: "Project",
  verdict: "verdict", verifiedAt: "2026-09-24", ...overrides,
});
const openRegistry = { canonical: "/krym/evpatoriya/", index: "yes", sitemap: "yes" };

test("Evpatoriya gate PASS activates only a complete local market candidate", () => {
  const model = buildCityHubModel(city(), [], [project()]);
  const state = resolveSeoState({ canonical: openRegistry.canonical, contentGate: model.gate.state, publicationStatus: "published", registry: openRegistry, runtimeContour: "production" });
  assert.equal(model.gate.state, "pass");
  assert.equal(model.projects[0]?.path, "/obekty/evpatoriya-project/");
  assert.equal(state.index, true);
  assert.equal(state.sitemap, true);
});

test("Evpatoriya gate MISSING remains outside sitemap", () => {
  const model = buildCityHubModel(city({ investmentThesis: "Черновик до утверждения.", status: "hidden", verifiedAt: undefined }), [], []);
  const state = resolveSeoState({ canonical: openRegistry.canonical, contentGate: model.gate.state, publicationStatus: "hidden", registry: openRegistry, runtimeContour: "production" });
  assert.equal(model.gate.state, "missing");
  assert.equal(state.index, false);
  assert.equal(state.sitemap, false);
});

test("Evpatoriya uses the shared city contract and unique metadata without category routes", () => {
  const route = readFileSync("src/app/(site)/_shared/region-route-page.tsx", "utf8");
  const registry = JSON.parse(readFileSync("src/seo/registry.json", "utf8"));
  const seo = registry.find((entry) => entry.pageId === "PAGE-010");
  assert.match(route, /"\/krym\/evpatoriya\/": \{ genitive: "Евпатории", prepositional: "Евпатории" \}/);
  assert.doesNotMatch(route, /krym\/evpatoriya\/(?:novostroyki|apartamenty)/);
  assert.equal(seo.canonical, "/krym/evpatoriya/");
  assert.match(`${seo.title} ${seo.h1} ${seo.description}`, /Евпатори/);
});
