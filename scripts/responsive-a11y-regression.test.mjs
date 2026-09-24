import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const VIEWPORTS = [390, 768, 1024, 1440, 1920];
const REPRESENTATIVE_ROUTES = [
  "/",
  "/investicionnaya-nedvizhimost/",
  "/krym/",
  "/novostroyki/",
  "/novostroyki/[slug]/",
  "/obekty/",
  "/podbor/",
  "/kontakty/",
  "/analitika/[slug]/",
];

const globals = readFileSync("src/app/(site)/globals.css", "utf8");
const header = readFileSync("src/components/layout/site-header.tsx", "utf8");
const hero = readFileSync("src/components/marketing/page-hero.tsx", "utf8");
const container = readFileSync("src/components/layout/container.tsx", "utf8");
const buttonVariants = readFileSync("src/lib/button-variants.ts", "utf8");
const leadForm = readFileSync("src/components/marketing/forms/lead-form-client.tsx", "utf8");

test("representative widths keep overflow, CTA, keyboard, labels and reduced motion contracts", () => {
  assert.deepEqual(VIEWPORTS, [390, 768, 1024, 1440, 1920]);
  assert.equal(REPRESENTATIVE_ROUTES.length, 9);

  assert.match(container, /w-full/);
  assert.match(container, /px-page-inline/);
  assert.match(hero, /min-w-0/);
  assert.match(hero, /overflow-hidden/);
  assert.match(header, /xl:flex/);
  assert.match(header, /xl:hidden/);
  assert.match(header, /<details /);
  assert.match(header, /<summary /);

  assert.match(buttonVariants, /cta: "min-h-11 /);
  assert.match(buttonVariants, /focus-visible:ring-3/);
  assert.match(hero, /flex flex-col gap-3 xl:flex-row/);
  assert.match(hero, /<h1 /);
  assert.match(header, /size-11/);

  assert.match(leadForm, /htmlFor="name"/);
  assert.match(leadForm, /htmlFor="phone"/);
  assert.match(leadForm, /htmlFor="task"/);
  assert.match(leadForm, /htmlFor="accepted"/);
  for (const field of ["name", "phone", "task", "accepted"]) {
    assert.match(leadForm, new RegExp(`aria-describedby="[^"]*${field}-error`));
    assert.match(leadForm, new RegExp(`id="${field}-error"`));
  }

  assert.match(globals, /prefers-reduced-motion:\s*reduce/);
  assert.match(globals, /transition-duration: 0\.01ms/);
});
