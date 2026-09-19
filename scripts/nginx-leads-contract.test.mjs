import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const runtimeNginx = read("ops/nginx/more-previu.tw1.ru.conf");
const nginxReadme = read("ops/nginx/README.md");
const releaseChecklist = read("docs/05_RELEASE_CHECKLIST.md");
const legacyStatic = read("ops/nginx/legacy/moreigori-static.example.conf");

test("current nginx runtime is the preview reverse proxy, not static export", () => {
  assert.equal(existsSync(new URL("../ops/nginx/moreigori-static.example.conf", import.meta.url)), false);
  assert.match(nginxReadme, /Current runtime \(preview\/staging\): `more-previu\.tw1\.ru\.conf`/);
  assert.match(runtimeNginx, /server_name more-previu\.tw1\.ru/);
  assert.match(runtimeNginx, /proxy_pass http:\/\/127\.0\.0\.1:3000/);
  assert.doesNotMatch(runtimeNginx, /root \/var\/www\/more-i-gory-next\/out/);
  assert.doesNotMatch(runtimeNginx, /try_files \$uri \$uri\/ \$uri\/index\.html/);
  assert.doesNotMatch(runtimeNginx, /listen 80;\s*server_name moreigori\.ru/s);
});

test("runtime nginx no longer carries the legacy /api/leads 503 stub", () => {
  assert.equal(runtimeNginx.includes("location = /api/leads"), false);
  assert.equal(runtimeNginx.includes("return 503;"), false);
  assert.equal(legacyStatic.includes("location = /api/leads"), false);
});

test("release checklist keeps leads fail-closed at the application switch", () => {
  assert.match(releaseChecklist, /NEXT_PUBLIC_LEADS_ENABLED=false/);
  assert.match(releaseChecklist, /\/api\/public\/leads/);
  assert.doesNotMatch(releaseChecklist, /Nginx возвращает `503`/);
});
