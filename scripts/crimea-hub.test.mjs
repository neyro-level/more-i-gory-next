import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { buildCrimeaHubModel, CRIMEA_HUB_CITY_SLUGS } from "../src/core/regions/crimea-hub.ts";

const image = { alt: "fixture", height: 1, src: "/images/fallback.svg", width: 1 };

function city(slug, status = "published", verifiedAt = "2026-09-24") {
  return {
    id: `city-${slug}`, image, investmentThesis: `Тезис ${slug}`, kind: "locality", lead: "lead",
    pageId: `city:${slug}`, pageKey: "CITY", parentSlug: "krym", path: `/krym/${slug}/`,
    riskSummary: `Риск ${slug}`, slug, status, title: slug, ...(verifiedAt ? { verifiedAt } : {}),
  };
}

function project(index, regionSlug = "krym") {
  return {
    facts: [{ label: "Факт", value: "Значение" }], geoContext: { region: { id: regionSlug, path: `/${regionSlug}/`, slug: regionSlug, title: regionSlug } },
    id: `project-${index}`, image, path: `/obekty/project-${index}/`, publishedAt: "2026-09-24", regionLabel: regionSlug,
    riskSummary: "risk", slug: `project-${index}`, sources: [{ label: "source" }], status: "active", title: `Project ${index}`,
    verdict: "verdict", verifiedAt: "2026-09-24",
  };
}

test("Crimea hub gate passes only with three verified cities and four published passports", () => {
  const regions = CRIMEA_HUB_CITY_SLUGS.map((slug) => city(slug));
  const projects = Array.from({ length: 4 }, (_, index) => project(index));
  const model = buildCrimeaHubModel(regions, projects);

  assert.equal(model.gate.state, "pass");
  assert.equal(model.gate.cityCount, 4);
  assert.equal(model.gate.projectCount, 4);
  assert.deepEqual(model.cities.map((entry) => entry.slug), CRIMEA_HUB_CITY_SLUGS);
  assert.ok(model.projects.every((entry) => entry.path.startsWith("/obekty/")));
});

test("draft cities, missing dates and foreign projects cannot open the gate", () => {
  const regions = [city("yalta"), city("sevastopol", "hidden"), city("evpatoriya", "published", "")];
  const model = buildCrimeaHubModel(regions, [project(1), project(2, "sochi")]);

  assert.equal(model.gate.state, "missing");
  assert.equal(model.gate.cityCount, 1);
  assert.equal(model.gate.projectCount, 1);
  assert.equal(model.gate.reasons.length, 2);
});

test("regional hub uses the dedicated contract without restoring legacy segment ownership", () => {
  const route = readFileSync("src/app/(site)/_shared/region-route-page.tsx", "utf8");
  const template = readFileSync("src/components/templates/crimea-region-hub.tsx", "utf8");

  assert.match(route, /region\.path === "\/krym\/"/);
  assert.match(route, /CrimeaRegionHub/);
  assert.doesNotMatch(template, /investicionnaya-nedvizhimost\/krym\/(?:novostroyki|apartamenty)/);
  assert.match(template, /\/obekty\//);
});
