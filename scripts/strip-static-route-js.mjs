import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const outDir = path.join(projectRoot, "out");

const clientRoutePrefixes = new Set(["kontakty", "podbor"]);

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const resolved = path.join(directory, entry);
    return statSync(resolved).isDirectory() ? walk(resolved) : [resolved];
  });
}

function routeKey(htmlFile) {
  const relative = path.relative(outDir, htmlFile).replaceAll(path.sep, "/");
  return relative === "index.html" ? "" : relative.replace(/\/index\.html$/, "");
}

function needsClientRuntime(route) {
  const firstSegment = route.split("/")[0];
  return clientRoutePrefixes.has(firstSegment);
}

function stripNextRuntime(html) {
  return html
    .replace(/<link[^>]+rel="preload"[^>]+as="script"[^>]*>/g, "")
    .replace(/<link[^>]+as="script"[^>]+rel="preload"[^>]*>/g, "")
    .replace(/<script\b(?!(?=[^>]*type="application\/ld\+json"))[^>]*src="\/_next\/static\/chunks\/[^"]+\.js"[^>]*><\/script>/g, "")
    .replace(/<script\b(?!(?=[^>]*type="application\/ld\+json"))[^>]*>\s*self\.__next_[\s\S]*?<\/script>/g, "")
    .replace(/<script\b(?!(?=[^>]*type="application\/ld\+json"))[^>]*>\s*\(self\.__next_[\s\S]*?<\/script>/g, "");
}

const htmlFiles = walk(outDir).filter((file) => file.endsWith(".html"));
const strippedRoutes = [];

for (const file of htmlFiles) {
  const route = routeKey(file);
  if (needsClientRuntime(route)) {
    continue;
  }

  const before = readFileSync(file, "utf8");
  const after = stripNextRuntime(before);

  if (after !== before) {
    writeFileSync(file, after);
    strippedRoutes.push(route === "" ? "/" : `/${route}/`);
  }
}

console.log(
  JSON.stringify(
    {
      clientRuntimeKeptFor: [...clientRoutePrefixes].map((route) => `/${route}/`),
      strippedRoutes: strippedRoutes.length,
    },
    null,
    2,
  ),
);
