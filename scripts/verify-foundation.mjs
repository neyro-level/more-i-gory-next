import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const requiredFiles = [
  "next.config.ts",
  "components.json",
  "src/app/(site)/layout.tsx",
  "src/app/(site)/page.tsx",
  "src/app/(site)/globals.css",
  "src/app/(site)/not-found.tsx",
  "src/app/(payload)/layout.tsx",
  "src/app/(payload)/admin/[[...segments]]/page.tsx",
  "src/app/(payload)/api/[...slug]/route.ts",
  "payload.config.ts",
  "src/project/env.ts",
  "src/project/collections/users.ts",
  "src/core/access/index.ts",
  "src/core/data-access/public/gateway.ts",
  "src/core/data-access/public/index.ts",
  "src/core/data-access/system/index.ts",
  "src/core/data-access/system/gateway.ts",
  "src/core/data-access/system/bootstrap-owner.ts",
  "src/core/data-access/system/dispatch-due-feeds.ts",
  "src/core/data-access/system/import-feed-run.ts",
  "src/core/cache/invalidator.ts",
  "src/core/dto/index.ts",
  "src/core/query/index.ts",
  "src/core/security/outbound-http/index.ts",
  "src/core/security/redaction/index.ts",
  "src/core/observability/index.ts",
  "src/core/lib/index.ts",
  "src/ui/interactive/.gitkeep",
  ".env.example",
  "docs/README.md",
  "docs/01_PRD.md",
  "docs/02_PRODUCT_STRUCTURE.md",
  "docs/03_ARCHITECTURE.md",
  "docs/04_BACKLOG.md",
  "docs/05_RELEASE_CHECKLIST.md",
  "docs/06_DESIGN_SYSTEM.md",
  "docs/TECHNICAL_CORE.md",
];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    throw new Error(`Missing required foundation file: ${file}`);
  }
}

const canonicalAdrDirectory = join(root, "docs", "adr");
if (
  !existsSync(canonicalAdrDirectory) ||
  !statSync(canonicalAdrDirectory).isDirectory()
) {
  throw new Error("Canonical ADR directory must exist at docs/adr");
}

// These paths are resolved against the project root. Root-level `adr` remains
// legacy, while the canonical `docs/adr` directory above is required.
const forbiddenRootLegacyDocPaths = [
  "00_PROJECT_BRIEF.md",
  "01_PRD.md",
  "02_PRODUCT_STRUCTURE.md",
  "03_ARCHITECTURE.md",
  "04_RISKS_AND_SCOPE.md",
  "05_BACKLOG.md",
  "06_TECH_DEBT.md",
  "07_RELEASE_CHECKLIST.md",
  "08_DESIGN_SYSTEM.md",
  "01_research",
  "Old doki",
  "adr",
];

for (const legacyPath of forbiddenRootLegacyDocPaths) {
  if (existsSync(join(root, legacyPath))) {
    throw new Error(`Legacy documentation path must not return: ${legacyPath}`);
  }
}

const canonicalDocs = requiredFiles.filter((file) => file.startsWith("docs/"));
for (const file of canonicalDocs) {
  const text = readFileSync(join(root, file), "utf8");
  if (!text.includes("**Статус:** Active") && file !== "docs/README.md") {
    throw new Error(`Canonical document must have Active status: ${file}`);
  }
}

const docsIndex = readFileSync(join(root, "docs", "README.md"), "utf8");
for (const file of canonicalDocs.filter((file) => file !== "docs/README.md")) {
  const basename = file.split("/").at(-1);
  if (!docsIndex.includes(basename)) {
    throw new Error(`docs/README.md must reference canonical document: ${basename}`);
  }
}

const shadcnConfig = JSON.parse(
  readFileSync(join(root, "components.json"), "utf8"),
);
const expectedShadcnConfig = {
  style: "base-nova",
  rsc: true,
  tsx: true,
  iconLibrary: "lucide",
};

for (const [key, expected] of Object.entries(expectedShadcnConfig)) {
  if (shadcnConfig[key] !== expected) {
    throw new Error(`components.json ${key} must be ${JSON.stringify(expected)}`);
  }
}

if (
  shadcnConfig.tailwind?.css !== "src/app/(site)/globals.css" ||
  shadcnConfig.tailwind?.baseColor !== "neutral" ||
  shadcnConfig.tailwind?.cssVariables !== true
) {
  throw new Error("components.json must keep the Tailwind 4 neutral CSS-variable contract");
}

const expectedAliases = {
  components: "@/components",
  hooks: "@/hooks",
  lib: "@/lib",
  ui: "@/components/ui",
  utils: "@/lib/utils",
};

for (const [key, expected] of Object.entries(expectedAliases)) {
  if (shadcnConfig.aliases?.[key] !== expected) {
    throw new Error(`components.json alias ${key} must be ${expected}`);
  }
}

const allowedRegistries = new Set(["@ams", "@shadcn"]);
for (const registry of Object.keys(shadcnConfig.registries ?? {})) {
  if (!allowedRegistries.has(registry)) {
    throw new Error(`Community shadcn registry is not allowed: ${registry}`);
  }
}

const requiredPrimitives = [
  "alert",
  "badge",
  "button",
  "card",
  "field",
  "input",
  "label",
  "separator",
  "sheet",
  "textarea",
  "table",
];

for (const primitive of requiredPrimitives) {
  if (!existsSync(join(root, "src", "components", "ui", `${primitive}.tsx`))) {
    throw new Error(`Missing canonical shadcn primitive: ${primitive}`);
  }
}

if (!existsSync(join(root, "src", "ui", "interactive", "checkbox.tsx"))) {
  throw new Error("Missing canonical interactive checkbox leaf: checkbox");
}

const requiredProjectUi = [
  "src/components/layout/container.tsx",
  "src/components/layout/section-shell.tsx",
  "src/components/marketing/article-card.tsx",
  "src/components/marketing/numbered-steps.tsx",
  "src/components/navigation/action-link.tsx",
];

for (const file of requiredProjectUi) {
  if (!existsSync(join(root, file))) {
    throw new Error(`Missing canonical project UI component: ${file}`);
  }
}

const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");
if (!nextConfig.includes("agentRules: false")) {
  throw new Error("next.config.ts must not rewrite the canonical project AGENTS.md");
}
if (nextConfig.includes('output: "export"')) {
  throw new Error('next.config.ts must use the Node.js runtime, not output: "export"');
}
if (!nextConfig.includes("trailingSlash: true")) {
  throw new Error("next.config.ts must keep trailingSlash: true");
}

function walk(dir) {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const full = join(dir, entry);
    const stat = statSync(full);
    return stat.isDirectory() ? walk(full) : [full];
  });
}

const sourceFiles = walk(join(root, "src")).filter((file) =>
  /\.(ts|tsx)$/.test(file),
);

const projectOwnedUiFiles = sourceFiles.filter(
  (file) =>
    !file.includes(`${join("src", "components", "ui")}`) &&
    !file.includes(`${join("src", "ui", "interactive")}`),
);
const forbiddenProjectUiPatterns = [
  /\bspace-y-/,
  /rounded-\[(?:1\.25|1\.5|1\.75|2)rem\]/,
  /max-w-\[1200px\]/,
  /\btext-(?:2xl|3xl|4xl|5xl|6xl)\b/,
  /\b(?:bg|text)-brand-coral(?!-)/,
];

for (const file of projectOwnedUiFiles) {
  const text = readFileSync(file, "utf8");
  for (const pattern of forbiddenProjectUiPatterns) {
    if (pattern.test(text)) {
      throw new Error(`Project UI must use semantic tokens and gap utilities in ${file}: ${pattern}`);
    }
  }
}

const buttonVariantConsumers = projectOwnedUiFiles.filter((file) => {
  const text = readFileSync(file, "utf8");
  return (
    text.includes("buttonVariants") &&
    !file.endsWith(join("src", "components", "navigation", "action-link.tsx")) &&
    !file.endsWith(join("src", "lib", "button-variants.ts"))
  );
});

if (buttonVariantConsumers.length > 0) {
  throw new Error(
    `Button-like links must use canonical ActionLink: ${buttonVariantConsumers.join(", ")}`,
  );
}

const globalsCss = readFileSync(join(root, "src", "app", "(site)", "globals.css"), "utf8");
for (const token of [
  "--text-h1",
  "--text-h2",
  "--text-h3",
  "--text-body-lg",
  "--spacing-section-md",
  "--color-action",
]) {
  if (!globalsCss.includes(token)) {
    throw new Error(`Missing semantic UI token in globals.css: ${token}`);
  }
}

const rootPage = readFileSync(join(root, "src", "app", "(site)", "page.tsx"), "utf8");
if (!rootPage.includes("CapitalTasksSection") || rootPage.split(/\r?\n/).length > 120) {
  throw new Error("Home page must remain composition-first and below 120 lines");
}

const leadForm = readFileSync(join(root, "src", "ui", "interactive", "lead-form-client.tsx"), "utf8");
if (
  !leadForm.includes('<fieldset className="flex flex-col gap-6">') ||
  !leadForm.includes('type="checkbox"') ||
  leadForm.includes('from "@/components/ui/checkbox"')
) {
  throw new Error("Lead form must preserve the static semantic form contract");
}
const illegalClientFiles = sourceFiles.filter((file) => {
  const text = readFileSync(file, "utf8");
  return (
    /^["']use client["'];?/.test(text) &&
    !file.includes(`${join("src", "ui", "interactive")}`)
  );
});

if (illegalClientFiles.length > 0) {
  throw new Error(
    `"use client" is allowed only in src/ui/interactive: ${illegalClientFiles.join(", ")}`,
  );
}

const forbiddenServerActions = sourceFiles.filter((file) => {
  const normalized = file.replaceAll("\\", "/");
  return (
    /["']use server["']/.test(readFileSync(file, "utf8")) &&
    !normalized.includes("/src/app/(payload)/")
  );
});
if (forbiddenServerActions.length > 0) {
  throw new Error(`Server Actions are allowed only in the generated Payload route group: ${forbiddenServerActions.join(", ")}`);
}

const restrictedNextHeadersFiles = sourceFiles.filter((file) => {
  const normalized = file.replaceAll("\\", "/");
  return (
    normalized.includes("/src/core/ingest/") ||
    normalized.includes("/src/core/cache/") ||
    normalized.includes("/jobs/") ||
    /(?:^|\/)job-handler\.(?:ts|tsx)$/.test(normalized)
  );
});
for (const file of restrictedNextHeadersFiles) {
  if (/from\s+["']next\/headers["']/.test(readFileSync(file, "utf8"))) {
    throw new Error(`Guard 8: next/headers is forbidden in cache, ingest and job handlers: ${file}`);
  }
}

const overrideAccessConsumers = sourceFiles.filter((file) => {
  const normalized = file.replaceAll("\\", "/");
  return (
    /\boverrideAccess\s*:\s*true\b/.test(readFileSync(file, "utf8")) &&
    !normalized.endsWith("/src/core/data-access/system/bootstrap-owner.ts") &&
    !normalized.endsWith("/src/core/data-access/system/create-lead.ts") &&
    !normalized.endsWith("/src/core/data-access/system/dispatch-due-feeds.ts") &&
    !normalized.endsWith("/src/core/data-access/system/import-feed-run.ts")
  );
});
if (overrideAccessConsumers.length > 0) {
  throw new Error(`overrideAccess: true is forbidden outside registered System Gateway implementations: ${overrideAccessConsumers.join(", ")}`);
}

const reusableUiFiles = sourceFiles.filter((file) => {
  const normalized = file.replaceAll("\\", "/");
  return normalized.includes("/src/components/") || normalized.includes("/src/ui/");
});
const persistenceImportPattern = /from\s+["'](?:@payloadcms\/|payload(?:\/|["'])|@\/(?:collections|payload|persistence|core\/persistence)(?:\/|["']))/;
for (const file of reusableUiFiles) {
  if (persistenceImportPattern.test(readFileSync(file, "utf8"))) {
    throw new Error(`Persistence must not be imported into reusable UI: ${file}`);
  }
}

const clientFiles = sourceFiles.filter((file) =>
  file.includes(`${join("src", "ui", "interactive")}`),
);
const forbiddenClientPatterns = [
  /@\/content\//,
  /@\/seo\/registry/,
  /Date\.now\s*\(/,
  /Math\.random\s*\(/,
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bwindow\./,
  /\bdocument\./,
  /suppressHydrationWarning/,
];

for (const file of clientFiles) {
  const text = readFileSync(file, "utf8");
  for (const pattern of forbiddenClientPatterns) {
    if (pattern.test(text)) {
      throw new Error(`Hydration/client boundary violation in ${file}: ${pattern}`);
    }
  }
}

console.log("foundation contract ok");
