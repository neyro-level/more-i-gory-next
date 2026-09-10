import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(projectRoot, "out");
const siteUrl = "https://moreigori.ru";
const initialRouteJsBudgetGzipKb = 110;

const requiredRoutes = [
  "",
  "investicionnaya-nedvizhimost",
  "investicionnaya-nedvizhimost/sochi",
  "investicionnaya-nedvizhimost/sochi/novostroyki",
  "investicionnaya-nedvizhimost/sochi/apartamenty",
  "investicionnaya-nedvizhimost/sochi/adler",
  "investicionnaya-nedvizhimost/krym",
  "investicionnaya-nedvizhimost/krym/yalta",
  "investicionnaya-nedvizhimost/krym/sevastopol",
  "investicionnaya-nedvizhimost/krym/evpatoriya",
  "investicionnaya-nedvizhimost/krym/alushta",
  "investicionnaya-nedvizhimost/arkhyz",
  "investicionnaya-nedvizhimost/altay",
  "obekty",
  "analitika",
  "analitika/sochi-ili-krym",
  "analitika/kak-schitat-chistuyu-dohodnost",
  "analitika/riski-kurortnyh-apartamentov",
  "analitika/kak-proverit-operatora",
  "analitika/likvidnost-i-vyhod",
  "metodika",
  "podbor",
  "o-kompanii",
  "kontakty",
  "privacy",
  "consent",
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function routeHtmlPath(route) {
  return route ? path.join(outDir, route, "index.html") : path.join(outDir, "index.html");
}

assert(existsSync(outDir), "out/ artifact is missing.");
assert(existsSync(path.join(outDir, "robots.txt")), "robots.txt is missing.");
assert(existsSync(path.join(outDir, "sitemap.xml")), "sitemap.xml is missing.");

for (const route of requiredRoutes) {
  assert(existsSync(routeHtmlPath(route)), `Missing static route: /${route}`);
}

assert(!existsSync(path.join(outDir, "obekty", "sample-resort", "index.html")), "Draft project route must not be exported.");

const sitemap = readFileSync(path.join(outDir, "sitemap.xml"), "utf8");
for (const route of requiredRoutes) {
  assert(!sitemap.includes(`${siteUrl}/${route}`), `Gated/noindex route leaked into sitemap: /${route}`);
}

for (const route of ["privacy", "consent", "analitika/sochi-ili-krym"]) {
  const html = readFileSync(routeHtmlPath(route), "utf8");
  assert(/name="robots" content="noindex, follow"/.test(html), `Expected noindex meta on /${route}/`);
}

const homeHtml = readFileSync(path.join(outDir, "index.html"), "utf8");
const scriptSources = [...homeHtml.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((match) => match[1]);
let initialRouteJsGzipBytes = 0;
const chunkSizes = [];

for (const source of scriptSources) {
  const scriptPath = path.join(outDir, source.replace(/^\//, ""));
  if (existsSync(scriptPath)) {
    const gzipBytes = zlib.gzipSync(readFileSync(scriptPath)).length;
    initialRouteJsGzipBytes += gzipBytes;
    chunkSizes.push(gzipBytes);
  }
}

const initialRouteJsGzipKb = Math.round(initialRouteJsGzipBytes / 1024);
const largestLazyChunkKb = Math.round(Math.max(0, ...chunkSizes) / 1024);
const htmlSizeKb = Math.round(statSync(path.join(outDir, "index.html")).size / 1024);
const status = initialRouteJsGzipKb <= initialRouteJsBudgetGzipKb ? "PASS" : "WARNING";

console.log(
  JSON.stringify(
    {
      artifact: "out/",
      htmlSizeKb,
      initialRouteJsBudgetGzipKb,
      initialRouteJsGzipKb,
      largestLazyChunkKb,
      requiredRoutes: requiredRoutes.length,
      status,
    },
    null,
    2,
  ),
);

if (largestLazyChunkKb > 300) {
  throw new Error(`Largest lazy chunk exceeds 300 KB gzip: ${largestLazyChunkKb} KB`);
}
