export const maintenanceScanPageSize = 100;
export const maintenanceScanMaxPages = 100;

export async function collectBoundedPages<T>(args: {
  fetchPage: (page: number, limit: number) => Promise<{
    docs?: T[];
    hasNextPage?: boolean;
  }>;
  maxPages?: number;
  pageSize?: number;
}): Promise<T[]> {
  const pageSize = args.pageSize ?? maintenanceScanPageSize;
  const maxPages = args.maxPages ?? maintenanceScanMaxPages;
  const docs: T[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const result = await args.fetchPage(page, pageSize);
    const batch = result.docs ?? [];
    docs.push(...batch);
    if (batch.length < pageSize || result.hasNextPage === false) {
      break;
    }
  }

  return docs;
}
