import assert from "node:assert/strict";
import test from "node:test";

import { Navigation, SiteSettings } from "../src/project/globals/index.ts";

const ownerRequest = { req: { user: { collection: "users", role: "owner" } } };
const editorRequest = { req: { user: { collection: "users", role: "editor" } } };
const anonymousRequest = { req: {} };

function flattenFieldNames(fields) {
  const names = [];

  for (const field of fields) {
    if ("name" in field) names.push(field.name);
    if ("fields" in field && Array.isArray(field.fields)) names.push(...flattenFieldNames(field.fields));
    if ("tabs" in field && Array.isArray(field.tabs)) {
      for (const tab of field.tabs) names.push(...flattenFieldNames(tab.fields ?? []));
    }
  }

  return names;
}

test("site-settings global covers identity, contacts, social, SEO, legal and analytics", () => {
  assert.equal(SiteSettings.slug, "site-settings");
  assert.deepEqual(
    [
      "siteName",
      "shortName",
      "tagline",
      "canonicalDomain",
      "contacts",
      "phone",
      "email",
      "telegram",
      "whatsapp",
      "address",
      "workingHours",
      "socialLinks",
      "label",
      "url",
      "defaultSeo",
      "title",
      "description",
      "ogImagePath",
      "robots",
      "legalLinks",
      "href",
      "legalNotice",
      "analytics",
      "yandexMetrikaId",
      "vkPixelId",
      "callTrackingId",
    ].every((name) => flattenFieldNames(SiteSettings.fields).includes(name)),
    true,
  );
});

test("navigation global exposes header, footer and legal slots", () => {
  assert.equal(Navigation.slug, "navigation");
  assert.deepEqual(["header", "headerCta", "footer", "legal"].every((name) => flattenFieldNames(Navigation.fields).includes(name)), true);
});

test("site globals deny anonymous REST and allow authenticated Admin plus Local API", async () => {
  const localRequest = { req: { payloadAPI: "local" } };

  for (const globalConfig of [SiteSettings, Navigation]) {
    assert.equal(await globalConfig.access?.read?.(ownerRequest), true);
    assert.equal(await globalConfig.access?.read?.(editorRequest), true);
    assert.equal(await globalConfig.access?.read?.(anonymousRequest), false);
    assert.equal(await globalConfig.access?.read?.(localRequest), true);

    assert.equal(await globalConfig.access?.update?.(ownerRequest), true);
    assert.equal(await globalConfig.access?.update?.(editorRequest), false);
    assert.equal(await globalConfig.access?.update?.(anonymousRequest), false);
  }
});
