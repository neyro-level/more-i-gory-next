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
  uniqueArchiveReplacementPath,
} from "../src/core/data-access/public/properties-contract.ts";

const privateFields = ["unitNumber", "cadastralNumber", "internalComment", "ownerContact"];

function matchesWhere(where, record) {
  return where.and.every((predicate) => {
    const [field, condition] = Object.entries(predicate)[0];
    if ("equals" in condition) return record[field] === condition.equals;
    if (condition.exists === true) return Boolean(record[field]);
    return false;
  });
}

const publicationExists = [
  { publishedAt: { exists: true } },
  { slug: { exists: true } },
  { verifiedAt: { exists: true } },
  { verdict: { exists: true } },
  { riskSummary: { exists: true } },
  { sources: { exists: true } },
  { facts: { exists: true } },
];

test("public properties predicate exposes only manual active published passports", () => {
  assert.deepEqual(propertyPublicationWhere(), {
    and: [{ origin: { equals: "manual" } }, { status: { equals: "active" } }, ...publicationExists],
  });

  assert.deepEqual(propertyPublicationWhere("yalta-passport"), {
    and: [
      { origin: { equals: "manual" } },
      { status: { equals: "active" } },
      ...publicationExists,
      { slug: { equals: "yalta-passport" } },
    ],
  });
});

test("property detail route predicate includes archived manual passports but still requires publication", () => {
  assert.deepEqual(propertyRouteWhere("archived-passport"), {
    and: [{ origin: { equals: "manual" } }, ...publicationExists, { slug: { equals: "archived-passport" } }],
  });
});

test("published active passports are listed; unpublished and archived stay hidden", () => {
  const listWhere = propertyPublicationWhere();

  assert.equal(
    matchesWhere(listWhere, {
      origin: "manual",
      status: "active",
      publishedAt: "2026-09-17T00:00:00.000Z",
      slug: "yalta-passport",
      verifiedAt: "2026-09-17T00:00:00.000Z",
      verdict: "Подходит для ручного инвестиционного разбора.",
      riskSummary: "Риск проверяется в паспорте.",
      sources: [{ label: "Открытые данные объекта" }],
      facts: [{ label: "Документы", value: "Проверяются перед публикацией." }],
    }),
    true,
  );
  assert.equal(
    matchesWhere(listWhere, { origin: "manual", status: "active" }),
    false,
    "draft/unpublished properties must stay off the public list",
  );
  assert.equal(
    matchesWhere(listWhere, { origin: "manual", status: "archived", publishedAt: "2026-09-17T00:00:00.000Z" }),
    false,
    "archived properties must stay off the public list",
  );
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
    sources: [{ label: "Открытые данные объекта" }],
    status: "active",
    title: "Квартира в Ялте",
    unitNumber: "154",
    updatedAt: "2026-09-17T00:00:00.000Z",
    verdict: "Подходит для ручного инвестиционного разбора.",
    verifiedAt: "2026-09-17T00:00:00.000Z",
  });

  assert.equal(dto.path, "/obekty/yalta-passport/");
  assert.equal(dto.regionLabel, "Ялта");

  for (const name of privateFields) {
    assert.equal(name in dto, false, `${name} must not be present in public DTO`);
  }
});

test("archived lifecycle serves noindex during retention, unique replacement 301, otherwise 410", () => {
  assert.equal(archiveRetentionDays, 60);
  const now = new Date("2026-09-17T00:00:00.000Z");

  assert.deepEqual(
    getArchivedPropertyAction({ deactivatedAt: "2026-09-01T00:00:00.000Z", status: "archived" }, now),
    { kind: "serve-noindex" },
  );

  const expired = {
    complexId: "complex-1",
    deactivatedAt: "2026-06-01T00:00:00.000Z",
    market: "secondary",
    path: "/obekty/expired-archive/",
    regionLabel: "Ялта",
    slug: "expired-archive",
    status: "archived",
  };

  assert.deepEqual(getArchivedPropertyAction(expired, now, []), { kind: "gone", status: 410 });
  assert.deepEqual(
    getArchivedPropertyAction(expired, now, [
      {
        complexId: "complex-1",
        market: "secondary",
        path: "/obekty/yalta-passport/",
        regionLabel: "Ялта",
        slug: "yalta-passport",
      },
      {
        complexId: "complex-2",
        market: "secondary",
        path: "/obekty/other/",
        regionLabel: "Ялта",
        slug: "other",
      },
    ]),
    { kind: "redirect", status: 301, target: "/obekty/yalta-passport/" },
  );
  assert.deepEqual(
    getArchivedPropertyAction(expired, now, [
      {
        complexId: "complex-1",
        market: "secondary",
        path: "/obekty/a/",
        regionLabel: "Ялта",
        slug: "a",
      },
      {
        complexId: "complex-1",
        market: "secondary",
        path: "/obekty/b/",
        regionLabel: "Ялта",
        slug: "b",
      },
    ]),
    { kind: "gone", status: 410 },
  );
  assert.equal(uniqueArchiveReplacementPath(expired, [{ ...expired, slug: "listing", path: "/obekty/" }]), null);
});

test("/obekty routes use Payload properties public gateway, not legacy project JSON service", async () => {
  const listPage = await readFile("src/app/(site)/obekty/page.tsx", "utf8");
  const detailPage = await readFile("src/app/(site)/obekty/[slug]/page.tsx", "utf8");
  const template = await readFile("src/components/templates/project-passport-template.tsx", "utf8");

  assert.match(listPage, /listPublishedManualProperties/);
  assert.match(listPage, /const properties = await listPublishedManualProperties\(\)/);
  assert.doesNotMatch(listPage, /editorialPreview \? \[\] : await listPublishedManualProperties/);
  assert.doesNotMatch(listPage, /contentService|listPublishedProjects/);
  assert.match(detailPage, /getManualPropertyRouteBySlug/);
  assert.match(detailPage, /getArchivedPropertyAction/);
  assert.match(detailPage, /buildPassportPageMetadata/);
  assert.match(detailPage, /passportStructuredData/);
  assert.match(detailPage, /application\/ld\+json/);
  assert.match(detailPage, /permanentRedirect\(archivedAction\.target\)/);
  assert.match(detailPage, /kind === "gone"/);
  assert.match(detailPage, /data-archive-status="410"/);
  assert.doesNotMatch(detailPage, /target: "\/obekty\/"/);
  assert.match(detailPage, /notFound/);
  assert.match(detailPage, /generateStaticParams/);
  assert.doesNotMatch(detailPage, /dynamicParams\s*=\s*false/);
  assert.doesNotMatch(detailPage, /contentService|getProject/);
  assert.match(template, /Статус: не актуально/);
  assert.match(template, /альтернатив/iu);
});
