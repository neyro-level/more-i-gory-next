import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const seoEntrySchema = z.object({
  canonical: z.string().startsWith("/"),
  contentGate: z.string().min(1),
  description: z.string().min(40),
  h1: z.string().min(1),
  index: z.enum(["yes", "gate", "trust_gate", "noindex"]),
  kind: z.enum(["static", "dynamic"]),
  pageId: z.string().regex(/^PAGE-\d{3}$/),
  primaryQuery: z.string().min(1),
  priority: z.enum(["P1", "P2", "P3"]),
  secondaryQueries: z.array(z.string()),
  sitemap: z.enum(["yes", "gate", "no"]),
  title: z.string().min(10),
});

function readJson(relativePath) {
  return JSON.parse(readFileSync(path.join(projectRoot, relativePath), "utf8"));
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

function normalize(value) {
  return value.toLocaleLowerCase("ru-RU").replace(/[ё]/g, "е");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const entries = seoEntrySchema.array().parse(readJson("src/seo/registry.json"));
assert(entries.length === 23, `SEO registry must contain 23 PAGE-ID entries, got ${entries.length}`);

assertUnique(entries, "pageId", "SEO registry");
assertUnique(entries, "canonical", "SEO registry");
assertUnique(entries, "title", "SEO registry");
assertUnique(entries, "description", "SEO registry");
assertUnique(entries, "h1", "SEO registry");

for (const entry of entries) {
  assert(entry.canonical.endsWith("/"), `${entry.pageId}: canonical must use trailing slash`);
  assert(entry.title.length <= 80, `${entry.pageId}: title is too long`);
  assert(entry.description.length <= 190, `${entry.pageId}: description is too long`);

  if (entry.index === "noindex") {
    assert(entry.sitemap === "no", `${entry.pageId}: noindex page must be excluded from sitemap`);
  }

  if (entry.sitemap === "yes") {
    assert(entry.index === "yes", `${entry.pageId}: sitemap=yes requires index=yes`);
  }

  if (entry.kind === "static" && entry.priority !== "P3") {
    const normalizedTitle = normalize(entry.title);
    const normalizedQuery = normalize(entry.primaryQuery);
    assert(
      normalizedTitle.startsWith(normalizedQuery) || normalizedTitle.includes(normalizedQuery),
      `${entry.pageId}: title must contain primary query "${entry.primaryQuery}"`,
    );
  }
}

const nextConfig = readFileSync(path.join(projectRoot, "next.config.ts"), "utf8");
assert(!nextConfig.includes("redirects()"), "Redirects require an approved explicit URL migration map.");

console.log("SEO validation passed.");
