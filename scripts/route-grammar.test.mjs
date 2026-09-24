import assert from "node:assert/strict";
import test from "node:test";

import { buildUrl, parseUrl } from "../src/core/routing/grammar/index.ts";

const staticIdentities = [
  { pageKey: "HOME" },
  { pageKey: "FEDERAL_INVESTMENT_HUB" },
  { pageKey: "INVESTMENT_CATALOG" },
  { pageKey: "ANALYTICS" },
  { pageKey: "METHODOLOGY" },
  { pageKey: "SELECTION" },
  { pageKey: "COMPANY" },
  { pageKey: "CONTACTS" },
  { pageKey: "PRIVACY" },
  { pageKey: "CONSENT" },
];

const dynamicIdentities = [
  { pageKey: "REGION", regionSlug: "krym" },
  { pageKey: "REGION", regionSlug: "arkhyz" },
  { pageKey: "REGION", regionSlug: "altay" },
  { pageKey: "REGION", regionSlug: "sochi" },
  { pageKey: "CITY", regionSlug: "krym", citySlug: "yalta" },
  { pageKey: "CITY", regionSlug: "krym", citySlug: "sevastopol" },
  { pageKey: "CITY", regionSlug: "krym", citySlug: "evpatoriya" },
  { pageKey: "CITY", regionSlug: "krym", citySlug: "alushta" },
  { pageKey: "INVESTMENT_PROJECT", projectSlug: "morskoy-kvartal-2" },
  { pageKey: "ARTICLE", articleSlug: "kak-proverit-operatora" },
];

test("target RouteIdentity values have reversible canonical URLs", () => {
  for (const identity of [...staticIdentities, ...dynamicIdentities]) {
    assert.deepEqual(parseUrl(buildUrl(identity)), identity);
  }
});

test("builder always emits one leading and one trailing slash", () => {
  for (const identity of [...staticIdentities, ...dynamicIdentities]) {
    const path = buildUrl(identity);
    assert.match(path, /^\/(?:$|[^/].*\/$)/);
    assert.doesNotMatch(path, /\/\//);
  }
  assert.deepEqual(parseUrl("/krym"), { pageKey: "REGION", regionSlug: "krym" });
  assert.equal(buildUrl(parseUrl("/krym")), "/krym/");
});

test("representative target IA produces no duplicate canonical output", () => {
  const identities = [...staticIdentities, ...dynamicIdentities];
  const paths = identities.map(buildUrl);
  assert.equal(new Set(paths).size, identities.length);
});

test("reserved roots and geography slug collisions fail closed", () => {
  for (const regionSlug of ["api", "obekty", "analitika", "novostroyki", "privacy", "investicionnaya-nedvizhimost"]) {
    assert.throws(() => buildUrl({ pageKey: "REGION", regionSlug }), /Reserved regionSlug/);
  }
  assert.throws(() => buildUrl({ pageKey: "CITY", regionSlug: "krym", citySlug: "obekty" }), /Reserved citySlug/);
  assert.throws(() => buildUrl({ pageKey: "CITY", regionSlug: "krym", citySlug: "apartamenty" }), /Reserved citySlug/);
  assert.throws(() => buildUrl({ pageKey: "CITY", regionSlug: "krym", citySlug: "krym" }), /collision/);
});

test("invalid slugs, unsupported depth and old IA are not canonical grammar", () => {
  for (const slug of ["Yalta", "yalta_1", "-yalta", "yalta-", "yalta--center", "ялта"]) {
    assert.throws(() => buildUrl({ pageKey: "REGION", regionSlug: slug }), /Invalid regionSlug/);
  }

  for (const path of [
    "krym/",
    "/krym//",
    "/krym/yalta/extra/",
    "/krym/?sort=price",
    "/krym/#map",
    "/krym/%79alta/",
    "/investicionnaya-nedvizhimost/krym/",
    "/obekty/project/extra/",
  ]) {
    assert.equal(parseUrl(path), null, path);
  }
});

test("reserved dynamic namespaces parse only their supported depth", () => {
  assert.deepEqual(parseUrl("/obekty/project-a/"), { pageKey: "INVESTMENT_PROJECT", projectSlug: "project-a" });
  assert.deepEqual(parseUrl("/analitika/article-a/"), { pageKey: "ARTICLE", articleSlug: "article-a" });
  assert.equal(parseUrl("/privacy/extra/"), null);
  assert.equal(parseUrl("/novostroyki/complex-a/"), null);
});
