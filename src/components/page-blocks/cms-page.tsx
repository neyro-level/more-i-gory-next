import type { CmsPageDTO } from "@/core/data-access/public/cms-page-contract";
import { renderPageBlock } from "./page-block-registry";

export function CmsPage({ page }: { page: CmsPageDTO }) {
  return (
    <main>
      {page.blocks.map((block, index) => (
        <section key={`${block.blockType}-${index}`}>{renderPageBlock(block as never)}</section>
      ))}
    </main>
  );
}
