import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const requiredFiles = [
  "next.config.ts",
  "components.json",
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/app/globals.css",
  "src/ui/interactive/.gitkeep",
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

console.log("foundation contract ok");
