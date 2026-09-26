import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { Developers } from "../../src/project/collections/developers.ts";
import { ResidentialComplexes } from "../../src/project/collections/residential-complexes.ts";

const gatewaySource = await readFile("src/core/data-access/public/newbuilds.ts", "utf8");

test("public newbuild predicates expose only published catalog documents and active feed inventory", () => {
  assert.match(gatewaySource, /export function publishedComplexesWhere/);
  assert.match(gatewaySource, /export function publishedDevelopersWhere/);
  assert.match(gatewaySource, /status:\s*\{\s*equals:\s*"published"\s*\}/);
  assert.match(gatewaySource, /export function activeNewbuildInventoryWhere/);
  assert.match(gatewaySource, /origin:\s*\{\s*equals:\s*"feed"\s*\}/);
  assert.match(gatewaySource, /market:\s*\{\s*equals:\s*"newbuild"\s*\}/);
  assert.match(gatewaySource, /status:\s*\{\s*equals:\s*"active"\s*\}/);
});

test("public newbuild selects exclude raw feed and private property fields", () => {
  const forbiddenPublicFields = ["unitNumber", "cadastralNumber", "ownerContact", "internalComment", "externalId"];
  const selectBlock = gatewaySource.slice(
    gatewaySource.indexOf("export const publicNewbuildInventorySelect"),
    gatewaySource.indexOf("export function publishedDevelopersWhere"),
  );

  for (const name of forbiddenPublicFields) {
    assert.doesNotMatch(selectBlock, new RegExp(`${name}:\\s*true`), `${name} must not be selected for public inventory cards`);
  }
});

test("developers and complexes deny anonymous REST; public catalog goes through Public Gateway", () => {
  assert.equal(Developers.access?.read?.({ req: {} }), false);
  assert.equal(ResidentialComplexes.access?.read?.({ req: {} }), false);
  assert.equal(Developers.access?.read?.({ req: { user: { collection: "users", role: "owner" } } }), true);
  assert.equal(ResidentialComplexes.access?.read?.({ req: { user: { collection: "users", role: "owner" } } }), true);
  assert.notEqual(Developers.access?.update?.({ req: {} }), true);
  assert.notEqual(ResidentialComplexes.access?.update?.({ req: {} }), true);
  assert.match(gatewaySource, /overrideAccess:\s*false/);
});

test("EPIC 17 routes use public newbuild gateway and keep /obekty manual-only", async () => {
  const catalogPage = await readFile("src/app/(site)/novostroyki/page.tsx", "utf8");
  const complexPage = await readFile("src/app/(site)/novostroyki/[slug]/page.tsx", "utf8");
  const developerPage = await readFile("src/app/(site)/zastroyshchik/[slug]/page.tsx", "utf8");
  const objectsPage = await readFile("src/app/(site)/obekty/page.tsx", "utf8");

  assert.match(catalogPage, /listPublishedComplexes/);
  assert.match(complexPage, /getPublishedComplexBySlug/);
  assert.match(complexPage, /listActiveNewbuildInventoryByComplex/);
  assert.match(complexPage, /dynamic\s*=\s*"force-dynamic"/);
  assert.doesNotMatch(complexPage, /generateStaticParams/);
  assert.doesNotMatch(complexPage, /dynamicParams\s*=\s*false/);
  assert.match(developerPage, /getPublishedDeveloperBySlug/);
  assert.match(developerPage, /dynamic\s*=\s*"force-dynamic"/);
  assert.doesNotMatch(developerPage, /generateStaticParams/);
  assert.doesNotMatch(developerPage, /dynamicParams\s*=\s*false/);
  assert.match(objectsPage, /listPublishedManualProperties/);
  assert.doesNotMatch(objectsPage, /listPublishedComplexes|listActiveNewbuildInventoryByComplex/);
});

function httpStatusForPublishedSlugWithoutRebuild({
  blockedDynamicParams,
  buildTimeSlugs,
  published,
  requestedSlug,
}) {
  if (!published) return 404;
  if (buildTimeSlugs.includes(requestedSlug)) return 200;
  return blockedDynamicParams ? 404 : 200;
}

test("a newly published complex slug is requestable without a rebuild", async () => {
  const complexPage = await readFile("src/app/(site)/novostroyki/[slug]/page.tsx", "utf8");
  const blockedDynamicParams = /export const dynamicParams\s*=\s*false/.test(complexPage);

  assert.equal(blockedDynamicParams, false);
  assert.equal(
    httpStatusForPublishedSlugWithoutRebuild({
      blockedDynamicParams,
      buildTimeSlugs: ["already-built-complex"],
      published: true,
      requestedSlug: "fresh-published-complex",
    }),
    200,
  );
  assert.equal(
    httpStatusForPublishedSlugWithoutRebuild({
      blockedDynamicParams: true,
      buildTimeSlugs: ["already-built-complex"],
      published: true,
      requestedSlug: "fresh-published-complex",
    }),
    404,
  );
  assert.equal(
    httpStatusForPublishedSlugWithoutRebuild({
      blockedDynamicParams,
      buildTimeSlugs: ["already-built-complex"],
      published: false,
      requestedSlug: "fresh-published-complex",
    }),
    404,
  );
});
