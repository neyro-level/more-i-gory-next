import { existsSync, readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  articleSchema,
  landingPageSchema,
  pageContentSchema,
  regionSchema,
  seoEntrySchema,
} from "@more-i-gory/contracts";

const [{ articles }, { mediaAssets }, { pageContents }, { regionDtos }] = await Promise.all([
  import("../src/content/articles/articles.ts"),
  import("../src/content/media/media-assets.ts"),
  import("../src/content/pages/static-pages.ts"),
  import("../src/content/regions/region-dtos.ts"),
]);

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readJson(relativePath) {
  const absolutePath = path.join(projectRoot, relativePath);
  return JSON.parse(readFileSync(absolutePath, "utf8"));
}

function assertUnique(items, field, label) {
  const seen = new Set();

  for (const item of items) {
    const value = item[field];
    if (seen.has(value)) {
      throw new Error(`${label}: duplicate ${field} "${value}"`);
    }
    seen.add(value);
  }
}

function assertExists(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const resolved = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(resolved) : resolved;
    }),
  );
  return files.flat();
}

const media = mediaAssets;
const regions = regionSchema.array().parse(regionDtos);
const parsedArticles = articleSchema.array().parse(articles);
const pages = pageContentSchema.array().parse(pageContents);
const landingPages = landingPageSchema.array().parse([]);
const seoEntries = seoEntrySchema.array().parse(readJson("src/seo/registry.json"));

assertUnique(media, "id", "media registry");
assertUnique(regions, "id", "regions");
assertUnique(regions, "path", "regions");
assertUnique(parsedArticles, "id", "articles");
assertUnique(parsedArticles, "path", "articles");
assertUnique(pages, "id", "pages");
assertUnique(pages, "path", "pages");
assertUnique(landingPages, "pageId", "landing pages");

const mediaIds = new Set(media.map((asset) => asset.id));
const regionIds = new Set(regions.map((region) => region.id));
const seoByPageId = new Map(seoEntries.map((entry) => [entry.pageId, entry]));
const knownPaths = new Set([
  ...seoEntries.map((entry) => entry.canonical),
  ...parsedArticles.map((article) => article.path),
]);

for (const asset of media) {
  const absoluteFile = path.join(projectRoot, "public", asset.src.replace(/^\//, ""));
  assertExists(existsSync(absoluteFile), `media registry: missing file for ${asset.id}: ${asset.src}`);
}

for (const region of regions) {
  assertExists(mediaIds.has(region.heroMediaId), `regions: unknown heroMediaId "${region.heroMediaId}" in ${region.id}`);
  const seoEntry = seoByPageId.get(region.pageId);
  assertExists(seoEntry, `regions: unknown pageId "${region.pageId}" in ${region.id}`);
  assertExists(seoEntry?.canonical === region.path, `regions: ${region.id} path must match SEO canonical ${seoEntry?.canonical}`);
}

for (const article of parsedArticles) {
  const seoEntry = seoByPageId.get(article.targetPageId);
  assertExists(seoEntry?.kind === "dynamic", `articles: ${article.id} must target a dynamic SEO PAGE-ID`);

  for (const regionId of article.relatedRegionIds) {
    assertExists(regionIds.has(regionId), `articles: unknown relatedRegionId "${regionId}" in ${article.id}`);
  }

  assertExists(article.relatedProjectIds.length === 0, `articles: relatedProjectIds are disabled until Payload properties own public passports in ${article.id}`);
}

for (const page of pages) {
  const seoEntry = seoByPageId.get(page.id);
  assertExists(seoEntry, `pages: unknown page id "${page.id}"`);
  assertExists(seoEntry?.canonical === page.path, `pages: ${page.id} path must match SEO canonical ${seoEntry?.canonical}`);
}

for (const landingPage of landingPages) {
  const seoEntry = seoByPageId.get(landingPage.pageId);
  assertExists(seoEntry?.kind === "static", `landing pages: ${landingPage.pageId} must target a static SEO PAGE-ID`);
  assertExists(mediaIds.has(landingPage.mediaId), `landing pages: unknown mediaId "${landingPage.mediaId}" in ${landingPage.pageId}`);

  for (const link of [...landingPage.parentLinks, ...landingPage.childLinks]) {
    assertExists(knownPaths.has(link.href), `landing pages: unknown internal link "${link.href}" in ${landingPage.pageId}`);
  }
}

assertExists(existsSync(path.join(projectRoot, ".velite", "index.js")), "Velite output is missing. Run pnpm content:build first.");

const sourceFiles = await listFiles(path.join(projectRoot, "src"));
for (const file of sourceFiles.filter((item) => item.endsWith(".ts") || item.endsWith(".tsx"))) {
  const text = readFileSync(file, "utf8");
  assertExists(!text.includes("from \"velite\"") && !text.includes("from 'velite'"), `Velite must not be imported into src/: ${path.relative(projectRoot, file)}`);
}

const articleFiles = await listFiles(path.join(projectRoot, "content", "articles"));
const allowedDirective = /^::(note|warning|project-card|region-comparison|cta)\b/m;
for (const file of articleFiles.filter((item) => item.endsWith(".md"))) {
  const text = readFileSync(file, "utf8");
  const unknownDirectives = text
    .split(/\r?\n/)
    .filter((line) => line.startsWith("::") && !allowedDirective.test(line));
  assertExists(unknownDirectives.length === 0, `Unknown markdown directive in ${path.relative(projectRoot, file)}: ${unknownDirectives.join(", ")}`);
}

console.log("Content validation passed.");
