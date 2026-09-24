import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProjectPassportTemplate } from "@/components/templates/project-passport-template";
import { articles } from "@/content/articles/articles";
import {
  getArchivedPropertyAction,
  getManualPropertyRouteBySlug,
  listPublishedManualProperties,
} from "@/core/data-access/public";
import { selectRelatedArticles, selectRelatedProjects } from "@/core/projects/project-context";
import { buildPassportPageMetadata, passportStructuredData } from "@/seo/passport-metadata";
import { materializeSeoHttpState } from "@/seo/http-lifecycle";
import { resolveSeoState } from "@/seo/seo-state";

type ProjectPassportPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProjectPassportPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getManualPropertyRouteBySlug(slug);

  if (!property) {
    return {};
  }

  if (property.status === "archived") {
    const published = await listPublishedManualProperties();
    const action = getArchivedPropertyAction(property, new Date(), published);
    if (action.kind === "gone") {
      return {
        ...buildPassportPageMetadata(property),
        robots: { follow: false, index: false },
      };
    }
  }

  return buildPassportPageMetadata(property);
}

export default async function ProjectPassportPage({ params }: ProjectPassportPageProps) {
  const { slug } = await params;
  const property = await getManualPropertyRouteBySlug(slug);

  if (!property) {
    notFound();
  }

  const published = await listPublishedManualProperties();
  const archivedAction = getArchivedPropertyAction(property, new Date(), published);
  if (archivedAction.kind === "redirect") {
    materializeSeoHttpState(resolveSeoState({
      canonical: property.path,
      redirectIntent: { status: archivedAction.status, target: archivedAction.target },
    }));
  }

  if (archivedAction.kind === "gone") {
    materializeSeoHttpState(resolveSeoState({ canonical: property.path, lifecycle: "gone" }));
  }

  const relatedProjects = selectRelatedProjects(property, published);
  const relatedArticles = selectRelatedArticles(property, articles);

  const structuredData = passportStructuredData(property);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <ProjectPassportTemplate
        property={property}
        relatedArticles={relatedArticles}
        relatedProjects={relatedProjects}
      />
    </>
  );
}
