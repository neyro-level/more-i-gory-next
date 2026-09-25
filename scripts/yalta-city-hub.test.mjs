import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildCityHubModel } from "../src/core/regions/city-hub.ts";
import { resolveSeoState } from "../src/seo/seo-state.ts";

const image = { alt: "fixture", height: 1, src: "/images/fallback.svg", width: 1 };
const city = (overrides = {}) => ({
  id: "yalta", image, investmentThesis: "Самостоятельный проверенный инвестиционный тезис Ялты с описанием локального спроса, ограничений и сценария владения.",
  kind: "locality", lead: "Проверенный локальный рынок без рекламных обещаний.", pageId: "PAGE-008", pageKey: "CITY",
  parentSlug: "krym", path: "/krym/yalta/", riskSummary: "Проверенный риск локального рынка с ограничениями данных, расходов и ликвидности объекта.",
  slug: "yalta", status: "published", title: "Ялта", verifiedAt: "2026-09-24", ...overrides,
});
const project = (overrides = {}) => ({
  facts: [{ label: "Факт", value: "Значение" }], geoContext: { cityOrArea: { id: "yalta", path: "/krym/yalta/", slug: "yalta", title: "Ялта" }, region: { id: "krym", path: "/krym/", slug: "krym", title: "Крым" } },
  id: "project", image, market: "newbuild", path: "/obekty/project/", publishedAt: "2026-09-24", regionLabel: "Ялта", riskSummary: "risk",
  slug: "project", sources: [{ label: "source" }], status: "active", title: "Project", verdict: "verdict", verifiedAt: "2026-09-24", ...overrides,
});
const openRegistry = { canonical: "/krym/yalta/", index: "yes", sitemap: "yes" };

test("Yalta gate PASS becomes an index candidate with one complete local passport", () => {
  const model = buildCityHubModel(city(), [], [project()]);
  const state = resolveSeoState({ canonical: "/krym/yalta/", contentGate: model.gate.state, publicationStatus: "published", registry: openRegistry, runtimeContour: "production" });
  assert.equal(model.gate.state, "pass");
  assert.equal(model.projects[0]?.path, "/obekty/project/");
  assert.equal(model.newbuildProjects.length, 1);
  assert.equal(state.index, true);
  assert.equal(state.sitemap, true);
});

test("Yalta gate MISSING remains outside sitemap", () => {
  const model = buildCityHubModel(city({ investmentThesis: "Черновик до утверждения.", status: "hidden", verifiedAt: undefined }), [], []);
  const state = resolveSeoState({ canonical: "/krym/yalta/", contentGate: model.gate.state, publicationStatus: "hidden", registry: openRegistry, runtimeContour: "production" });
  assert.equal(model.gate.state, "missing");
  assert.equal(state.index, false);
  assert.equal(state.sitemap, false);
});

test("Yalta is a dedicated shared city hub without a city-category route", () => {
  const route = readFileSync("src/app/(site)/_shared/region-route-page.tsx", "utf8");
  const template = readFileSync("src/components/templates/city-market-hub.tsx", "utf8");
  const registry = JSON.parse(readFileSync("src/seo/registry.json", "utf8"));
  const seo = registry.find((entry) => entry.pageId === "PAGE-008");

  assert.match(route, /"\/krym\/yalta\/": \{ genitive: "Ялты", prepositional: "Ялте" \}/);
  assert.match(route, /cityNameGenitive=\{cityLabels\.genitive\}/);
  assert.match(route, /cityNamePrepositional=\{cityLabels\.prepositional\}/);
  assert.match(template, /секция, а не новый SEO URL/);
  assert.doesNotMatch(route, /krym\/yalta\/novostroyki/);
  assert.equal(seo.canonical, "/krym/yalta/");
  assert.match(seo.title, /Ялт/);
  assert.match(seo.h1, /Ялт/);
  assert.match(seo.description, /Ялт/);
});
