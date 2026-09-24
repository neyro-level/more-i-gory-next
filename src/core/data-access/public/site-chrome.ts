import "server-only";

import { unstable_cache } from "next/cache";
import { getPayload } from "payload";

import config from "../../../../payload.config.ts";
import { fallbackSiteChrome, mapSiteChrome, publicNavigationSelect, publicSiteSettingsSelect } from "./site-chrome-contract.ts";
import type { SiteChrome } from "./site-chrome-contract.ts";
import { isPublicReadOperationalError, publicReadOrThrow } from "./read-fallback.ts";

export { fallbackSiteChrome, mapSiteChrome };
export type { SiteChrome, SiteNavigationLink } from "./site-chrome-contract.ts";

async function readSiteChrome(): Promise<SiteChrome> {
  return publicReadOrThrow({
    reader: "site-chrome",
    read: async () => {
      const payload = await getPayload({ config });
      const [settings, navigation] = await Promise.all([
        payload.findGlobal({ slug: "site-settings", depth: 0, overrideAccess: false, select: publicSiteSettingsSelect }),
        payload.findGlobal({ slug: "navigation", depth: 0, overrideAccess: false, select: publicNavigationSelect }),
      ]);

      return mapSiteChrome(settings, navigation);
    },
  });
}

export const getSiteChrome = unstable_cache(readSiteChrome, ["site-chrome"], {
  tags: ["site-settings", "navigation"],
});

export async function getSiteChromeOrFallback(): Promise<SiteChrome> {
  try {
    return await getSiteChrome();
  } catch (error) {
    if (isPublicReadOperationalError(error)) return fallbackSiteChrome;
    throw error;
  }
}
