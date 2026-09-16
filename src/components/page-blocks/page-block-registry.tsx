import { SectionShell } from "@/components/layout/section-shell";
import { ActionLink } from "@/components/navigation/action-link";
import type { Page } from "@/payload-types";

type PageBlock = NonNullable<Page["blocks"]>[number];
type PageBlockType = PageBlock["blockType"];
type PageBlockByType<Type extends PageBlockType> = Extract<PageBlock, { blockType: Type }>;
type PageBlockComponent<Type extends PageBlockType> = (props: { block: PageBlockByType<Type> }) => React.ReactNode;
type PageBlockRegistry = {
  [Type in PageBlockType]: PageBlockComponent<Type>;
};

function TextBlock({ block }: { block: Extract<PageBlock, { blockType: "lead" }> }) {
  return <SectionShell eyebrow={block.eyebrow ?? undefined} title={block.title} lead={block.text} />;
}

function HeroBlock({ block }: { block: Extract<PageBlock, { blockType: "hero" }> }) {
  const primaryCta = block.primaryCta?.href && block.primaryCta.label ? { href: block.primaryCta.href, label: block.primaryCta.label } : null;
  const secondaryCta = block.secondaryCta?.href && block.secondaryCta.label ? { href: block.secondaryCta.href, label: block.secondaryCta.label } : null;

  return (
    <SectionShell headingLevel={1} eyebrow={block.eyebrow ?? undefined} title={block.title} lead={block.lead} tone="dark">
      <div className="mt-8 flex flex-wrap gap-3">
        {primaryCta ? <ActionLink href={primaryCta.href}>{primaryCta.label}</ActionLink> : null}
        {secondaryCta ? <ActionLink href={secondaryCta.href} variant="outline">{secondaryCta.label}</ActionLink> : null}
      </div>
      {block.proof ? <p className="mt-6 border-t pt-6 text-body-sm text-surface-dark-foreground/70">{block.proof}</p> : null}
    </SectionShell>
  );
}

function ThesisBlock({ block }: { block: Extract<PageBlock, { blockType: "thesis" }> }) {
  return (
    <SectionShell title={block.title}>
      <div className="grid gap-4 md:grid-cols-3">
        {block.items.map((item) => (
          <article key={item.id ?? item.title} className="rounded-card border p-5">
            <h3 className="text-body font-semibold">{item.title}</h3>
            <p className="mt-3 text-body-sm text-muted-foreground">{item.text}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function RiskBlockRenderer({ block }: { block: Extract<PageBlock, { blockType: "risk-block" }> }) {
  return (
    <SectionShell title={block.title}>
      <p className="border-l-2 border-action pl-4 text-body text-foreground">{block.text}</p>
    </SectionShell>
  );
}

function NumberedStepsBlock({ block }: { block: Extract<PageBlock, { blockType: "numbered-steps" }> }) {
  return (
    <SectionShell eyebrow={block.eyebrow ?? undefined} title={block.title} lead={block.lead ?? undefined}>
      <ol className="grid gap-4 md:grid-cols-3">
        {block.steps.map((step, index) => (
          <li key={step.id ?? step.title} className="rounded-card border p-5">
            <span className="text-caption text-action">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="mt-3 text-body font-semibold">{step.title}</h3>
            <p className="mt-3 text-body-sm text-muted-foreground">{step.text}</p>
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}

function ProofBlockRenderer({ block }: { block: Extract<PageBlock, { blockType: "proof-block" }> }) {
  return <SectionShell title={block.title} lead={block.proof} />;
}

function ScenarioTableBlock({ block }: { block: Extract<PageBlock, { blockType: "scenario-table" }> }) {
  return (
    <SectionShell title={block.title}>
      <div className="grid gap-3">
        {block.rows.map((row) => (
          <article key={row.id ?? row.scenario} className="grid gap-2 rounded-card border p-5 md:grid-cols-3">
            <h3 className="text-body font-semibold">{row.scenario}</h3>
            <p className="text-body-sm text-muted-foreground">{row.assumption}</p>
            <p className="text-body-sm text-foreground">{row.investorQuestion}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function CardsGridBlock({ block }: { block: Extract<PageBlock, { blockType: "cards-grid" }> }) {
  return (
    <SectionShell title={block.title} lead={block.lead ?? undefined}>
      <div className="grid gap-4 md:grid-cols-3">
        {block.cards.map((card) => (
          <article key={card.id ?? card.title} className="rounded-card border p-5">
            <h3 className="text-body font-semibold">{card.title}</h3>
            <p className="mt-3 text-body-sm text-muted-foreground">{card.text}</p>
            {card.link?.href && card.link.label ? <ActionLink href={card.link.href} variant="link" className="mt-4">{card.link.label}</ActionLink> : null}
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function ObjectCardsBlock({ block }: { block: Extract<PageBlock, { blockType: "object-cards" }> }) {
  return (
    <SectionShell title={block.title} lead={block.lead ?? undefined}>
      <div className="grid gap-4 md:grid-cols-3">
        {block.items.map((item) => (
          <article key={item.id ?? item.href} className="rounded-card border p-5">
            <p className="text-caption text-muted-foreground">{item.location} · {item.status}</p>
            <h3 className="mt-3 text-body font-semibold">{item.title}</h3>
            <p className="mt-3 text-body-sm text-muted-foreground">{item.thesis}</p>
            <p className="mt-3 border-l-2 border-action pl-3 text-body-sm">{item.risk}</p>
            <ActionLink href={item.href} variant="link" className="mt-4">Открыть паспорт</ActionLink>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

function CtaBlock({ block }: { block: Extract<PageBlock, { blockType: "cta" }> }) {
  return (
    <SectionShell title={block.title} lead={block.text} tone="dark">
      <div className="mt-8 flex flex-wrap gap-3">
        <ActionLink href={block.primaryCta.href}>{block.primaryCta.label}</ActionLink>
        {block.secondaryCta?.href && block.secondaryCta.label ? <ActionLink href={block.secondaryCta.href} variant="outline">{block.secondaryCta.label}</ActionLink> : null}
      </div>
    </SectionShell>
  );
}

function RichTextBlock({ block }: { block: Extract<PageBlock, { blockType: "rich-text" }> }) {
  void block;

  return <SectionShell title="Текстовый блок" lead="Rich text rendering is intentionally wired after the page content migration." />;
}

export const pageBlockRegistry = {
  hero: HeroBlock,
  lead: TextBlock,
  thesis: ThesisBlock,
  "risk-block": RiskBlockRenderer,
  "numbered-steps": NumberedStepsBlock,
  "proof-block": ProofBlockRenderer,
  "scenario-table": ScenarioTableBlock,
  "cards-grid": CardsGridBlock,
  "object-cards": ObjectCardsBlock,
  cta: CtaBlock,
  "rich-text": RichTextBlock,
} satisfies PageBlockRegistry;

function assertNever(block: never): never {
  throw new Error(`Unknown page block: ${JSON.stringify(block)}`);
}

export function renderPageBlock(block: PageBlock): React.ReactNode {
  switch (block.blockType) {
    case "hero": {
      const Component = pageBlockRegistry.hero;
      return <Component block={block} />;
    }
    case "lead": {
      const Component = pageBlockRegistry.lead;
      return <Component block={block} />;
    }
    case "thesis": {
      const Component = pageBlockRegistry.thesis;
      return <Component block={block} />;
    }
    case "risk-block": {
      const Component = pageBlockRegistry["risk-block"];
      return <Component block={block} />;
    }
    case "numbered-steps": {
      const Component = pageBlockRegistry["numbered-steps"];
      return <Component block={block} />;
    }
    case "proof-block": {
      const Component = pageBlockRegistry["proof-block"];
      return <Component block={block} />;
    }
    case "scenario-table": {
      const Component = pageBlockRegistry["scenario-table"];
      return <Component block={block} />;
    }
    case "cards-grid": {
      const Component = pageBlockRegistry["cards-grid"];
      return <Component block={block} />;
    }
    case "object-cards": {
      const Component = pageBlockRegistry["object-cards"];
      return <Component block={block} />;
    }
    case "cta": {
      const Component = pageBlockRegistry.cta;
      return <Component block={block} />;
    }
    case "rich-text": {
      const Component = pageBlockRegistry["rich-text"];
      return <Component block={block} />;
    }
    default:
      return assertNever(block);
  }
}
