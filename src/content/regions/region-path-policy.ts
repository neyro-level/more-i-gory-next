export const REGION_RESERVED_NAMESPACE = "/investicionnaya-nedvizhimost";

const slugPattern = /^[a-z0-9-]+$/;

export function composeRegionPathFromSlugs(slugs: readonly string[]): string {
  if (slugs.length === 0) {
    throw new Error("Region path requires at least one slug under the reserved namespace.");
  }

  for (const slug of slugs) {
    if (!slugPattern.test(slug)) {
      throw new Error(`Invalid region slug "${slug}".`);
    }
  }

  return `${REGION_RESERVED_NAMESPACE}/${slugs.join("/")}/`;
}
