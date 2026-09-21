import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const nginx = read("ops/nginx/more-previu.tw1.ru.conf");
const httpBootstrap = read("ops/nginx/more-previu.tw1.ru.http.conf");
const unit = read("ops/systemd/moreigory.service");

test("TLS terminates on Nginx, not on Node", () => {
  assert.match(nginx, /listen 443 ssl/);
  assert.match(nginx, /ssl_certificate /);
  assert.match(nginx, /ssl_protocols TLSv1\.2 TLSv1\.3/);
  assert.doesNotMatch(unit, /PORT=443/);
});

test("proxy headers overwrite untrusted forwarded-for with the edge client", () => {
  assert.match(nginx, /proxy_set_header Host \$host/);
  assert.match(nginx, /proxy_set_header X-Forwarded-Proto \$scheme/);
  assert.match(nginx, /proxy_set_header X-Real-IP \$remote_addr/);
  assert.match(nginx, /proxy_set_header X-Forwarded-For \$remote_addr/);
  assert.match(nginx, /proxy_set_header X-Moreigory-Client-IP \$remote_addr/);
  assert.doesNotMatch(nginx, /proxy_add_x_forwarded_for/);
  assert.match(nginx, /Trusted real IP contract/);
});

test("canonical leads route has edge and application-aligned rate limits", () => {
  assert.match(nginx, /limit_req_zone \$binary_remote_addr zone=leads_per_client:10m rate=5r\/m/);
  assert.match(nginx, /location = \/api\/public\/leads \{/);
  assert.match(nginx, /return 308 \/api\/public\/leads\//);
  assert.match(nginx, /location = \/api\/public\/leads\/ \{/);
  assert.match(nginx, /limit_req zone=leads_per_client burst=5 nodelay/);
  assert.match(nginx, /limit_req_status 429/);
});

test("security headers, body size and proxy timeouts are set", () => {
  assert.match(nginx, /Strict-Transport-Security "max-age=31536000; includeSubDomains"/);
  assert.match(nginx, /X-Content-Type-Options "nosniff"/);
  assert.match(nginx, /Referrer-Policy "strict-origin-when-cross-origin"/);
  assert.match(nginx, /X-Frame-Options "DENY"/);
  assert.match(nginx, /Permissions-Policy "camera=\(\), microphone=\(\), geolocation=\(\)"/);
  assert.match(nginx, /X-Robots-Tag "noindex, nofollow"/);
  assert.match(nginx, /client_max_body_size 12m/);
  assert.match(nginx, /proxy_connect_timeout 5s/);
  assert.match(nginx, /proxy_send_timeout 60s/);
  assert.match(nginx, /proxy_read_timeout 60s/);
});

test("static assets, /api and /admin are explicit routes; Node is loopback-only", () => {
  assert.match(nginx, /location \/_next\/static\//);
  assert.match(nginx, /Cache-Control "public, max-age=31536000, immutable"/);
  assert.match(nginx, /location \/api\//);
  assert.match(nginx, /location \/admin/);
  assert.match(nginx, /proxy_pass http:\/\/127\.0\.0\.1:3000/);
  assert.match(unit, /HOSTNAME=127\.0\.0\.1/);
  assert.doesNotMatch(nginx, /listen 3000/);
  assert.doesNotMatch(httpBootstrap, /proxy_pass/);
});
