import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  archiveRetentionDays,
  getArchivedPropertyAction,
  mapPublicProperty,
  propertyPublicationWhere,
  propertyRouteWhere,
  publicPropertySelect,
} from "../src/core/data-access/public/properties-contract.ts";

const privateFields = ["unitNumber", "cadastralNumber", "internalComment", "ownerContact"];

test("public properties predicate exposes only manual active published passports", () => {
  assert.deepEqual(propertyPublicationWhere(), {
    and: [
      { origin: { equals: "manual" } },
      { status: { equals: "active" } },
      { publishedAt: { exists: true } },
    ],
  });

  assert.deepEqual(propertyPublicationWhere("yalta-passport"), {
    and: [
      { origin: { equals: "manual" } },
      { status: { equals: "active" } },
      { publishedAt: { exists: true } },
      { slug: { equals: "yalta-passport" } },
    ],
  });
});

test("property detail route predicate includes archived manual passports but still requires publication", () => {
  assert.deepEqual(propertyRouteWhere("archived-passport"), {
    and: [
      { origin: { equals: "manual" } },
      { publishedAt: { exists: true } },
      { slug: { equals: "archived-passport" } },
    ],
  });
});

test("public properties select excludes private fields", () => {
  for (const name of privateFields) {
    assert.equal(name in publicPropertySelect, false, `${name} must not be selected for public routes`);
  }
});

test("public property DTO mapper does not leak private inventory data", () => {
  const dto = mapPublicProperty({
    cadastralNumber: "23:00:0000000:0000",
    createdAt: "2026-09-17T00:00:00.000Z",
    facts: [{ label: "Документы", value: "Проверяются перед публикацией." }],
    id: 100,
    images: [],
    internalComment: "private",
    market: "secondary",
    needsReview: false,
    origin: "manual",
    ownerContact: "private",
    publishedAt: "2026-09-17T00:00:00.000Z",
    region: { id: 7, title: "Ялта" },
    riskSummary: "Риск проверяется в паспорте.",
    slug: "yalta-passport",
    status: "active",
    title: "Квартира в Ялте",
    unitNumber: "154",
    updatedAt: "2026-09-17T00:00:00.000Z",
    verdict: "Подходит для ручного инвестиционного разбора.",
  });

  assert.equal(dto.path, "/obekty/yalta-passport/");
  assert.equal(dto.regionLabel, "Ялта");

  for (const name of privateFields) {
    assert.equal(name in dto, false, `${name} must not be present in public DTO`);
  }
});

test("archived lifecycle serves noindex during retention and never redirects to home", () => {
  assert.equal(archiveRetentionDays, 60);

  const recentArchived = getArchivedPropertyAction(
    { deactivatedAt: "2026-09-01T00:00:00.000Z", status: "archived" },
    new Date("2026-09-17T00:00:00.000Z"),
  );
  const expiredArchived = getArchivedPropertyAction(
    { deactivatedAt: "2026-06-01T00:00:00.000Z", status: "archived" },
    new Date("2026-09-17T00:00:00.000Z"),
  );

  assert.deepEqual(recentArchived, { kind: "serve-noindex" });
  assert.deepEqual(expiredArchived, { kind: "redirect", status: 301, target: "/obekty/" });
  assert.notEqual(expiredArchived.target, "/");
});

test("/obekty routes use Payload properties public gateway, not legacy project JSON service", async () => {
  const listPage = await readFile("src/app/(site)/obekty/page.tsx", "utf8");
  const detailPage = await readFile("src/app/(site)/obekty/[slug]/page.tsx", "utf8");
  const template = await readFile("src/components/templates/project-passport-template.tsx", "utf8");

  assert.match(listPage, /listPublishedManualProperties/);
  assert.doesNotMatch(listPage, /contentService|listPublishedProjects/);
  assert.match(detailPage, /getManualPropertyRouteBySlug/);
  assert.match(detailPage, /getArchivedPropertyAction/);
  assert.match(detailPage, /robots:[\s\S]*index:\s*false/);
  assert.match(detailPage, /permanentRedirect\(archivedAction\.target\)/);
  assert.match(detailPage, /notFound/);
  assert.doesNotMatch(detailPage, /contentService|getProject/);
  assert.match(template, /Статус: не актуально/);
  assert.match(template, /альтернатив/iu);
});
