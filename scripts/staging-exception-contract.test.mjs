import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const adr = readFileSync(new URL("../docs/adr/ADR-012-no-separate-staging.md", import.meta.url), "utf8");
const index = readFileSync(new URL("../docs/adr/README.md", import.meta.url), "utf8");

test("no-separate-staging exception is explicit, temporary and non-production", () => {
  assert.match(adr, /Accepted \/ time-boxed/);
  assert.match(adr, /не создавать постоянную staging\/test database/i);
  assert.match(adr, /реальный трафик/);
  assert.match(adr, /Выпускаем production/);
  assert.match(adr, /автоматически прекращает действие перед domain cutover/);
  assert.match(adr, /Молчаливое продление запрещено/);
  assert.match(index, /ADR-012-no-separate-staging\.md/);
});
