import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

import { ProjectPassportTemplate } from "@/components/templates/project-passport-template";
import {
  getArchivedPropertyAction,
  getManualPropertyRouteBySlug,
  listManualPropertyRouteSlugs,
  listPublishedManualProperties,
} from "@/core/data-access/public";

type ProjectPassportPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const slugs = await listManualPropertyRouteSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPassportPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getManualPropertyRouteBySlug(slug);

  if (!property) {
    return {};
  }

  if (property.status === "archived") {
    return {
      alternates: {
        canonical: property.path,
      },
      description: `${property.title}: объект больше не актуален. Можно посмотреть релевантные альтернативы или запросить персональную подборку.`,
      robots: {
        follow: true,
        index: false,
      },
      title: `${property.title} — объект не актуален | Море и Горы`,
    };
  }

  return {
    alternates: {
      canonical: property.path,
    },
    description: property.description ?? property.verdict,
    title: `${property.title} — купить, цены и инвестиции | Море и Горы`,
  };
}

export default async function ProjectPassportPage({ params }: ProjectPassportPageProps) {
  const { slug } = await params;
  const property = await getManualPropertyRouteBySlug(slug);

  if (!property) {
    notFound();
  }

  const archivedAction = getArchivedPropertyAction(property);
  if (archivedAction.kind === "redirect") {
    permanentRedirect(archivedAction.target);
  }

  const alternatives = property.status === "archived" ? (await listPublishedManualProperties()).filter((candidate) => candidate.slug !== property.slug).slice(0, 3) : [];

  return <ProjectPassportTemplate alternatives={alternatives} property={property} />;
}
