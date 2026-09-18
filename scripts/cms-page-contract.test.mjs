import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { cmsPageBlockSchema, cmsPageSchema, cmsSeoSchema } from "../src/core/data-access/public/cms-page-contract.ts";
import { pageBlockTypes } from "../src/project/blocks/page-blocks.ts";

test("CMS page contracts are named CmsPageDTO, CmsPageBlockDTO and CmsSeoDTO", () => {
  const source = readFileSync("src/core/data-access/public/cms-page-contract.ts", "utf8");

  assert.match(source, /export type CmsPageDTO/);
  assert.match(source, /export type CmsPageBlockDTO/);
  assert.match(source, /export type CmsSeoDTO/);
  assert.equal(source.includes('from "../../../payload-types.ts"'), false);
});

test("CmsSeoDTO covers published CMS seo fields without Payload document leftovers", () => {
  const seo = cmsSeoSchema.parse({
    description: "Описание страницы для поисковой выдачи инвестора.",
    priority: "P2",
    robots: "index-follow",
    title: "Заголовок страницы",
  });

  assert.equal(seo.priority, "P2");
  assert.equal("updatedAt" in seo, false);
});

test("CmsPageBlockDTO covers every approved page block type", () => {
  assert.deepEqual(
    cmsPageBlockSchema.options.map((option) => option.shape.blockType.value),
    pageBlockTypes,
  );
});

test("CmsPageDTO accepts a published page and rejects raw Payload identity fields", () => {
  const page = cmsPageSchema.parse({
    blocks: [
      { blockType: "lead", text: "Короткий инвестиционный тезис страницы.", title: "Лид" },
    ],
    path: "/usloviya/",
    seo: {
      description: "Описание страницы для поисковой выдачи инвестора.",
      priority: "P1",
      robots: "index-follow",
      title: "Условия работы бюро",
    },
    slug: "usloviya",
    status: "published",
    title: "Условия",
  });

  assert.equal(page.blocks[0].blockType, "lead");
  assert.equal("id" in page, false);
  assert.equal("createdAt" in page, false);
  assert.throws(() => cmsPageSchema.parse({ ...page, status: "draft" }));
});
