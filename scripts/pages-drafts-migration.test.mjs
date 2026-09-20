import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migrationSource = readFileSync(
  new URL("../migrations/20260916_063247_pages_drafts_redirects.ts", import.meta.url),
  "utf8",
);
const newbuildMigrationSource = readFileSync(
  new URL("../migrations/20260916_231730_newbuild_schema.ts", import.meta.url),
  "utf8",
);
const migrationIndexSource = readFileSync(new URL("../migrations/index.ts", import.meta.url), "utf8");
const statusSplitMigrationSource = readFileSync(
  new URL("../migrations/20260919_202220_epic44_status_enum_collision.ts", import.meta.url),
  "utf8",
);


test("pages drafts migration creates _status before any use", () => {
  const addColumn = 'ALTER TABLE "pages" ADD COLUMN "_status"';
  const addColumnIndex = migrationSource.indexOf(addColumn);

  assert.notEqual(addColumnIndex, -1, "migration must create pages._status");

  const beforeAdd = migrationSource.slice(0, addColumnIndex);
  assert.doesNotMatch(
    beforeAdd,
    /ALTER TABLE "pages" ALTER COLUMN "_status"/,
    "migration must not alter pages._status before it exists",
  );
});

test("newbuild migration accepts custom and Payload draft statuses", () => {
  for (const enumName of [
    "enum_developers_status",
    "enum__developers_v_version_status",
    "enum_complexes_status",
    "enum__complexes_v_version_status",
  ]) {
    assert.match(
      newbuildMigrationSource,
      new RegExp(`CREATE TYPE "public"\\."${enumName}" AS ENUM\\('draft', 'published', 'hidden', 'archived'\\)`),
    );
  }
});

test("forward migration separates publication statuses from Payload draft statuses", () => {
  assert.match(migrationIndexSource, /name: '20260919_202220_epic44_status_enum_collision'/);
  assert.match(statusSplitMigrationSource, /enum_developers_publication_status/);
  assert.match(statusSplitMigrationSource, /enum_complexes_publication_status/);
  assert.match(statusSplitMigrationSource, /ALTER TABLE "_developers_v" ALTER COLUMN "version_status"/);
  assert.match(statusSplitMigrationSource, /ALTER TABLE "_complexes_v" ALTER COLUMN "version_status"/);
});
