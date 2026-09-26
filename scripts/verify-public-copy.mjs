import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRoots = [
  "src/app/(site)",
  "src/components/marketing",
  "src/components/pages",
  "src/components/templates",
  "src/content/articles/articles.ts",
  "src/content/home",
];

export const forbiddenPublicTerms = [
  "content gate",
  "human gate",
  "parent relation",
  "url-contract",
  "technical urls",
  "commercial seo traffic",
  "informational demand",
  "verifiedat",
  "sitemap",
  "noindex",
  "draft",
  "slug",
  "cms",
  "seo",
];

function walk(target) {
  const absolute = path.join(projectRoot, target);
  if (!readdirSync) return [];
  try {
    return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
      const relative = path.join(target, entry.name);
      return entry.isDirectory() ? walk(relative) : [relative];
    });
  } catch {
    return [target];
  }
}

export function collectPublicCopyViolations(source, file = "fixture.tsx") {
  const candidates = [];
  const literalPattern = /(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  for (const match of source.matchAll(literalPattern)) {
    const value = match[2].replace(/\\[nrt]/g, " ").trim();
    if (/[А-Яа-яЁё]|\s/.test(value)) candidates.push({ index: match.index ?? 0, value });
  }
  const jsxPattern = />([^<>{}]+)</g;
  for (const match of source.matchAll(jsxPattern)) {
    const value = match[1].replace(/\s+/g, " ").trim();
    if (/[А-Яа-яЁё]/.test(value)) candidates.push({ index: match.index ?? 0, value });
  }

  return candidates.flatMap(({ index, value }) => {
    const normalized = value.toLocaleLowerCase("ru-RU");
    return forbiddenPublicTerms
      .filter((term) => normalized.includes(term))
      .map((term) => ({ column: index - source.lastIndexOf("\n", index), file, line: source.slice(0, index).split("\n").length, term, value }));
  });
}

export function verifyPublicCopy() {
  const files = publicRoots.flatMap(walk).filter((file) => /\.(?:ts|tsx)$/.test(file));
  return files.flatMap((file) => collectPublicCopyViolations(readFileSync(path.join(projectRoot, file), "utf8"), file));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const violations = verifyPublicCopy();
  if (violations.length > 0) {
    for (const item of violations) console.error(`${item.file}:${item.line}:${item.column} public copy contains "${item.term}": ${item.value}`);
    process.exit(1);
  }
  console.log(`[public-copy] PASS: ${publicRoots.length} public source roots checked.`);
}
