import assert from "node:assert/strict";
import test from "node:test";

import { cmsOnlyMediaFields, publicMediaSchema, publicMediaSourceFields } from "../src/core/data-access/public/media-contract.ts";
import { Media } from "../src/project/collections/media.ts";
import { authenticatedFieldReadAccess } from "../src/project/globals/access.ts";
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

test("public media DTO is limited to alt, src, width and height", () => {
  assert.deepEqual(Object.keys(publicMediaSchema.shape), ["alt", "height", "src", "width"]);
  assert.deepEqual([...publicMediaSourceFields], ["alt", "url", "width", "height"]);
});

test("CMS-only media fields are hidden from unauthenticated reads", async () => {
  const localReq = { req: { payloadAPI: "local" } };
  const ownerReq = { req: { user: { collection: "users", role: "owner" } } };

  for (const name of cmsOnlyMediaFields) {
    const field = Media.fields.find((candidate) => candidate.name === name);
    assert.equal(field.access.read, authenticatedFieldReadAccess, name);
    assert.equal(await field.access.read(localReq), false, `${name} local`);
    assert.equal(await field.access.read(ownerReq), true, `${name} owner`);
  }
});

test("media alt contract supports decorative empty alt only when explicit", () => {
  assert.doesNotThrow(() => assertMediaAlt({ alt: "Вид на побережье", decorative: false }));
  assert.doesNotThrow(() => assertMediaAlt({ alt: "", decorative: true }));

  assert.throws(() => assertMediaAlt({ alt: "", decorative: false }), /meaningful alt/);
  assert.throws(() => assertMediaAlt({ alt: "Decorative wave", decorative: true }), /empty alt/);
});
