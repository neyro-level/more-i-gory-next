import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("runtime supervisor is systemd, not container orchestration", () => {
  const unit = read("ops/systemd/moreigory.service");
  const operations = read("docs/OPERATIONS.md");
  const readme = read("ops/systemd/README.md");

  assert.match(unit, /\[Service\]/);
  assert.match(unit, /Restart=always/);
  assert.match(unit, /TimeoutStopSec=30/);
  assert.match(operations, /## Runtime supervisor/);
  assert.match(operations, /Chosen supervisor: `systemd` unit `moreigory\.service`/);
  assert.match(readme, /Chosen supervisor: \*\*systemd\*\*/);
  assert.equal(existsSync(new URL("../docker-compose.yml", import.meta.url)), false);
  assert.equal(existsSync(new URL("../compose.yaml", import.meta.url)), false);
  assert.doesNotMatch(unit, /docker/);
});
