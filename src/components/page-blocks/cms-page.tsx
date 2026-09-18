import type { CmsPageDTO } from "@/core/dto";
import { renderPageBlock } from "./page-block-registry";

export function CmsPage({ page }: { page: CmsPageDTO }) {
  return (
    <main>
      {page.blocks.map((block, index) => (
        <section key={`${block.blockType}-${index}`}>{renderPageBlock(block)}</section>
      ))}
    </main>
  );
}
