import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("docs/migration/V5_URL_MANIFEST.json", "utf8"));

const requiredPatterns = [
  "/",
  "/investicionnaya-nedvizhimost/",
  "/investicionnaya-nedvizhimost/krym/",
  "/investicionnaya-nedvizhimost/krym/yalta/",
  "/investicionnaya-nedvizhimost/krym/sevastopol/",
  "/investicionnaya-nedvizhimost/krym/evpatoriya/",
  "/investicionnaya-nedvizhimost/krym/alushta/",
  "/investicionnaya-nedvizhimost/krym/novostroyki/",
  "/investicionnaya-nedvizhimost/krym/apartamenty/",
  "/investicionnaya-nedvizhimost/arkhyz/",
  "/investicionnaya-nedvizhimost/altay/",
  "/investicionnaya-nedvizhimost/sochi/",
  "/obekty/**",
  "/novostroyki/**",
  "/zastroyshchik/**",
  "/analitika/**",
];

const allowedActions = new Set(["KEEP", "REDIRECT_301", "NOINDEX_RETAIN", "REMOVE_404", "GONE_410", "REVIEW"]);
const requiredFields = [
  "currentStatus",
  "currentCanonical",
  "currentRobots",
  "currentSitemap",
  "productionIndexEvidence",
  "targetIntent",
  "targetExistsNow",
  "migrationAction",
  "reason",
  "evidence",
];

assert.equal(manifest.planVersion, "v1");
assert.match(manifest.observedMainSha, /^[0-9a-f]{40}$/);
assert.equal(manifest.entries.length, requiredPatterns.length);

const byPattern = new Map();
const currentCanonicalOwners = new Map();
for (const entry of manifest.entries) {
  assert(!byPattern.has(entry.currentPattern), `Duplicate current pattern: ${entry.currentPattern}`);
  byPattern.set(entry.currentPattern, entry);
  for (const field of requiredFields) assert(Object.hasOwn(entry, field), `${entry.id} missing ${field}`);
  assert(allowedActions.has(entry.migrationAction), `${entry.id} has invalid action`);
  assert(Array.isArray(entry.evidence) && entry.evidence.length > 0, `${entry.id} requires evidence`);
  assert(
    !currentCanonicalOwners.has(entry.currentCanonical),
    `${entry.id} duplicates current canonical declared by ${currentCanonicalOwners.get(entry.currentCanonical)}`,
  );
  currentCanonicalOwners.set(entry.currentCanonical, entry.id);
}
for (const pattern of requiredPatterns) assert(byPattern.has(pattern), `Missing route pattern: ${pattern}`);

const redirects = manifest.entries.filter((entry) => entry.migrationAction === "REDIRECT_301");
const redirectSources = new Set(redirects.map((entry) => entry.currentPattern));
const targetOwners = new Map();
for (const entry of redirects) {
  assert(typeof entry.targetUrl === "string" && entry.targetUrl.startsWith("/"), `${entry.id} redirect target missing`);
  assert.notEqual(entry.targetUrl, "/", `${entry.id} bulk home redirect forbidden`);
  assert.notEqual(entry.targetUrl, "/obekty/", `${entry.id} bulk catalog redirect forbidden`);
  assert(!redirectSources.has(entry.targetUrl), `${entry.id} creates a redirect chain`);
  assert(!targetOwners.has(entry.targetUrl), `${entry.id} duplicates redirect target owned by ${targetOwners.get(entry.targetUrl)}`);
  targetOwners.set(entry.targetUrl, entry.id);
  if (!entry.targetExistsNow) assert(entry.activationGate, `${entry.id} missing target requires activationGate`);
}

for (const pattern of [
  "/investicionnaya-nedvizhimost/krym/",
  "/investicionnaya-nedvizhimost/krym/yalta/",
  "/investicionnaya-nedvizhimost/krym/sevastopol/",
  "/investicionnaya-nedvizhimost/krym/evpatoriya/",
  "/investicionnaya-nedvizhimost/krym/alushta/",
]) {
  assert.equal(byPattern.get(pattern).migrationAction, "REDIRECT_301", `${pattern} has unresolved R1 migration`);
}

const existingTargetFiles = new Map([
  ["/", "src/app/(site)/page.tsx"],
  ["/investicionnaya-nedvizhimost/", "src/app/(site)/investicionnaya-nedvizhimost/page.tsx"],
  ["/obekty/**", "src/app/(site)/obekty/[slug]/page.tsx"],
  ["/novostroyki/**", "src/app/(site)/novostroyki/[slug]/page.tsx"],
  ["/zastroyshchik/**", "src/app/(site)/zastroyshchik/[slug]/page.tsx"],
  ["/analitika/**", "src/app/(site)/analitika/[slug]/page.tsx"],
]);
for (const entry of manifest.entries.filter((item) => item.targetExistsNow)) {
  const routeFile = existingTargetFiles.get(entry.targetUrl) ?? `src/app/(site)${entry.targetUrl}page.tsx`;
  assert(routeFile && existsSync(routeFile), `${entry.id} target existence lacks route evidence`);
}
for (const entry of redirects.filter((item) => !item.targetExistsNow)) {
  const routeFile = `src/app/(site)${entry.targetUrl}page.tsx`;
  assert(!existsSync(routeFile), `${entry.id} targetExistsNow is stale; route now exists`);
}

console.log(`URL migration manifest passed: ${manifest.entries.length}/${requiredPatterns.length} patterns covered.`);
console.log(
  `Duplicate canonical report: PASS (${currentCanonicalOwners.size} current canonical declarations; ${targetOwners.size} unique redirect targets).`,
);
console.log("Redirect chain report: PASS (0 chains; no bulk home/catalog redirects). ");
console.log(
  `Target existence report: PASS (${manifest.entries.filter((entry) => entry.targetExistsNow).length} existing targets; ${redirects.filter((entry) => !entry.targetExistsNow).length} target-gated redirects).`,
);
