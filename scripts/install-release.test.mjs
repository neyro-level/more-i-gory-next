import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const script = readFileSync(new URL("../ops/runtime/install-release.sh", import.meta.url), "utf8");
const operations = readFileSync(new URL("../docs/OPERATIONS.md", import.meta.url), "utf8");

test("install-release only unpacks a tarball into /opt/moreigory/releases/<sha>", () => {
  assert.match(script, /DEST="\$ROOT\/releases\/\$SHA"/);
  assert.match(script, /ln -sfn "\$DEST" "\$ROOT\/current"/);
  assert.match(script, /Do not compile the app on the runtime host/);
  assert.doesNotMatch(script, /^\s*pnpm /m);
  assert.doesNotMatch(script, /^\s*next build/m);
  assert.match(operations, /\/opt\/moreigory\/releases\/<sha>/);
  assert.match(operations, /Build happens off the runtime host/);
});
