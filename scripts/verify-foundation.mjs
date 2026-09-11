import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const requiredFiles = [
  "next.config.ts",
  "components.json",
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/globals.css",
  "src/app/not-found.tsx",
  "src/components/navigation/static-link.tsx",
  "src/ui/interactive/.gitkeep",
  ".env.example",
  "docs/README.md",
  "docs/01_PRD.md",
  "docs/02_PRODUCT_STRUCTURE.md",
  "docs/03_ARCHITECTURE.md",
  "docs/04_BACKLOG.md",
  "docs/05_RELEASE_CHECKLIST.md",
  "docs/06_DESIGN_SYSTEM.md",
];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    throw new Error(`Missing required foundation file: ${file}`);
  }
}

const forbiddenLegacyDocPaths = [
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

for (const legacyPath of forbiddenLegacyDocPaths) {
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
  shadcnConfig.tailwind?.css !== "src/app/globals.css" ||
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
  "accordion",
  "alert",
  "badge",
  "breadcrumb",
  "button",
  "card",
  "checkbox",
  "field",
  "input",
  "label",
  "separator",
  "sheet",
  "textarea",
];

for (const primitive of requiredPrimitives) {
  if (!existsSync(join(root, "src", "components", "ui", `${primitive}.tsx`))) {
    throw new Error(`Missing canonical shadcn primitive: ${primitive}`);
  }
}

const nextConfig = readFileSync(join(root, "next.config.ts"), "utf8");
if (!nextConfig.includes('output: "export"')) {
  throw new Error('next.config.ts must keep output: "export"');
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
];

for (const file of projectOwnedUiFiles) {
  const text = readFileSync(file, "utf8");
  for (const pattern of forbiddenProjectUiPatterns) {
    if (pattern.test(text)) {
      throw new Error(`Project UI must use semantic tokens and gap utilities in ${file}: ${pattern}`);
    }
  }
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

const forbiddenStaticImports = [
  /from\s+["']next\/(?:headers|server)["']/,
  /from\s+["']next\/link["']/,
  /["']use server["']/,
];

for (const file of sourceFiles) {
  const text = readFileSync(file, "utf8");
  for (const pattern of forbiddenStaticImports) {
    if (pattern.test(text)) {
      throw new Error(`Forbidden static-export dependency in ${file}: ${pattern}`);
    }
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
