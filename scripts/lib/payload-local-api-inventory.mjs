import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export const LOCAL_API_CLASSES = Object.freeze([
  "PUBLIC GATEWAY",
  "SYSTEM GATEWAY",
  "CMS ADMIN",
  "MIGRATION",
  "TEST",
]);

const codeFilePattern = /\.(?:[cm]?[jt]sx?)$/;

export function classifyLocalApiPath(filePath) {
  const normalized = filePath.replaceAll("\\", "/");

  if (normalized.includes(".test.") || normalized.endsWith(".spec.ts") || normalized.endsWith(".spec.mjs")) {
    return "TEST";
  }
  if (normalized.startsWith("migrations/")) {
    return "MIGRATION";
  }
  if (normalized.startsWith("src/core/data-access/public/") || normalized.startsWith("src/seo/")) {
    return "PUBLIC GATEWAY";
  }
  if (
    normalized.startsWith("src/core/data-access/system/") ||
    normalized.startsWith("src/project/jobs/") ||
    normalized.startsWith("src/project/leads/") ||
    normalized.startsWith("scripts/seed-") ||
    normalized === "scripts/bootstrap-owner.mjs"
  ) {
    return "SYSTEM GATEWAY";
  }
  if (normalized.startsWith("src/project/collections/") || normalized.startsWith("src/project/globals/")) {
    return "CMS ADMIN";
  }

  return null;
}

function walk(projectRoot, relativeDirectory) {
  const absoluteDirectory = path.join(projectRoot, relativeDirectory);
  return readdirSync(absoluteDirectory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") {
      return [];
    }
    const relativePath = path.join(relativeDirectory, entry.name).replaceAll("\\", "/");
    return entry.isDirectory() ? walk(projectRoot, relativePath) : [relativePath];
  });
}

export function scanLocalApiCalls(projectRoot) {
  const roots = ["src", "scripts", "migrations"];
  const files = [
    ...roots.flatMap((root) => {
      try {
        return walk(projectRoot, root);
      } catch {
        return [];
      }
    }),
    "payload.config.ts",
  ].filter(
    (filePath) =>
      codeFilePattern.test(filePath) &&
      !filePath.includes("payload-local-api-inventory") &&
      !filePath.startsWith("scripts/lib/"),
  );

  const calls = [];

  for (const filePath of files) {
    const content = readFileSync(path.join(projectRoot, filePath), "utf8");
    const lines = content.split(/\r?\n/);
    const cls = classifyLocalApiPath(filePath);

    for (const [index, line] of lines.entries()) {
      const lineNumber = index + 1;
      const getPayloadRe = /\bgetPayload\s*\(/g;
      const callRe =
        /\b(?:(req)\.)?payload(?:\?\.|\.)(?:(jobs)(?:\?\.|\.))?(findByID|findGlobal|find|create|update|delete|queue)\s*(?:\?\.)?\s*\(/g;

      for (const match of line.matchAll(getPayloadRe)) {
        calls.push({
          class: cls,
          file: filePath,
          line: lineNumber,
          operation: "getPayload",
          snippet: line.trim(),
        });
        void match;
      }

      let sawPayloadMethod = false;
      for (const match of line.matchAll(callRe)) {
        sawPayloadMethod = true;
        const viaReq = match[1] === "req";
        const viaJobs = match[2] === "jobs";
        const method = match[3];
        const operation = viaJobs ? `jobs.${method}` : viaReq ? `req.payload.${method}` : method;
        calls.push({
          class: cls,
          file: filePath,
          line: lineNumber,
          operation,
          snippet: line.trim(),
        });
      }

      if (/\breq\.payload\b/.test(line) && !sawPayloadMethod) {
        calls.push({
          class: cls,
          file: filePath,
          line: lineNumber,
          operation: "req.payload",
          snippet: line.trim(),
        });
      }
    }
  }

  return calls.sort((left, right) => {
    const fileOrder = left.file.localeCompare(right.file);
    return fileOrder !== 0 ? fileOrder : left.line - right.line;
  });
}

export function assertLocalApiInventory(calls) {
  const unclassified = calls.filter((call) => !call.class);
  if (unclassified.length > 0) {
    throw new Error(
      `Unclassified Payload Local API calls: ${unclassified
        .map((call) => `${call.file}:${call.line} ${call.operation}`)
        .join("; ")}`,
    );
  }

  const invalid = calls.filter((call) => !LOCAL_API_CLASSES.includes(call.class));
  if (invalid.length > 0) {
    throw new Error(`Invalid Local API class: ${invalid.map((call) => call.class).join(", ")}`);
  }

  return calls;
}

export function formatLocalApiInventoryMarkdown(calls) {
  const classified = assertLocalApiInventory(calls);
  const rows = classified
    .map(
      (call) =>
        `| \`${call.file}:${call.line}\` | \`${call.operation}\` | ${call.class} | \`${call.snippet.replaceAll("|", "\\|")}\` |`,
    )
    .join("\n");

  return `# Payload Local API inventory

**Дата:** 2026-09-18  
**Задача:** TASK 20.1  
**Статус:** Evidence only

Каждый вызов \`getPayload\`, \`payload.find/findByID/findGlobal/create/update/delete\`,
\`payload.jobs.queue\` и \`req.payload.*\` классифицирован одним слоем.

| Location | Operation | Class | Snippet |
|---|---|---|---|
${rows}
`;
}
