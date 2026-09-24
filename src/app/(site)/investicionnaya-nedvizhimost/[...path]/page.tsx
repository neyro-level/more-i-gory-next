import { notFound, permanentRedirect } from "next/navigation";

import {
  getRegionRouteMetadata,
  getRegionRouteModel,
  RegionRoutePage,
} from "@/app/(site)/_shared/region-route-page";
import { composeLegacyRegionPathFromSlugs } from "@/content/regions/region-path-policy";
import { isEditorialPreviewRegion } from "@/core/data-access/preview/editorial-preview";
import { getUrlMigrationByCurrentPath } from "@/core/routing/url-migration-manifest";

export const dynamic = "force-dynamic";

type LegacyRegionRoutePageProps = {
  params: Promise<{ path?: string[] }>;
};

async function getLegacyRouteDecision(params: LegacyRegionRoutePageProps["params"]) {
  const { path = [] } = await params;
  let legacyPath: string;
  try {
    legacyPath = composeLegacyRegionPathFromSlugs(path);
  } catch {
    notFound();
  }

  const migration = getUrlMigrationByCurrentPath(legacyPath);
  if (!migration) notFound();
  return { legacyPath, migration };
}

async function materializeLegacyRedirect(target: string) {
  const region = await getRegionRouteModel(target);
  if (region && (region.status === "published" || isEditorialPreviewRegion(region))) {
    permanentRedirect(target);
  }
  notFound();
}

export async function generateMetadata({ params }: LegacyRegionRoutePageProps) {
  const { legacyPath, migration } = await getLegacyRouteDecision(params);
  if (migration.migrationAction !== "NOINDEX_RETAIN") return {};
  return getRegionRouteMetadata(legacyPath);
}

export default async function LegacyRegionRoutePage({ params }: LegacyRegionRoutePageProps) {
  const { legacyPath, migration } = await getLegacyRouteDecision(params);

  if (migration.migrationAction === "REDIRECT_301" && migration.targetUrl) {
    await materializeLegacyRedirect(migration.targetUrl);
  }

  if (migration.migrationAction !== "NOINDEX_RETAIN") notFound();
  return <RegionRoutePage path={legacyPath} />;
}
