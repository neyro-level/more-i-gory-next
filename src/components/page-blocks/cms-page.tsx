import type { Page } from "@/payload-types";
import { renderPageBlock } from "./page-block-registry";

export function CmsPage({ page }: { page: Page }) {
  return <main>{page.blocks.map((block) => <section key={block.id ?? block.blockType}>{renderPageBlock(block)}</section>)}</main>;
}
