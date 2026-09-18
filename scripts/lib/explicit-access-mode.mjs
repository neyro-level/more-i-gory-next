import { readFileSync } from "node:fs";
import path from "node:path";

import { assertLocalApiInventory, scanLocalApiCalls } from "./payload-local-api-inventory.mjs";

const skippedOperations = new Set(["getPayload", "req.payload"]);

function expectedOverrideAccess(apiClass) {
  if (apiClass === "SYSTEM GATEWAY") return true;
  if (apiClass === "PUBLIC GATEWAY" || apiClass === "CMS ADMIN") return false;
  return null;
}

function extractFirstObjectLiteral(source, fromIndex) {
  const start = source.indexOf("{", fromIndex);
  if (start < 0) return null;

  let depth = 0;
  let inString = null;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === inString) inString = null;
      continue;
    }
    if (char === "'" || char === '"') {
      inString = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }

  return null;
}

export function findImplicitAccessModeCalls(projectRoot) {
  const calls = assertLocalApiInventory(scanLocalApiCalls(projectRoot)).filter(
    (call) => call.class !== "TEST" && !skippedOperations.has(call.operation),
  );
  const missing = [];

  for (const call of calls) {
    const expected = expectedOverrideAccess(call.class);
    if (expected === null) {
      missing.push({ ...call, reason: `no overrideAccess policy for class ${call.class}` });
      continue;
    }

    const fileSource = readFileSync(path.join(projectRoot, call.file), "utf8");
    const lineStarts = [0];
    for (let index = 0; index < fileSource.length; index += 1) {
      if (fileSource[index] === "\n") lineStarts.push(index + 1);
    }
    const fromIndex = lineStarts[call.line - 1] ?? 0;
    const objectLiteral = extractFirstObjectLiteral(fileSource, fromIndex);
    const match = objectLiteral?.match(/\boverrideAccess\s*:\s*(true|false)\b/);

    if (!match) {
      missing.push({ ...call, reason: "missing explicit overrideAccess" });
      continue;
    }

    if (match[1] !== String(expected)) {
      missing.push({
        ...call,
        reason: `overrideAccess:${match[1]} does not match ${call.class} (expected ${expected})`,
      });
    }
  }

  return missing;
}
