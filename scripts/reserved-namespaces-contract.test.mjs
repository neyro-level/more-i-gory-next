import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import { fallbackSiteChrome } from "../src/core/data-access/public/site-chrome-contract.ts";

const siteAppDir = path.resolve("src/app/(site)");
const reservedRootNamespaces = ["/komplex", "/journal", "/agenty"];
const activatedRootNamespaces = ["/novostroyki", "/zastroyshchik"];

function isReservedRootPath(href) {
  return reservedRootNamespaces.some((namespace) => href === `${namespace}/` || href.startsWith(`${namespace}/`));
}

function appRouteFolders() {
  return fs
    .readdirSync(siteAppDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.relative(siteAppDir, path.join(entry.parentPath, entry.name)).replaceAll("\\", "/"));
}

test("reserved E5 root namespaces are not occupied by public route folders", () => {
  const routeFolders = appRouteFolders();

  for (const namespace of reservedRootNamespaces) {
    const folder = namespace.slice(1);
    assert.equal(routeFolders.includes(folder), false, `${namespace} must stay reserved`);
  }
});

test("EPIC 17 root namespaces are activated intentionally", () => {
  const routeFolders = appRouteFolders();

  for (const namespace of activatedRootNamespaces) {
    const folder = namespace.slice(1);
    assert.equal(routeFolders.includes(folder), true, `${namespace} must be an active EPIC 17 route`);
  }
});

test("reserved E5 root namespaces are not published through SEO registry", () => {
  const registry = JSON.parse(fs.readFileSync("src/seo/registry.json", "utf8"));
  const occupied = registry.filter((entry) => isReservedRootPath(entry.canonical));

  assert.deepEqual(
    occupied.map((entry) => entry.canonical),
    [],
  );
});

test("reserved E5 root namespaces are not hardcoded in fallback navigation", () => {
  const fallbackLinks = [
    ...fallbackSiteChrome.navigation.header,
    ...fallbackSiteChrome.navigation.footer,
    fallbackSiteChrome.navigation.headerCta,
    ...fallbackSiteChrome.navigation.legal,
  ].map((item) => item.href);

  assert.deepEqual(fallbackLinks.filter(isReservedRootPath), []);
});

test("reserved E5 root namespaces are not created by redirect config", () => {
  const redirectFiles = ["src/seo/redirects.json", "src/seo/redirects.ts"].filter((file) => fs.existsSync(file));

  for (const file of redirectFiles) {
    const source = fs.readFileSync(file, "utf8");
    for (const namespace of reservedRootNamespaces) {
      assert.equal(source.includes(`${namespace}/`), false, `${namespace} must not be occupied in ${file}`);
    }
  }
});
