import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextDir = path.join(projectRoot, ".next");
const host = "127.0.0.1";
const port = Number.parseInt(process.env.VERIFY_RUNTIME_PORT ?? "4311", 10);
const baseUrl = `http://${host}:${port}`;
const siteUrl = new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? "http://127.0.0.1:4311").origin;
const initialRouteJsBudgetGzipKb = 210;
const largestChunkBudgetGzipKb = 300;

const seoRegistry = readJson("src/seo/registry.json");
const { articles } = await import("../src/content/articles/articles.ts");
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
  assert(response.status === expectedStatus, `${pathname} returned ${response.status}, expected ${expectedStatus}`);
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
  env: { ...process.env, NODE_ENV: "production" },
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
  assert(robots.body.includes(`${siteUrl}/sitemap.xml`), "robots.txt must reference the canonical sitemap.");
  const sitemap = await fetchRoute("/sitemap.xml");
  assert(sitemap.body.includes("<urlset"), "sitemap.xml must contain a URL set.");

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
    const title = textContent(extract(html, /<title>([\s\S]*?)<\/title>/, "title", route));
    const description = extract(html, /<meta name="description" content="([^"]*)"/, "description", route);
    const canonical = extract(html, /<link rel="canonical" href="([^"]*)"/, "canonical", route);
    const h1Matches = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];

    assert(title === entry.title, `Rendered title drift on ${pathname}: "${title}"`);
    assert(description === entry.description, `Rendered description drift on ${pathname}`);
    assert(canonical === new URL(entry.canonical, siteUrl).toString(), `Canonical drift on ${pathname}`);
    assert(h1Matches.length === 1, `Expected one H1 on ${pathname}, got ${h1Matches.length}`);
    assert(textContent(h1Matches[0][1]) === entry.h1, `Rendered H1 drift on ${pathname}`);
    assert(!renderedTitles.has(title), `Duplicate rendered title: ${title}`);
    assert(!renderedDescriptions.has(description), `Duplicate rendered description: ${description}`);
    assert(!renderedH1s.has(entry.h1), `Duplicate rendered H1: ${entry.h1}`);
    renderedTitles.add(title);
    renderedDescriptions.add(description);
    renderedH1s.add(entry.h1);

    if (entry.index !== "yes") {
      assert(/name="robots" content="noindex, follow"/.test(html), `Expected noindex meta on ${pathname}`);
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
