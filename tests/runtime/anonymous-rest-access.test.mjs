import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { Developers } from "../../src/project/collections/developers.ts";
import { LeadDeliveries } from "../../src/project/collections/lead-deliveries.ts";
import { Leads } from "../../src/project/collections/leads.ts";
import { Media } from "../../src/project/collections/media.ts";
import { Pages } from "../../src/project/collections/pages.ts";
import { Properties } from "../../src/project/collections/properties.ts";
import { Regions } from "../../src/project/collections/regions.ts";
import { ResidentialComplexes } from "../../src/project/collections/residential-complexes.ts";
import { publicReadAccess } from "../../src/project/globals/access.ts";
import { Navigation, SiteSettings } from "../../src/project/globals/index.ts";

const ownerReq = { req: { payloadAPI: "rest", user: { collection: "users", role: "owner" } } };
const editorReq = { req: { payloadAPI: "rest", user: { collection: "users", role: "editor" } } };
const anonymousRestReq = { req: { payloadAPI: "rest" } };
const anonymousDefaultReq = { req: {} };
const localReq = { req: { payloadAPI: "local" } };

const businessSurfaces = [
  Pages,
  Regions,
  Properties,
  Developers,
  ResidentialComplexes,
  Media,
  SiteSettings,
  Navigation,
];

test("publicReadAccess denies anonymous REST and allows Admin plus Local API", async () => {
  assert.equal(await publicReadAccess(anonymousRestReq), false);
  assert.equal(await publicReadAccess(anonymousDefaultReq), false);
  assert.equal(await publicReadAccess(ownerReq), true);
  assert.equal(await publicReadAccess(editorReq), true);
  assert.equal(await publicReadAccess(localReq), true);
});

test("business collections and globals use publicReadAccess for reads", () => {
  assert.match(readFileSync("src/project/collections/redirects.ts", "utf8"), /read:\s*publicReadAccess/);

  for (const surface of businessSurfaces) {
    assert.equal(surface.access?.read, publicReadAccess, surface.slug);
  }
});

test("anonymous raw REST cannot read business collections or globals", async () => {
  for (const surface of businessSurfaces) {
    assert.equal(await surface.access?.read?.(anonymousRestReq), false, `${surface.slug} rest`);
    assert.equal(await surface.access?.read?.(anonymousDefaultReq), false, `${surface.slug} default`);
    assert.equal(await surface.access?.read?.(ownerReq), true, `${surface.slug} owner`);
    assert.equal(await surface.access?.read?.(editorReq), true, `${surface.slug} editor`);
    assert.equal(await surface.access?.read?.(localReq), true, `${surface.slug} local`);
  }
});

test("anonymous GET raw properties and pages is denied", async () => {
  assert.equal(await Properties.access.read(anonymousRestReq), false);
  assert.equal(await Pages.access.read(anonymousRestReq), false);
});

test("anonymous GET leads and lead-deliveries is denied; owner is allowed", async () => {
  for (const surface of [Leads, LeadDeliveries]) {
    assert.equal(await surface.access.read(anonymousRestReq), false, `${surface.slug} anonymous`);
    assert.equal(await surface.access.read(editorReq), false, `${surface.slug} editor`);
    assert.equal(await surface.access.read(ownerReq), true, `${surface.slug} owner`);
  }
});
