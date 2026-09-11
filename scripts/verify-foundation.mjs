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
];

for (const file of requiredFiles) {
  if (!existsSync(join(root, file))) {
    throw new Error(`Missing required foundation file: ${file}`);
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
