import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const nginxExample = read("ops/nginx/moreigori-static.example.conf");
const releaseChecklist = read("docs/05_RELEASE_CHECKLIST.md");

test("nginx example no longer carries the legacy /api/leads 503 stub", () => {
  assert.equal(nginxExample.includes("location = /api/leads"), false);
  assert.equal(nginxExample.includes("return 503;"), false);
});

test("release checklist keeps leads fail-closed at the application switch", () => {
  assert.match(releaseChecklist, /NEXT_PUBLIC_LEADS_ENABLED=false/);
  assert.match(releaseChecklist, /\/api\/public\/leads/);
  assert.doesNotMatch(releaseChecklist, /Nginx возвращает `503`/);
});
