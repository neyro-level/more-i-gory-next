import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  BACKUP_RESTORE_STEPS,
  assertBackupIsNotProductionDump,
  assertDisposableRestoreTarget,
} from "./lib/backup-restore-contract.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("restore contract is backup → disposable DB → app reads restored state", () => {
  assert.deepEqual(BACKUP_RESTORE_STEPS, [
    "backup",
    "restore into disposable/staging DB",
    "app reads restored state",
  ]);
  assert.doesNotThrow(() =>
    assertDisposableRestoreTarget({ hostname: "127.0.0.1", database: "moreigory_restore_dst" }),
  );
  assert.doesNotThrow(() =>
    assertDisposableRestoreTarget({ hostname: "10.8.0.1", database: "moreigory_staging" }),
  );
  assert.throws(
    () => assertDisposableRestoreTarget({ hostname: "moreigori.ru", database: "prod" }),
    /production-looking/,
  );
  assert.throws(() => assertDisposableRestoreTarget({ hostname: "127.0.0.1", database: "app" }), /disposable/);
  assert.throws(() => assertBackupIsNotProductionDump("TELEGRAM_BOT_TOKEN=x"), /secrets/);

  const script = read("ops/runtime/backup-restore.sh");
  assert.match(script, /pg_dump --no-owner --no-acl -t restore_probe/);
  assert.match(script, /SELECT note FROM restore_probe/);
  assert.match(script, /Never dump production PII/);
  assert.match(read("docs/OPERATIONS.md"), /ops\/runtime\/backup-restore\.sh/);
  assert.match(read("docs/proofs/13.9-restore.md"), /pnpm test:backup-restore/);
});
