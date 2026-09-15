import { existsSync, readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  articleSchema,
  landingPageSchema,
  mediaAssetSchema,
  pageContentSchema,
  projectSchema,
  regionSchema,
  seoEntrySchema,
} from "@more-i-gory/contracts";

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

const media = mediaAssetSchema.array().parse(readJson("src/content/data/media.json"));
const regions = regionSchema.array().parse(readJson("src/content/data/regions.json"));
const projects = projectSchema.array().parse(readJson("src/content/data/projects.json"));
const articles = articleSchema.array().parse(readJson("src/content/data/articles.json"));
const pages = pageContentSchema.array().parse(readJson("src/content/data/pages.json"));
const landingPages = landingPageSchema.array().parse(readJson("src/content/data/landing-pages.json"));
const seoEntries = seoEntrySchema.array().parse(readJson("src/seo/registry.json"));

assertUnique(media, "id", "media registry");
assertUnique(regions, "id", "regions");
assertUnique(regions, "path", "regions");
assertUnique(projects, "id", "projects");
assertUnique(projects, "path", "projects");
assertUnique(articles, "id", "articles");
assertUnique(articles, "path", "articles");
assertUnique(pages, "id", "pages");
assertUnique(pages, "path", "pages");
assertUnique(landingPages, "pageId", "landing pages");

const mediaIds = new Set(media.map((asset) => asset.id));
const regionIds = new Set(regions.map((region) => region.id));
const projectIds = new Set(projects.map((project) => project.id));
const seoByPageId = new Map(seoEntries.map((entry) => [entry.pageId, entry]));
const knownPaths = new Set([
  ...seoEntries.map((entry) => entry.canonical),
  ...articles.map((article) => article.path),
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

for (const project of projects) {
  assertExists(regionIds.has(project.regionId), `projects: unknown regionId "${project.regionId}" in ${project.id}`);
  assertExists(mediaIds.has(project.coverMediaId), `projects: unknown coverMediaId "${project.coverMediaId}" in ${project.id}`);

  if (project.status === "published") {
    assertExists(project.verifiedAt, `projects: published ${project.id} requires verifiedAt`);
    assertExists(project.sourceIds.length > 0, `projects: published ${project.id} requires sourceIds`);
  }
}

for (const article of articles) {
  const seoEntry = seoByPageId.get(article.targetPageId);
  assertExists(seoEntry?.kind === "dynamic", `articles: ${article.id} must target a dynamic SEO PAGE-ID`);

  for (const regionId of article.relatedRegionIds) {
    assertExists(regionIds.has(regionId), `articles: unknown relatedRegionId "${regionId}" in ${article.id}`);
  }

  for (const projectId of article.relatedProjectIds) {
    assertExists(projectIds.has(projectId), `articles: unknown relatedProjectId "${projectId}" in ${article.id}`);
  }
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
