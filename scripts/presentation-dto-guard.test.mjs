import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const full = join(directory, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const driftAudit = readFileSync("scripts/verify-ui-drift.mjs", "utf8");
const forbiddenImport =
  /from\s+["']@\/(?:payload-types(?:\/[^"']*)?|project\/[^"']+|core\/data-access\/[^"']+)["']/;

test("UI drift audit blocks forbidden presentation data imports", () => {
  assert.match(driftAudit, /payload-types/);
  assert.match(driftAudit, /project\\/);
  assert.match(driftAudit, /core\\\/data-access/);
  assert.match(driftAudit, /presentation imported payload-types, project, or data-access instead of DTO/);

  const presentation = walk("src")
    .filter((file) => /\.(ts|tsx)$/.test(file))
    .filter((file) => {
      const relativePath = file.replaceAll("\\", "/");
      return relativePath.startsWith("src/components/") || relativePath.startsWith("src/ui/");
    });

  for (const file of presentation) {
    assert.equal(
      forbiddenImport.test(readFileSync(file, "utf8")),
      false,
      `${file} must not import payload-types, project, or data-access`,
    );
  }
});
