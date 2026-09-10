import { existsSync, readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const statusSchema = z.enum(["draft", "review", "published", "archived"]);

const mediaSchema = z
  .object({
    alt: z.string(),
    decorative: z.boolean(),
    height: z.number().int().positive(),
    id: z.string().min(1),
    kind: z.enum(["region", "project", "og", "ui"]),
    src: z.string().startsWith("/"),
    width: z.number().int().positive(),
  })
  .superRefine((asset, context) => {
    if (asset.decorative && asset.alt !== "") {
      context.addIssue({ code: "custom", message: `${asset.id}: decorative alt must be empty` });
    }

    if (!asset.decorative && asset.alt.trim().length < 8) {
      context.addIssue({ code: "custom", message: `${asset.id}: content alt is too short` });
    }
  });

const regionSchema = z.object({
  childPageIds: z.array(z.string()),
  heroMediaId: z.string().min(1),
  id: z.string().min(1),
  investmentThesis: z.string().min(20),
  lead: z.string().min(20),
  pageId: z.string().min(1),
  parentPageId: z.string().optional(),
  path: z.string().startsWith("/").endsWith("/"),
  primaryQuery: z.string().min(1),
  riskSummary: z.string().min(20),
  slug: z.string().min(1),
  status: statusSchema,
  title: z.string().min(1),
});

const projectSchema = z.object({
  budgetNote: z.string().min(1),
  coverMediaId: z.string().min(1),
  facts: z.array(z.string()),
  id: z.string().min(1),
  path: z.string().startsWith("/").endsWith("/"),
  regionId: z.string().min(1),
  riskSummary: z.string().min(20),
  slug: z.string().min(1),
  sourceIds: z.array(z.string()),
  status: statusSchema,
  title: z.string().min(1),
  verdict: z.string().min(20),
  verifiedAt: z.string().optional(),
});

const articleSchema = z.object({
  description: z.string().min(20),
  id: z.string().min(1),
  path: z.string().startsWith("/").endsWith("/"),
  primaryQuery: z.string().min(1),
  publishedAt: z.string().optional(),
  relatedProjectIds: z.array(z.string()),
  relatedRegionIds: z.array(z.string()),
  reviewedAt: z.string().optional(),
  secondaryQueries: z.array(z.string()),
  slug: z.string().min(1),
  sourceIds: z.array(z.string()),
  status: statusSchema,
  targetPageId: z.string().min(1),
  title: z.string().min(1),
});

const pageSchema = z.object({
  ctaPrimary: z.string().min(1),
  ctaSecondary: z.string().optional(),
  id: z.string().min(1),
  lead: z.string().min(20),
  mediaId: z.string().optional(),
  path: z.string().startsWith("/"),
  status: statusSchema,
  title: z.string().min(1),
});

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

const media = mediaSchema.array().parse(readJson("src/content/data/media.json"));
const regions = regionSchema.array().parse(readJson("src/content/data/regions.json"));
const projects = projectSchema.array().parse(readJson("src/content/data/projects.json"));
const articles = articleSchema.array().parse(readJson("src/content/data/articles.json"));
const pages = pageSchema.array().parse(readJson("src/content/data/pages.json"));

assertUnique(media, "id", "media registry");
assertUnique(regions, "id", "regions");
assertUnique(regions, "path", "regions");
assertUnique(projects, "id", "projects");
assertUnique(projects, "path", "projects");
assertUnique(articles, "id", "articles");
assertUnique(articles, "path", "articles");
assertUnique(pages, "id", "pages");
assertUnique(pages, "path", "pages");

const mediaIds = new Set(media.map((asset) => asset.id));
const regionIds = new Set(regions.map((region) => region.id));
const projectIds = new Set(projects.map((project) => project.id));

for (const asset of media) {
  const absoluteFile = path.join(projectRoot, "public", asset.src.replace(/^\//, ""));
  assertExists(existsSync(absoluteFile), `media registry: missing file for ${asset.id}: ${asset.src}`);
}

for (const region of regions) {
  assertExists(mediaIds.has(region.heroMediaId), `regions: unknown heroMediaId "${region.heroMediaId}" in ${region.id}`);
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
  for (const regionId of article.relatedRegionIds) {
    assertExists(regionIds.has(regionId), `articles: unknown relatedRegionId "${regionId}" in ${article.id}`);
  }

  for (const projectId of article.relatedProjectIds) {
    assertExists(projectIds.has(projectId), `articles: unknown relatedProjectId "${projectId}" in ${article.id}`);
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
