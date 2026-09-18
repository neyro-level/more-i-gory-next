import "server-only";

import { unstable_cache } from "next/cache";
import { getPayload } from "payload";

import config from "../../../../payload.config.ts";
import { fallbackSiteChrome, mapSiteChrome } from "./site-chrome-contract.ts";
import type { SiteChrome } from "./site-chrome-contract.ts";

export { fallbackSiteChrome, mapSiteChrome };
export type { SiteChrome, SiteNavigationLink } from "./site-chrome-contract.ts";

async function readSiteChrome(): Promise<SiteChrome> {
  try {
    const payload = await getPayload({ config });
    const [settings, navigation] = await Promise.all([
      payload.findGlobal({ slug: "site-settings", depth: 0, overrideAccess: false }),
      payload.findGlobal({ slug: "navigation", depth: 0, overrideAccess: false }),
    ]);

    return mapSiteChrome(settings, navigation);
  } catch {
    return fallbackSiteChrome;
  }
}

export const getSiteChrome = unstable_cache(readSiteChrome, ["site-chrome"], {
  tags: ["site-settings", "navigation"],
});
