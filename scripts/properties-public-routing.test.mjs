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
import {
  buildCatalogFilterGroups,
  filterCatalogProperties,
  hasCatalogQueryState,
  minimumFilterableCatalogSize,
  parseCatalogFilterQuery,
} from "../src/core/catalog/public-catalog.ts";
import { selectRelatedArticles, selectRelatedProjects } from "../src/core/projects/project-context.ts";

const privateFields = ["unitNumber", "cadastralNumber", "internalComment", "ownerContact"];

function matchesWhere(where, record) {
  return where.and.every((predicate) => {
    const [field, condition] = Object.entries(predicate)[0];
    const values = field.split(".").reduce(
      (current, segment) => current.flatMap((value) => {
        const nested = value?.[segment];
        return Array.isArray(nested) ? nested : [nested];
      }),
      [record],
    );
    if ("equals" in condition) return values.includes(condition.equals);
    if (condition.exists === true) return values.some(Boolean);
    return false;
  });
}

const publicationExists = [
  { publishedAt: { exists: true } },
  { region: { exists: true } },
  { slug: { exists: true } },
  { verifiedAt: { exists: true } },
  { verdict: { exists: true } },
  { riskSummary: { exists: true } },
  { "sources.label": { exists: true } },
  { "facts.label": { exists: true } },
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
      region: 1,
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
    category: "apartment",
    id: 100,
    images: [],
    internalComment: "private",
    market: "secondary",
    needsReview: false,
    origin: "manual",
    ownerContact: "private",
    publishedAt: "2026-09-17T00:00:00.000Z",
    region: { id: 1, kind: "region", slug: "krym", status: "published", title: "Крым" },
    cityOrArea: { id: 7, kind: "locality", slug: "yalta", status: "published", title: "Ялта" },
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
  assert.equal(dto.category, "apartment");
  assert.equal(dto.regionLabel, "Ялта");
  assert.deepEqual(dto.geoContext, {
    cityOrArea: { id: "7", path: "/krym/yalta/", slug: "yalta", status: "published", title: "Ялта" },
    region: { id: "1", path: "/krym/", slug: "krym", status: "published", title: "Крым" },
  });

  for (const name of privateFields) {
    assert.equal(name in dto, false, `${name} must not be present in public DTO`);
  }
});

test("catalog filters are data-driven, hidden for small inventory and never create path pages", () => {
  const property = (index, overrides = {}) => ({
    budgetNote: index < 4 ? "до 20 млн ₽" : "от 20 млн ₽",
    category: index % 2 === 0 ? "apartment" : "house",
    facts: [{ label: "Стратегия", value: index % 2 === 0 ? "Аренда" : "Сохранение капитала" }],
    geoContext: {
      cityOrArea: { id: `city-${index % 2}`, path: index % 2 === 0 ? "/krym/yalta/" : "/krym/alushta/", slug: index % 2 === 0 ? "yalta" : "alushta", title: index % 2 === 0 ? "Ялта" : "Алушта" },
      region: { id: "region-krym", path: "/krym/", slug: "krym", title: "Крым" },
    },
    id: String(index),
    ...overrides,
  });
  const inventory = Array.from({ length: minimumFilterableCatalogSize }, (_, index) => property(index));

  assert.deepEqual(buildCatalogFilterGroups(inventory.slice(0, 2)), []);
  const groups = buildCatalogFilterGroups(inventory);
  assert.deepEqual(groups.map((group) => group.key), ["city", "format", "budget", "strategy"]);

  const query = parseCatalogFilterQuery({ city: "yalta", format: ["apartment", "house"], ignored: "value" });
  assert.deepEqual(query, { city: "yalta", format: "apartment" });
  assert.equal(filterCatalogProperties(inventory, query, groups).length, 4);
  assert.equal(hasCatalogQueryState({ sort: "verified-desc" }), true);
  assert.equal(hasCatalogQueryState({}), false);
});

test("project context keeps one global canonical and bounds verified geo relations", () => {
  const property = (id, region, city, overrides = {}) => ({
    facts: [{ label: "Документы", value: "Проверены" }],
    geoContext: {
      cityOrArea: city ? { id: city, path: `/${region}/${city}/`, slug: city, title: city } : undefined,
      region: { id: region, path: `/${region}/`, slug: region, title: region },
    },
    id,
    image: { alt: id, height: 100, src: "/images/og/default.webp", width: 100 },
    path: `/obekty/${id}/`,
    publishedAt: "2026-09-01T00:00:00.000Z",
    regionLabel: city ?? region,
    riskSummary: "Риск",
    slug: id,
    sources: [{ label: "Источник" }],
    status: "active",
    title: id,
    verdict: "Тезис",
    verifiedAt: "2026-09-20T00:00:00.000Z",
    ...overrides,
  });
  const current = property("current", "krym", "yalta");
  const candidates = [
    property("same-city", "krym", "yalta"),
    property("same-region", "krym", "alushta"),
    property("other-region", "altay", "manzherok"),
    property("fourth", "krym", "sevastopol"),
    property("fifth", "krym", "evpatoria"),
  ];

  assert.deepEqual(selectRelatedProjects(current, candidates).map((item) => item.id), ["same-city", "fifth", "fourth"]);
  assert.equal(selectRelatedProjects(current, candidates).length, 3);
  assert.equal(selectRelatedProjects(current, candidates).some((item) => item.path.includes("/krym/")), false);

  const relatedArticles = selectRelatedArticles(current, [
    { id: "draft", path: "/analitika/draft/", status: "draft", title: "Draft", description: "Draft description for testing only", primaryQuery: "draft", relatedProjectIds: ["current"], relatedRegionIds: [], secondaryQueries: [], slug: "draft", sourceIds: [], targetPageId: "PAGE-017" },
    { id: "regional", path: "/analitika/regional/", status: "published", title: "Regional", description: "Published regional analysis for testing", primaryQuery: "regional", publishedAt: "2026-09-01", reviewedAt: "2026-09-20", relatedProjectIds: [], relatedRegionIds: ["region-krym"], secondaryQueries: [], slug: "regional", sourceIds: ["source"], targetPageId: "PAGE-017" },
  ]);
  assert.deepEqual(relatedArticles.map((article) => article.id), ["regional"]);
});

test("archived lifecycle serves noindex during retention, unique replacement 308, otherwise gone intent", () => {
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
    { kind: "redirect", status: 308, target: "/obekty/yalta-passport/" },
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
  assert.match(listPage, /CatalogFilters/);
  assert.match(listPage, /hasCatalogQueryState/);
  assert.match(listPage, /locationHref=\{isDiscoverableGeoStatus\(property\.geoContext\.region\.status\)/);
  assert.match(listPage, /verifiedAt=\{property\.verifiedAt\}/);
  assert.match(listPage, /listEditorialPreviewManualProperties\(\)/);
  assert.match(listPage, /: await listPublishedManualProperties\(\)/);
  assert.doesNotMatch(listPage, /editorialPreview \? \[\] : await listPublishedManualProperties/);
  assert.doesNotMatch(listPage, /contentService|listPublishedProjects/);
  assert.match(detailPage, /getManualPropertyRouteBySlug/);
  assert.match(detailPage, /getArchivedPropertyAction/);
  assert.match(detailPage, /buildPassportPageMetadata/);
  assert.match(detailPage, /passportStructuredData/);
  assert.match(detailPage, /selectRelatedProjects/);
  assert.match(detailPage, /selectRelatedArticles/);
  assert.match(await readFile("src/core/data-access/public/properties-contract.ts", "utf8"), /pageKey:\s*"INVESTMENT_PROJECT"/);
  assert.match(detailPage, /application\/ld\+json/);
  assert.match(detailPage, /materializeSeoHttpState/);
  assert.match(detailPage, /kind === "gone"/);
  assert.doesNotMatch(detailPage, /data-archive-status="410"/);
  assert.doesNotMatch(detailPage, /target: "\/obekty\/"/);
  assert.match(detailPage, /notFound/);
  assert.match(detailPage, /dynamic\s*=\s*"force-dynamic"/);
  assert.doesNotMatch(detailPage, /generateStaticParams/);
  assert.doesNotMatch(detailPage, /dynamicParams\s*=\s*false/);
  assert.doesNotMatch(detailPage, /contentService|getProject/);
  assert.match(template, /Статус: не актуально/);
  assert.match(template, /альтернатив/iu);
  assert.match(template, /StructuredBreadcrumbs/);
  assert.match(template, /property\.geoContext\.region\.path/);
  assert.match(template, /property\.geoContext\.cityOrArea\.path/);
  assert.match(template, /Источники паспорта/);
  assert.match(template, /relatedProjects\.length/);
  assert.match(template, /relatedArticles\.length/);
});
