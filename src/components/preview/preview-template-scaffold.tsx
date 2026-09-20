import { SectionShell } from "@/components/layout/section-shell";
import { PageHero } from "@/components/marketing/page-hero";
import { ActionLink } from "@/components/navigation/action-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PreviewTemplateScaffoldProps = Readonly<{
  eyebrow: string;
  title: string;
  lead: string;
  plannedBlocks: readonly string[];
  backHref: string;
  backLabel: string;
}>;

export function PreviewTemplateScaffold({
  backHref,
  backLabel,
  eyebrow,
  lead,
  plannedBlocks,
  title,
}: PreviewTemplateScaffoldProps) {
  return (
    <main>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        lead={lead}
        primaryCta={{ href: backHref, label: backLabel }}
        secondaryCta={{ href: "/metodika/", label: "Открыть методику" }}
        image={{
          alt: "Технический макет страницы проекта Море и Горы",
          height: 1000,
          src: "/images/projects/sample-resort/cover.webp",
          width: 1478,
        }}
        proof="Технический preview: это не реальный объект и не публичное предложение. Страница закрыта от индексации."
      />

      <SectionShell
        eyebrow="Каркас для наполнения"
        title="Блоки, которые появятся после фактических данных"
        lead="Каркас нужен владельцу для просмотра структуры. Все названия, цифры, документы и выводы будут добавляться только из проверенных источников."
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plannedBlocks.map((block) => (
            <Card key={block} className="rounded-card bg-card">
              <CardHeader>
                <CardTitle className="text-h3">{block}</CardTitle>
              </CardHeader>
              <CardContent className="text-body-sm text-muted-foreground">
                Требует наполнения и проверки владельцем.
              </CardContent>
            </Card>
          ))}
        </div>
        <ActionLink href={backHref} variant="outline" className="mt-8">
          {backLabel}
        </ActionLink>
      </SectionShell>
    </main>
  );
}
