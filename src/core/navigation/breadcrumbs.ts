export type BreadcrumbEntry = Readonly<{ href?: string; label: string }>;

export function breadcrumbStructuredData(items: readonly BreadcrumbEntry[], baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: item.href ? new URL(item.href, baseUrl).toString() : undefined,
      name: item.label,
      position: index + 1,
    })),
  } as const;
}
