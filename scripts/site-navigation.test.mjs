import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

process.env.AMS_PROFILE ??= "REALTY_BASE";
process.env.TZ ??= "Europe/Moscow";
process.env.JOBS_AUTORUN ??= "false";
process.env.DATABASE_URI ??= "postgresql://verify:verify@127.0.0.1:5432/moreigori_verify";
process.env.PAYLOAD_SECRET ??= "ci-validation-only-payload-secret-not-for-production";
process.env.NEXT_PUBLIC_SERVER_URL ??= "http://127.0.0.1:4311";

test("siteUrl comes from env instead of a hardcoded production domain", async () => {
  const { siteUrl } = await import("../src/seo/site-url.ts");

  assert.equal(siteUrl, new URL(process.env.NEXT_PUBLIC_SERVER_URL).origin);
});

test("header and footer render from site chrome props, not local navigation arrays", () => {
  const headerSource = readFileSync("src/components/layout/site-header.tsx", "utf8");
  const footerSource = readFileSync("src/components/layout/site-footer.tsx", "utf8");

  assert.equal(/const\s+navigation\s*=/.test(headerSource), false);
  assert.equal(/const\s+footerLinks\s*=/.test(footerSource), false);
  assert.match(headerSource, /SiteHeader\(\{\s*brand,\s*cta,\s*navigation,\s*previewNavigation\s*=\s*\[\]\s*\}/);
  assert.match(headerSource, /Все страницы/);
  assert.match(footerSource, /SiteFooter\(\{\s*brand,\s*legal,\s*legalNotice,\s*navigation\s*\}/);
  assert.match(footerSource, /moregory-info@yandex\.com/);
  assert.match(footerSource, /Колобова Ольга Викторовна/);
  assert.equal(/расч[её]тн|корр\.?\s*сч[её]т|БИК|ВТБ/i.test(footerSource), false, "footer must not publish bank details");
});

test("site chrome maps CMS globals and falls back only for empty slots", async () => {
  const { fallbackSiteChrome, mapSiteChrome } = await import("../src/core/data-access/public/site-chrome-contract.ts");
  const chrome = mapSiteChrome(
    {
      id: 1,
      siteName: "CMS Site",
      shortName: "CS",
      tagline: "CMS tagline",
      defaultSeo: { robots: "index-follow" },
    },
    {
      id: 1,
      header: [{ href: "/cms/", label: "CMS", id: "cms" }],
      headerCta: { href: "/cta/", label: "CTA" },
      footer: [],
      legal: [{ href: "/legal/", label: "Legal", id: "legal" }],
    },
  );

  assert.deepEqual(chrome.brand, { siteName: "CMS Site", shortName: "CS", tagline: "CMS tagline" });
  assert.deepEqual(chrome.navigation.header, [{ href: "/cms/", label: "CMS", nofollow: false, openInNewTab: false }]);
  assert.deepEqual(chrome.navigation.headerCta, { href: "/cta/", label: "CTA", nofollow: false, openInNewTab: false });
  assert.deepEqual(chrome.navigation.footer, fallbackSiteChrome.navigation.footer);
  assert.deepEqual(chrome.navigation.legal, [{ href: "/legal/", label: "Legal", nofollow: false, openInNewTab: false }]);
});

test("site chrome gateway uses explicit select, access mode and Zod DTO", () => {
  const gateway = readFileSync("src/core/data-access/public/site-chrome.ts", "utf8");
  const contract = readFileSync("src/core/data-access/public/site-chrome-contract.ts", "utf8");
  const headerSource = readFileSync("src/components/layout/site-header.tsx", "utf8");
  const footerSource = readFileSync("src/components/layout/site-footer.tsx", "utf8");

  assert.match(gateway, /select:\s*publicSiteSettingsSelect/);
  assert.match(gateway, /select:\s*publicNavigationSelect/);
  assert.match(gateway, /overrideAccess:\s*false/);
  assert.match(contract, /siteChromeSchema\.parse/);
  assert.equal(contract.includes("payload-types"), false);
  assert.equal(headerSource.includes("payload-types"), false);
  assert.equal(footerSource.includes("payload-types"), false);
});
