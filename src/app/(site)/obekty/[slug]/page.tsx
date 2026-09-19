import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";

import { SectionShell } from "@/components/layout/section-shell";
import { ProjectPassportTemplate } from "@/components/templates/project-passport-template";
import {
  getArchivedPropertyAction,
  getManualPropertyRouteBySlug,
  listManualPropertyRouteSlugs,
  listPublishedManualProperties,
} from "@/core/data-access/public";
import { buildPassportPageMetadata, passportStructuredData } from "@/seo/passport-metadata";

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

  const published = property.status === "archived" ? await listPublishedManualProperties() : [];
  const archivedAction = getArchivedPropertyAction(property, new Date(), published);
  if (archivedAction.kind === "redirect") {
    permanentRedirect(archivedAction.target);
  }

  if (archivedAction.kind === "gone") {
    return (
      <main data-archive-status="410">
        <SectionShell
          eyebrow="Документ снят"
          headingLevel={1}
          lead="Инвестиционный паспорт больше не публикуется. Однозначной замены нет, поэтому страница закрыта статусом 410 вместо массового редиректа на каталог."
          title={property.title}
        />
      </main>
    );
  }

  const alternatives = property.status === "archived" ? published.filter((candidate) => candidate.slug !== property.slug).slice(0, 3) : [];

  const structuredData = passportStructuredData(property);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />
      <ProjectPassportTemplate alternatives={alternatives} property={property} />
    </>
  );
}
