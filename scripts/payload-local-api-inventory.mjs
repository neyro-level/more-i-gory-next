import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertLocalApiInventory,
  formatLocalApiInventoryMarkdown,
  scanLocalApiCalls,
} from "./lib/payload-local-api-inventory.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const calls = assertLocalApiInventory(scanLocalApiCalls(projectRoot));
const markdownPath = path.join(projectRoot, "docs/research/payload-local-api-inventory.md");
writeFileSync(markdownPath, formatLocalApiInventoryMarkdown(calls));
console.log(`Recorded ${calls.length} Payload Local API calls in docs/research/payload-local-api-inventory.md`);
