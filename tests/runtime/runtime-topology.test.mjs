import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("operations and architecture pin the same target hop chain", () => {
  const operations = read("docs/OPERATIONS.md");
  const architecture = read("docs/03_ARCHITECTURE.md");
  const hopChain =
    /Internet\s*→ Nginx TLS\s*→ 127\.0\.0\.1:<app-port>\s*→ Next standalone \+ Payload\s*→ Managed PostgreSQL\s*→ S3/;
  assert.match(operations, /## Target topology/);
  assert.match(operations, hopChain);
  assert.match(architecture, hopChain);
});

test("systemd binds Next+Payload to loopback, not a public interface", () => {
  const unit = read("ops/systemd/moreigory.service");
  assert.match(unit, /Environment=HOSTNAME=127\.0\.0\.1/);
  assert.match(unit, /Environment=PORT=3000/);
  assert.match(unit, /ExecStart=\/usr\/local\/bin\/node \/opt\/moreigory\/current\/server\.js/);
  assert.doesNotMatch(unit, /HOSTNAME=0\.0\.0\.0/);
});

test("nginx is the TLS edge and proxies only to loopback app-port", () => {
  const nginx = read("ops/nginx/more-previu.tw1.ru.conf");
  assert.match(nginx, /listen 443 ssl/);
  assert.match(nginx, /ssl_certificate /);
  assert.match(nginx, /proxy_pass http:\/\/127\.0\.0\.1:3000/);
  assert.doesNotMatch(nginx, /listen 3000/);
});

test("media and database stay off the VPS disk contract", () => {
  const operations = read("docs/OPERATIONS.md");
  assert.match(operations, /Timeweb Managed PostgreSQL via DATABASE_URI/);
  assert.match(operations, /Timeweb S3 bucket from validated S3_BUCKET \(not VPS disk\)/);
  const s3 = read("src/project/storage/s3.ts");
  assert.doesNotMatch(s3, /moreigory-media/);
});
