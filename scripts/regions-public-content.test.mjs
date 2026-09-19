import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { mapPublicRegions, listFallbackPublicRegions } from "../src/core/data-access/public/regions-contract.ts";

test("public region mapper uses CMS title, lead, thesis, risks, media, status and parent hierarchy", () => {
  const mapped = mapPublicRegions([
    {
      id: 1,
      investmentThesis: "Инвестиционная тезисная часть будет опубликована после проверки объектов.",
      kind: "region",
      lead: "Черновик региональной страницы Крыма до утверждения контента владельцем.",
      order: 10,
      riskSummary: "До публикации нельзя обещать доходность без проверки.",
      slug: "krym",
      status: "hidden",
      title: "Крым",
      heroMedia: {
        alt: "Крым",
        height: 100,
        url: "/images/regions/crimea-coast.webp",
        width: 200,
      },
    },
    {
      id: 2,
      investmentThesis: "Перед публикацией нужны проверенные предложения и правовая модель.",
      kind: "locality",
      lead: "Черновик страницы Ялты в крымском инвестиционном разделе.",
      order: 20,
      parent: { id: 1, slug: "krym" },
      riskSummary: "Главный риск чернового этапа — подменить проверку объекта спросом.",
      slug: "yalta",
      status: "hidden",
      title: "Ялта",
    },
  ]);

  assert.equal(mapped[0]?.path, "/investicionnaya-nedvizhimost/krym/");
  assert.equal(mapped[0]?.title, "Крым");
  assert.equal(mapped[0]?.status, "hidden");
  assert.equal(mapped[1]?.path, "/investicionnaya-nedvizhimost/krym/yalta/");
  assert.equal(mapped[1]?.parentSlug, "krym");
  assert.equal(mapped[1]?.pageId, "PAGE-008");
});

test("live region pages read Public Gateway instead of hardcoded domain copy", () => {
  const routePlan = readFileSync("src/content/regions/region-route-plan.ts", "utf8");
  assert.doesNotMatch(routePlan, /investmentThesis:/);
  assert.doesNotMatch(routePlan, /mediaSourceLabel:/);
  assert.doesNotMatch(routePlan, /Черновик региональной страницы Крыма/);

  const hub = readFileSync("src/app/(site)/investicionnaya-nedvizhimost/page.tsx", "utf8");
  assert.match(hub, /listPublicHubRegions/);
  assert.doesNotMatch(hub, /getRegionHubPlan/);

  const home = readFileSync("src/app/(site)/page.tsx", "utf8");
  assert.match(home, /listPublicHubRegions/);

  const page = readFileSync("src/app/(site)/investicionnaya-nedvizhimost/[...path]/page.tsx", "utf8");
  assert.match(page, /getPublicRegionByPath/);
  assert.match(page, /region\.lead/);
  assert.match(page, /region\.investmentThesis/);
});

test("generic fallback exposes only published regions", () => {
  const fallback = listFallbackPublicRegions();
  assert.equal(fallback.every((region) => region.status === "published"), true);
  assert.equal(fallback.some((region) => region.status === "hidden"), false);
  assert.equal(fallback.some((region) => region.status === "stub"), false);
});

test("regions Public Gateway applies the publication predicate in the Payload query", () => {
  const gateway = readFileSync("src/core/data-access/public/regions.ts", "utf8");
  assert.match(gateway, /where:\s*\{\s*status:\s*\{\s*equals:\s*"published"\s*\},?\s*\}/);
});
