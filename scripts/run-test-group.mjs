import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";

const area = process.argv[2];
const allowedAreas = new Set(["docs", "ingest", "jobs", "leads", "runtime", "seo", "ui"]);
if (!allowedAreas.has(area)) throw new Error(`Unknown test area: ${area ?? "<missing>"}`);

const plainTests = new Set([
  "button-control-system.test.mjs", "dark-mode-foundation.test.mjs", "design-literal-guard.test.mjs",
  "design-token-usage.test.mjs", "explicit-access-mode.test.mjs", "final-platform-proof-record.test.mjs",
  "http-lifecycle.test.mjs", "install-release.test.mjs", "jobs-handover.test.mjs", "lead-delivery-migration.test.mjs",
  "lead-form-primitives.test.mjs", "motion-contract.test.mjs", "nginx-runtime-contract.test.mjs",
  "owner-queue-forecast.test.mjs", "owner-queue.test.mjs", "package-strategy.test.mjs", "pack-release.test.mjs",
  "pages-drafts-migration.test.mjs", "payload-local-api-inventory.test.mjs", "presentation-dto-guard.test.mjs",
  "preview-env-contract.test.mjs", "primitive-import-boundary.test.mjs", "proof-32-a.test.mjs", "proof-32-b.test.mjs",
  "proof-32-c.test.mjs", "proof-32-d.test.mjs", "proof-32-e.test.mjs", "proof-32-f.test.mjs", "proof-32-g.test.mjs",
  "proof-32-h.test.mjs", "proof-32-i.test.mjs", "proof-32-j.test.mjs", "proof-32-k.test.mjs",
  "proof-34-3-deferred.test.mjs", "redaction-contract.test.mjs", "release-evidence.test.mjs",
  "release-recovery-gates.test.mjs", "responsive-a11y-regression.test.mjs", "rollback-release.test.mjs",
  "route-grammar.test.mjs", "runtime-release-origin.test.mjs", "runtime-supervisor.test.mjs", "runtime-topology.test.mjs",
  "section-rhythm-contract.test.mjs", "seo-invariant-crawl.test.mjs", "single-db-application-smoke.test.mjs",
  "single-db-migration.test.mjs", "single-db-runbook.test.mjs", "sourcecraft-contract.test.mjs",
  "staging-exception-contract.test.mjs", "ui-drift-p2-policy.test.mjs", "upstream-primitive-exceptions.test.mjs",
  "verify-architecture-guards.test.mjs", "verify-public-copy.test.mjs", "verify-quick-coverage.test.mjs",
]);

const directory = path.join("tests", area);
const files = readdirSync(directory).filter((file) => file.endsWith(".test.mjs")).sort();
const batches = [
  { conditions: false, files: files.filter((file) => plainTests.has(file)) },
  { conditions: true, files: files.filter((file) => !plainTests.has(file)) },
];

for (const batch of batches) {
  if (batch.files.length === 0) continue;
  const args = [...(batch.conditions ? ["--conditions=react-server"] : []), "--test", ...batch.files.map((file) => path.join(directory, file))];
  const result = spawnSync(process.execPath, args, { env: process.env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
