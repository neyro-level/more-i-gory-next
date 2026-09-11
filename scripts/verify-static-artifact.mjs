import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(projectRoot, "out");
const siteUrl = "https://moreigori.ru";
const initialRouteJsBudgetGzipKb = 110;
const seoRegistry = JSON.parse(
  readFileSync(path.join(projectRoot, "src", "seo", "registry.json"), "utf8"),
);
const articles = JSON.parse(
  readFileSync(path.join(projectRoot, "src", "content", "data", "articles.json"), "utf8"),
);

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
assert(existsSync(path.join(outDir, "404.html")), "404.html is missing.");

const cssFiles = [];
function collectCss(directory) {
  for (const entry of requireDirectory(directory)) {
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) collectCss(resolved);
    else if (entry.name.endsWith(".css")) cssFiles.push(resolved);
  }
}

collectCss(path.join(outDir, "_next", "static"));
const compiledCss = cssFiles.map((file) => readFileSync(file, "utf8")).join("\n");
for (const utility of [
  ".text-h1",
  ".text-body-lg",
  ".max-w-site",
  ".max-w-narrow",
  ".py-section-md",
  ".rounded-card",
  ".rounded-large",
  ".duration-fast",
  ".aspect-card",
]) {
  assert(compiledCss.includes(utility), "Compiled token fixture is missing " + utility);
}

for (const route of requiredRoutes) {
  assert(existsSync(routeHtmlPath(route)), `Missing static route: /${route}`);
}

assert(!existsSync(path.join(outDir, "obekty", "sample-resort", "index.html")), "Draft project route must not be exported.");

const sitemap = readFileSync(path.join(outDir, "sitemap.xml"), "utf8");
for (const route of requiredRoutes) {
  assert(!sitemap.includes(`${siteUrl}/${route}`), `Gated/noindex route leaked into sitemap: /${route}`);
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function textContent(value) {
  return decodeHtml(value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim());
}

function routeFromCanonical(canonical) {
  return canonical === "/" ? "" : canonical.replace(/^\//, "").replace(/\/$/, "");
}

function extract(html, pattern, label, route) {
  const match = html.match(pattern);
  assert(match, `Missing ${label} on /${route}/`);
  return decodeHtml(match[1]);
}

const concreteSeoEntries = [
  ...seoRegistry.filter((entry) => entry.kind === "static"),
  ...articles.map((article) => ({
    canonical: article.path,
    description: article.description,
    h1: article.title.replace(" | Море и Горы", ""),
    index: "gate",
    sitemap: "gate",
    title: article.title,
  })),
];

const renderedTitles = new Set();
const renderedDescriptions = new Set();
const renderedH1s = new Set();

for (const entry of concreteSeoEntries) {
  const route = routeFromCanonical(entry.canonical);
  const html = readFileSync(routeHtmlPath(route), "utf8");
  const title = textContent(extract(html, /<title>([\s\S]*?)<\/title>/, "title", route));
  const description = extract(html, /<meta name="description" content="([^"]*)"/, "description", route);
  const canonical = extract(html, /<link rel="canonical" href="([^"]*)"/, "canonical", route);
  const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];

  assert(title === entry.title, `Rendered title drift on /${route}/: "${title}"`);
  assert(description === entry.description, `Rendered description drift on /${route}/`);
  assert(canonical === new URL(entry.canonical, siteUrl).toString(), `Canonical drift on /${route}/`);
  assert(h1Matches.length === 1, `Expected one H1 on /${route}/, got ${h1Matches.length}`);
  assert(textContent(h1Matches[0][1]) === entry.h1, `Rendered H1 drift on /${route}/`);

  assert(!renderedTitles.has(title), `Duplicate rendered title: ${title}`);
  assert(!renderedDescriptions.has(description), `Duplicate rendered description: ${description}`);
  assert(!renderedH1s.has(entry.h1), `Duplicate rendered H1: ${entry.h1}`);
  renderedTitles.add(title);
  renderedDescriptions.add(description);
  renderedH1s.add(entry.h1);

  if (entry.index !== "yes") {
    assert(/name="robots" content="noindex, follow"/.test(html), `Expected noindex meta on /${route}/`);
  }
}

const htmlFiles = [];
function collectHtml(directory) {
  for (const entry of requireDirectory(directory)) {
    const resolved = path.join(directory, entry.name);
    if (entry.isDirectory()) collectHtml(resolved);
    else if (entry.name.endsWith(".html")) htmlFiles.push(resolved);
  }
}

function requireDirectory(directory) {
  return /** @type {import("node:fs").Dirent[]} */ (
    // Kept local to avoid introducing a parser dependency for generated HTML.
    readdirSync(directory, { withFileTypes: true })
  );
}

collectHtml(outDir);
for (const htmlFile of htmlFiles) {
  const html = readFileSync(htmlFile, "utf8");
  const inlineExecutableScripts = [...html.matchAll(/<script\b([^>]*)>[\s\S]*?<\/script>/g)].filter(
    (match) => !/\bsrc=/.test(match[1]) && !/type="application\/ld\+json"/.test(match[1]),
  );
  assert(
    inlineExecutableScripts.length === 0,
    `Inline executable script violates CSP in ${path.relative(outDir, htmlFile)}`,
  );

  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
    const href = decodeHtml(match[1]);
    if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/api/") || href.startsWith("/#")) continue;
    const pathname = href.split(/[?#]/, 1)[0];
    const target = pathname === "/" ? path.join(outDir, "index.html") : path.join(outDir, pathname.replace(/^\//, ""), "index.html");
    assert(existsSync(target), `Broken internal link ${href} in ${path.relative(outDir, htmlFile)}`);
  }
}

const notFoundHtml = readFileSync(path.join(outDir, "404.html"), "utf8");
assert(notFoundHtml.includes("Страница не найдена | Море и Горы"), "404 title is missing.");
assert(/name="robots" content="noindex, follow"/.test(notFoundHtml), "404 must be noindex, follow.");
assert(/<h1\b[^>]*>[\s\S]*?Такой страницы нет[\s\S]*?<\/h1>/.test(notFoundHtml), "404 H1 is missing.");

let maxInitialRouteJsGzipBytes = 0;
let maxInitialRoute = "/";
const chunkSizes = [];

for (const entry of concreteSeoEntries) {
  const route = routeFromCanonical(entry.canonical);
  const html = readFileSync(routeHtmlPath(route), "utf8");
  const scriptSources = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((match) => match[1]);
  let routeJsGzipBytes = 0;

  for (const source of scriptSources) {
    const scriptPath = path.join(outDir, source.replace(/^\//, ""));
    if (existsSync(scriptPath)) {
      const gzipBytes = zlib.gzipSync(readFileSync(scriptPath)).length;
      routeJsGzipBytes += gzipBytes;
      chunkSizes.push(gzipBytes);
    }
  }

  if (routeJsGzipBytes > maxInitialRouteJsGzipBytes) {
    maxInitialRouteJsGzipBytes = routeJsGzipBytes;
    maxInitialRoute = entry.canonical;
  }
}

const initialRouteJsGzipKb = Math.round(maxInitialRouteJsGzipBytes / 1024);
const largestLazyChunkKb = Math.round(Math.max(0, ...chunkSizes) / 1024);
const htmlSizeKb = Math.round(statSync(path.join(outDir, "index.html")).size / 1024);
const status = initialRouteJsGzipKb <= initialRouteJsBudgetGzipKb ? "PASS" : "FAIL";

console.log(
  JSON.stringify(
    {
      artifact: "out/",
      htmlSizeKb,
      initialRouteJsBudgetGzipKb,
      initialRouteJsGzipKb,
      initialRouteJsRoute: maxInitialRoute,
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

if (initialRouteJsGzipKb > initialRouteJsBudgetGzipKb) {
  throw new Error(
    `Initial route JS exceeds ${initialRouteJsBudgetGzipKb} KB gzip: ${initialRouteJsGzipKb} KB`,
  );
}
