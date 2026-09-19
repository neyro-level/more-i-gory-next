import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { GET } from "../src/app/api/health/route.ts";

test("GET /api/health returns 200 without importing env or Payload", async () => {
  const source = readFileSync("src/app/api/health/route.ts", "utf8");
  assert.doesNotMatch(source, /from ["']@\/project\/env/);
  assert.doesNotMatch(source, /payload/);
  const response = GET();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});

test("host provision artifacts pin Node 24, pnpm, systemd restart and preview vhost", () => {
  const unit = readFileSync("ops/systemd/moreigory.service", "utf8");
  const nginx = readFileSync("ops/nginx/more-previu.tw1.ru.conf", "utf8");
  const bootstrap = readFileSync("ops/runtime/bootstrap-health.mjs", "utf8");

  assert.equal(readFileSync(".node-version", "utf8").trim(), "24.20.0");
  assert.match(readFileSync("package.json", "utf8"), /"packageManager": "pnpm@11\.5\.1"/);
  assert.match(unit, /Restart=always/);
  assert.match(unit, /EnvironmentFile=-\/etc\/moreigory\/app.env/);
  assert.doesNotMatch(unit, /DATABASE_URI=/);
  assert.match(nginx, /server_name more-previu.tw1.ru/);
  assert.match(readFileSync("ops/nginx/more-previu.tw1.ru.http.conf", "utf8"), /acme-challenge/);
  assert.doesNotMatch(nginx, /moreigori-static/);
  assert.match(bootstrap, /\/api\/health/);
});
