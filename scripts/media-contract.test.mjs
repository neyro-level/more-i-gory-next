import assert from "node:assert/strict";
import test from "node:test";

import { Media } from "../src/project/collections/media.ts";
import { assertMediaAlt } from "../src/project/media/alt.ts";

test("media collection is an upload-enabled image library", () => {
  assert.equal(Media.slug, "media");
  assert.equal(Media.upload.mimeTypes.includes("image/*"), true);
  assert.equal(Media.upload.pasteURL, false);
  assert.equal(Media.upload.adminThumbnail, "thumbnail");
  assert.deepEqual(
    Media.upload.imageSizes.map((size) => size.name),
    ["thumbnail", "card", "hero", "og"],
  );
});

test("media collection separates content media from ui and og assets", () => {
  const kind = Media.fields.find((field) => field.name === "kind");

  assert.equal(kind.type, "select");
  assert.equal(kind.required, true);
  assert.deepEqual(
    kind.options.map((option) => option.value),
    ["region", "project", "complex", "og", "ui"],
  );
});

test("media documents keep the legacy registry id as the import key", () => {
  const sourceLabel = Media.fields.find((field) => field.name === "sourceLabel");

  assert.equal(sourceLabel.type, "text");
  assert.match(sourceLabel.admin.description, /Legacy media registry id/);
});

test("media alt contract supports decorative empty alt only when explicit", () => {
  assert.doesNotThrow(() => assertMediaAlt({ alt: "Вид на побережье", decorative: false }));
  assert.doesNotThrow(() => assertMediaAlt({ alt: "", decorative: true }));

  assert.throws(() => assertMediaAlt({ alt: "", decorative: false }), /meaningful alt/);
  assert.throws(() => assertMediaAlt({ alt: "Decorative wave", decorative: true }), /empty alt/);
});
