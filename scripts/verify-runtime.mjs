import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";
import {
  assertBreadcrumbAgreement,
  inspectSeoDocument,
  parseSitemapLocations,
} from "./lib/seo-crawl-invariants.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextDir = path.join(projectRoot, ".next");
const host = "127.0.0.1";
const port = Number.parseInt(process.env.VERIFY_RUNTIME_PORT ?? "4311", 10);
const baseUrl = `http://${host}:${port}`;
const siteUrl = new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? "http://127.0.0.1:4311").origin;
const stagingContour = process.env.AMS_RUNTIME_CONTOUR === "staging";
const initialRouteJsBudgetGzipKb = 210;
const largestChunkBudgetGzipKb = 300;

const seoRegistry = readJson("src/seo/registry.json");
const urlMigrationManifest = readJson("docs/migration/V5_URL_MANIFEST.json");
const { articles } = await import("../src/content/articles/articles.ts");
const { regionSeedContent } = await import("../src/content/regions/region-seed-content.ts");
const { getRegionRoutePlan } = await import("../src/content/regions/region-route-plan.ts");
const { resolveRegionActivation } = await import("../src/core/regions/activation.ts");
const unpublishedGenericRegionPaths = new Set(
  getRegionRoutePlan()
    .filter((entry) => resolveRegionActivation(regionSeedContent[entry.key]?.status) === "PREPARED_OFF")
    .map((entry) => entry.path),
);
const stubGenericRegionPaths = new Set(
  getRegionRoutePlan()
    .filter((entry) => resolveRegionActivation(regionSeedContent[entry.key]?.status) === "STUB_NO_INDEX")
    .map((entry) => entry.path),
);
const inactiveGeoRedirects = urlMigrationManifest.entries.filter(
  (entry) => entry.migrationAction === "REDIRECT_301"
    && entry.targetUrl
    && unpublishedGenericRegionPaths.has(entry.targetUrl),
);
const concreteSeoEntries = [
  ...seoRegistry.filter((entry) => entry.kind === "static" && !unpublishedGenericRegionPaths.has(entry.canonical)),
  ...articles.map((article) => ({
    canonical: article.path,
    description: article.description,
    h1: article.title.replace(" | Море и Горы", ""),
    index: "gate",
    sitemap: "gate",
    title: article.title,
  })),
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(projectRoot, relativePath), "utf8"));
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

function expectedRenderedTitle(entry, pathname) {
  if (pathname === "/") return entry.title;
  const pageTitle = entry.title.replace(/\s*\|\s*Море и Горы$/u, "");
  return `${pageTitle} | Море и Горы`;
}

function extract(html, pattern, label, route) {
  const match = html.match(pattern);
  assert(match, `Missing ${label} on /${route}/`);
  return decodeHtml(match[1]);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const resolved = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(resolved) : [resolved];
  });
}

function routePatternFromManifestKey(key) {
  const route = key
    .replace(/\/page$/, "")
    .replace(/\/(\([^/]+\))/g, "") || "/";
  const pattern = route
    .split("/")
    .map((segment) => {
      if (/^\[\[\.\.\..+\]\]$/.test(segment)) return "(?:[^/]+(?:/[^/]+)*)?";
      if (/^\[\.\.\..+\]$/.test(segment)) return "[^/]+(?:/[^/]+)*";
      if (/^\[.+\]$/.test(segment)) return "[^/]+";
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return new RegExp(`^${pattern || "/"}$`);
}

function manifestKeyForRoute(route, appPathRoutesManifest) {
  const pathname = route ? `/${route}` : "/";
  const exactKey = route ? `/${route}/page` : "/page";
  const manifestKey = appPathRoutesManifest[exactKey]
    ? exactKey
    : Object.keys(appPathRoutesManifest).find((key) => routePatternFromManifestKey(key).test(pathname));
  assert(manifestKey, `Route manifest entry is missing for ${pathname}`);
  return manifestKey;
}

async function fetchRoute(pathname, expectedStatus = 200) {
  const response = await fetch(new URL(pathname, baseUrl), { redirect: "manual" });
  assert(
    response.status === expectedStatus,
    `${pathname} returned ${response.status}, expected ${expectedStatus}.\n${serverLogs.join("")}`,
  );
  return { body: await response.text(), response };
}

async function waitForServer(server, logs) {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`next start exited early.\n${logs.join("")}`);
    try {
      const response = await fetch(baseUrl, { redirect: "manual" });
      if (response.status === 200) return;
    } catch {
      // Server startup is still in progress.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`next start did not become ready at ${baseUrl}.\n${logs.join("")}`);
}

assert(Number.isInteger(port) && port > 0 && port < 65_536, "VERIFY_RUNTIME_PORT must be a valid port.");
assert(existsSync(path.join(nextDir, "BUILD_ID")), ".next production build is missing.");

const appPathRoutesManifest = readJson(".next/app-path-routes-manifest.json");
const serverLogs = [];
const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");
const server = spawn(process.execPath, [nextBin, "start", "-H", host, "-p", String(port)], {
  cwd: projectRoot,
  env: { ...process.env, NODE_ENV: "production", VERIFY_RUNTIME: "1" },
  stdio: ["ignore", "pipe", "pipe"],
});

for (const stream of [server.stdout, server.stderr]) {
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    serverLogs.push(chunk);
    if (serverLogs.join("").length > 20_000) serverLogs.shift();
  });
}

try {
  await waitForServer(server, serverLogs);

  const robots = await fetchRoute("/robots.txt");
  if (stagingContour) {
    assert(/Disallow:\s*\//.test(robots.body), "Staging robots.txt must disallow all crawlers.");
    assert(!robots.body.includes("Sitemap:"), "Staging robots.txt must not advertise a sitemap.");
  } else {
    assert(robots.body.includes(`${siteUrl}/sitemap.xml`), "robots.txt must reference the canonical sitemap.");
  }
  const sitemap = await fetchRoute("/sitemap.xml");
  assert(sitemap.body.includes("<urlset"), "sitemap.xml must contain a URL set.");
  const sitemapLocations = parseSitemapLocations(sitemap.body);
  const sitemapPaths = new Set();
  for (const location of sitemapLocations) {
    const url = new URL(location);
    assert(url.origin === siteUrl, `Sitemap URL has a foreign origin: ${location}`);
    const crawled = await fetchRoute(url.pathname);
    const document = inspectSeoDocument(crawled.body);
    assert(!document.robots.includes("noindex"), `Sitemap URL is noindex: ${url.pathname}`);
    assert(document.canonical === location, `Sitemap URL is not self-canonical: ${url.pathname}`);
    assert(document.h1s.length === 1, `Sitemap URL must render exactly one H1: ${url.pathname}`);
    assertBreadcrumbAgreement(document, url.pathname);
    sitemapPaths.add(url.pathname);
  }
  for (const pathname of unpublishedGenericRegionPaths) {
    const region = await fetchRoute(pathname, stagingContour ? 200 : 404);
    if (stagingContour) {
      assert(
        /name="robots" content="noindex, follow"/.test(region.body),
        `Preview-only region must remain noindex: ${pathname}`,
      );
    }
    assert(!sitemap.body.includes(`<loc>${new URL(pathname, siteUrl).toString()}</loc>`), `Hidden region leaked into sitemap: ${pathname}`);
  }
  for (const pathname of stubGenericRegionPaths) {
    const region = await fetchRoute(pathname, 200);
    assert(/name="robots" content="noindex, follow"/.test(region.body), `Stub region must remain noindex: ${pathname}`);
    assert(!sitemap.body.includes(`<loc>${new URL(pathname, siteUrl).toString()}</loc>`), `Stub region leaked into sitemap: ${pathname}`);
  }
  for (const entry of inactiveGeoRedirects) {
    const legacy = await fetchRoute(entry.currentCanonical, stagingContour ? 308 : 404);
    if (stagingContour) {
      const location = legacy.response.headers.get("location");
      assert(
        location && new URL(location, baseUrl).pathname === entry.targetUrl,
        `Legacy geo redirect target drift: ${entry.currentCanonical}`,
      );
    }
  }

  const cssFiles = walk(path.join(nextDir, "static")).filter((file) => file.endsWith(".css"));
  const compiledCss = cssFiles.map((file) => readFileSync(file, "utf8")).join("\n");
  for (const utility of [
    ".text-h1",
    ".text-body-lg",
    ".max-w-site",
    ".max-w-narrow",
    ".py-section-md",
    ".rounded-card",
    ".rounded-large",
    ".duration-150",
    ".aspect-card",
  ]) {
    assert(compiledCss.includes(utility), `Compiled token fixture is missing ${utility}`);
  }

  const renderedTitles = new Set();
  const renderedDescriptions = new Set();
  const renderedH1s = new Set();
  let maxInitialRouteJsGzipBytes = 0;
  let maxInitialRoute = "/";
  let largestChunkGzipBytes = 0;
  const checkedManifestKeys = new Set();

  for (const entry of concreteSeoEntries) {
    const route = routeFromCanonical(entry.canonical);
    const pathname = route ? `/${route}/` : "/";
    const { body: html } = await fetchRoute(pathname);
    const inspected = inspectSeoDocument(html);
    const title = textContent(extract(html, /<title>([\s\S]*?)<\/title>/, "title", route));
    const description = extract(html, /<meta name="description" content="([^"]*)"/, "description", route);
    const canonical = extract(html, /<link rel="canonical" href="([^"]*)"/, "canonical", route);
    const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];

    assert(title === expectedRenderedTitle(entry, pathname), `Rendered title drift on ${pathname}: "${title}"`);
    assert(description === entry.description, `Rendered description drift on ${pathname}`);
    assert(canonical === new URL(entry.canonical, siteUrl).toString(), `Canonical drift on ${pathname}`);
    assert(h1Matches.length === 1, `Expected one H1 on ${pathname}, got ${h1Matches.length}`);
    assert(textContent(h1Matches[0][1]) === entry.h1, `Rendered H1 drift on ${pathname}`);
    assert(!renderedTitles.has(title), `Duplicate rendered title: ${title}`);
    assert(!renderedDescriptions.has(description), `Duplicate rendered description: ${description}`);
    assert(!renderedH1s.has(entry.h1), `Duplicate rendered H1: ${entry.h1}`);
    assertBreadcrumbAgreement(inspected, pathname);
    for (const href of inspected.internalLinks) {
      const linkedPath = new URL(href, baseUrl).pathname;
      if (!stagingContour) {
        assert(!unpublishedGenericRegionPaths.has(linkedPath), `Public page ${pathname} links to PREPARED_OFF geo ${linkedPath}`);
      }
      assert(!/^\/krym\/(?:yalta|sevastopol|evpatoriya|alushta)\/(?:novostroyki|apartamenty)\/$/.test(linkedPath), `Unsupported city-category link on ${pathname}: ${linkedPath}`);
    }
    renderedTitles.add(title);
    renderedDescriptions.add(description);
    renderedH1s.add(entry.h1);

    if (entry.index !== "yes") {
      assert(/name="robots" content="noindex, follow"/.test(html), `Expected noindex meta on ${pathname}`);
      assert(!sitemapPaths.has(pathname), `Noindex route leaked into sitemap: ${pathname}`);
    }

    const manifestKey = manifestKeyForRoute(route, appPathRoutesManifest);
    checkedManifestKeys.add(manifestKey);
    let routeJsGzipBytes = 0;
    const scriptSources = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((match) => match[1]))];
    for (const source of scriptSources) {
      assert(source.startsWith("/"), `External initial script is not allowed on ${pathname}: ${source}`);
      const scriptPath = source.startsWith("/_next/")
        ? path.join(nextDir, source.replace(/^\/_next\//, ""))
        : path.join(projectRoot, "public", source.replace(/^\//, ""));
      assert(existsSync(scriptPath) && statSync(scriptPath).isFile(), `Route JS file is missing: ${source}`);
      const gzipBytes = zlib.gzipSync(readFileSync(scriptPath)).length;
      routeJsGzipBytes += gzipBytes;
      largestChunkGzipBytes = Math.max(largestChunkGzipBytes, gzipBytes);
    }
    if (routeJsGzipBytes > maxInitialRouteJsGzipBytes) {
      maxInitialRouteJsGzipBytes = routeJsGzipBytes;
      maxInitialRoute = pathname;
    }
  }

  const notFound = await fetchRoute("/__runtime-proof-not-found__/", 404);
  assert(notFound.body.includes("Страница не найдена | Море и Горы"), "404 title is missing.");
  assert(/name="robots" content="noindex, follow"/.test(notFound.body), "404 must be noindex, follow.");
  assert(/<h1\b[^>]*>[\s\S]*?Такой страницы нет[\s\S]*?<\/h1>/.test(notFound.body), "404 H1 is missing.");

  await fetchRoute("/krym/yalta/novostroyki/", 404);
  await fetchRoute("/krym/unknown-market/", 404);

  const filteredCatalog = await fetchRoute("/obekty/?city=yalta");
  const filteredCatalogDocument = inspectSeoDocument(filteredCatalog.body);
  assert(filteredCatalogDocument.robots.includes("noindex"), "Catalog query state must be noindex.");
  assert(filteredCatalogDocument.canonical === new URL("/obekty/", siteUrl).toString(), "Catalog query canonical must resolve to /obekty/.");

  if (stagingContour) {
    const previewProject = await fetchRoute("/obekty/preview-project/");
    assert(inspectSeoDocument(previewProject.body).robots.includes("noindex"), "Preview project must remain noindex.");
  } else {
    await fetchRoute("/obekty/preview-project/", 404);
  }

  const initialRouteJsGzipKb = Math.round(maxInitialRouteJsGzipBytes / 1024);
  const largestChunkGzipKb = Math.round(largestChunkGzipBytes / 1024);
  assert(
    largestChunkGzipKb <= largestChunkBudgetGzipKb,
    `Largest route-manifest chunk exceeds ${largestChunkBudgetGzipKb} KB gzip: ${largestChunkGzipKb} KB`,
  );
  assert(
    initialRouteJsGzipKb <= initialRouteJsBudgetGzipKb,
    `Initial route JS exceeds ${initialRouteJsBudgetGzipKb} KB gzip: ${initialRouteJsGzipKb} KB on ${maxInitialRoute}`,
  );

  console.log(JSON.stringify({
    baseUrl,
    initialRouteJsBudgetGzipKb,
    initialRouteJsGzipKb,
    initialRouteJsRoute: maxInitialRoute,
    largestChunkGzipKb,
    manifestRoutes: checkedManifestKeys.size,
    requiredRoutes: concreteSeoEntries.length,
    sitemapMismatchCount: 0,
    sitemapUrls: sitemapLocations.length,
    runtime: "next start",
    status: "PASS",
  }, null, 2));
} finally {
  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
}
