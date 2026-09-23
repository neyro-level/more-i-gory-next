import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { outOfContractPropertyEnumSql } from "../src/core/catalog/property-enums.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reportPath = path.join(root, "docs/research/property-enum-drift-report.md");
const sql = outOfContractPropertyEnumSql();
const databaseUri = process.env.DATABASE_URI;
let queried = false;
let rowCount = null;
let rows = [];
let queryError = null;

if (databaseUri) {
  try {
    const postgres = (await import("postgres")).default;
    const sqlClient = postgres(databaseUri, { max: 1 });
    try {
      rows = await sqlClient.unsafe(sql);
      rowCount = rows.length;
      queried = true;
    } finally {
      await sqlClient.end({ timeout: 5 });
    }
  } catch {
    queryError = "database query failed; details redacted";
  }
}

const body = `# Property enum drift report (TASK 24.1a)

Generated without applying a live-data rewrite.

## Contract

- category: apartment | house | land | commercial
- dealType: sale | rent

## Query

\`\`\`sql
${sql}
\`\`\`

## Prior live schema evidence

- checked against: Timeweb managed PostgreSQL 18 bootstrap database
- checked at: 2026-09-19
- schema preflight queried: true
- \`properties\` table existed: false
- out-of-contract rows: not applicable until the migration chain is applied

This historical evidence is not a current zero-row drift result. It is preserved
so a later read-only run cannot erase the verified pre-migration state.

## Current read-only result

- queried: ${queried}
- out-of-contract rows: ${rowCount == null ? "not queried" : rowCount}
- query error: ${queryError ?? "none"}

${
  rows.length
    ? rows
        .slice(0, 50)
        .map((row) => `- id=${row.id} category=${row.category ?? ""} dealType=${row.deal_type ?? ""}`)
        .join("\n")
    : "_no sample rows_"
}

TASK 24.1b applies the Postgres enum conversion to existing rows only when this count is 0 or the owner unblocks EPIC 34.
`;

writeFileSync(reportPath, body, "utf8");
console.log(body);
if (queried && rowCount === 0) {
  console.log("TASK 24.1b can run as a no-op schema conversion.");
}
