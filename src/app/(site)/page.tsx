import type { Metadata } from "next";

import { HomePageContent } from "@/components/pages/home/home-page-content";
import { getStaticMetadata } from "@/seo/metadata";
import { getSeoEntry } from "@/seo/registry";
import { analyticsDataAttributes } from "@/core/analytics/dimensions";
import { getHomePageModel } from "@/core/data-access/home-page";

const homeSeo = getSeoEntry("PAGE-001");

export const metadata: Metadata = {
  ...getStaticMetadata(homeSeo.pageId),
  title: { absolute: homeSeo.title },
};

export default async function HomePage() {
  const model = await getHomePageModel();
  return (
    <main id="main" {...analyticsDataAttributes({ page_key: "home", source_surface: "home" })}>
      <HomePageContent {...model} />
    </main>
  );
}
