import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const findings = [];

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const full = join(directory, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function report(severity, file, rule) {
  findings.push({ severity, file: relative(root, file), rule });
}

const sourceFiles = walk(join(root, "src")).filter((file) => /\.(ts|tsx)$/.test(file));
const projectUiFiles = sourceFiles.filter(
  (file) =>
    !file.includes(join("src", "components", "ui")) &&
    !file.includes(join("src", "ui", "interactive")) &&
    !file.endsWith(join("src", "lib", "button-variants.ts")),
);

const projectPatterns = [
  ["P1", /#[0-9a-f]{3,8}\b|\brgb\(|\bhsl\(|\boklch\(/i, "raw color in project UI"],
  ["P1", /\bdark:/, "dark variant while dark mode is disabled"],
  ["P1", /\btext-(?:page-title|section-title|card-title|lead)\b/, "legacy typography role"],
  ["P1", /\brounded-(?:surface|feature|hero)\b/, "legacy radius role"],
  ["P2", /\b(?:max-w|rounded|py|px|text|gap|aspect|min-h)-\[[^\]]+\]/, "arbitrary system value"],
  ["P2", /\btext-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)\b/, "raw project typography size"],
  ["P2", /\bstyle=/, "inline style in project UI"],
  ["P2", /[☰✓↗]/, "text glyph used instead of canonical Lucide icon"],
  ["P1", /<img\b/, "raw img bypasses project media contract"],
];

for (const file of projectUiFiles) {
  const content = readFileSync(file, "utf8");
  for (const [severity, pattern, rule] of projectPatterns) {
    if (pattern.test(content)) report(severity, file, rule);
  }
}

for (const file of sourceFiles) {
  const content = readFileSync(file, "utf8");
  if (/\bdark:/.test(content)) report("P1", file, "dark variant while dark mode is disabled");
  if (/^[\"']use client[\"'];?/m.test(content) && !file.includes(join("src", "ui", "interactive"))) {
    report("P1", file, "client boundary outside approved interactive leaf");
  }
}

const globalsPath = join(root, "src", "app", "(site)", "globals.css");
const globalsCss = readFileSync(globalsPath, "utf8");
if (/@custom-variant\s+dark|^\.dark\s*\{/m.test(globalsCss)) {
  report("P1", globalsPath, "dark-mode foundation exists while project mode is disabled");
}
if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(globalsCss)) {
  report("P1", globalsPath, "missing reduced-motion foundation");
}
if (existsSync(join(root, "tailwind.config.js")) || existsSync(join(root, "tailwind.config.ts"))) {
  report("P1", root, "unexpected Tailwind 4 config bridge");
}

const requiredTokens = [
  "--color-success",
  "--color-warning",
  "--color-surface-dark",
  "--radius-control",
  "--radius-card",
  "--radius-large",
  "--container-narrow",
  "--container-site",
  "--spacing-section-sm",
  "--spacing-section-md",
  "--spacing-section-lg",
  "--spacing-section-hero",
  "--text-h1",
  "--text-h2",
  "--text-h3",
  "--text-h4",
  "--text-body-lg",
  "--text-body",
  "--text-body-sm",
  "--text-label",
  "--text-caption",
  "--ease-standard",
  "--aspect-hero",
  "--aspect-card",
  "--aspect-object",
];

for (const token of requiredTokens) {
  if (!globalsCss.includes(token)) report("P1", globalsPath, "missing required token " + token);
}

const combinedSource = sourceFiles.map((file) => readFileSync(file, "utf8")).join("\n");
const requiredUtilities = [
  "text-h1",
  "text-h2",
  "text-h3",
  "text-h4",
  "text-body-lg",
  "text-body",
  "text-body-sm",
  "text-label",
  "text-caption",
  "max-w-site",
  "max-w-narrow",
  "py-section-sm",
  "py-section-md",
  "py-section-lg",
  "py-section-hero",
  "rounded-control",
  "rounded-card",
  "rounded-large",
  "duration-fast",
  "ease-standard",
  "aspect-hero",
  "aspect-card",
  "aspect-object",
];

for (const utility of requiredUtilities) {
  if (!combinedSource.includes(utility)) report("P2", globalsPath, "project token has no consumer " + utility);
}

const leadFormPath = join(root, "src", "ui", "interactive", "lead-form.tsx");
const leadForm = readFileSync(leadFormPath, "utf8");
for (const field of ["name", "phone", "task", "accepted"]) {
  if (!leadForm.includes('id="' + field + '-error"') || !leadForm.includes('aria-describedby=')) {
    report("P1", leadFormPath, "missing programmatic error association for " + field);
  }
}

const scenarioPath = join(root, "src", "components", "marketing", "scenario-table.tsx");
if (!readFileSync(scenarioPath, "utf8").includes('from "@/components/ui/table"')) {
  report("P1", scenarioPath, "semantic data table does not use canonical shadcn Table");
}

if (findings.length > 0) {
  console.error(JSON.stringify(findings, null, 2));
  throw new Error("UI drift audit failed with " + findings.length + " finding(s).");
}

console.log("ui drift audit ok");
