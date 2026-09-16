import type { Block, Field } from "payload";

const linkFields: Field[] = [
  { name: "label", type: "text", required: true },
  { name: "href", type: "text", required: true },
];

const optionalLinkFields: Field[] = [
  { name: "label", type: "text" },
  { name: "href", type: "text" },
];

const imageFields: Field[] = [
  { name: "imagePath", type: "text" },
  { name: "imageAlt", type: "text" },
];

export const heroBlock: Block = {
  slug: "hero",
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text", required: true },
    { name: "lead", type: "textarea", required: true },
    { name: "primaryCta", type: "group", fields: optionalLinkFields },
    { name: "secondaryCta", type: "group", fields: optionalLinkFields },
    { name: "proof", type: "textarea" },
    ...imageFields,
  ],
};

export const leadBlock: Block = {
  slug: "lead",
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text", required: true },
    { name: "text", type: "textarea", required: true },
  ],
};

export const thesisBlock: Block = {
  slug: "thesis",
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "items",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "text", type: "textarea", required: true },
      ],
      minRows: 1,
      required: true,
    },
  ],
};

export const riskBlock: Block = {
  slug: "risk-block",
  fields: [
    { name: "title", type: "text", required: true },
    { name: "text", type: "textarea", required: true },
  ],
};

export const numberedStepsBlock: Block = {
  slug: "numbered-steps",
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text", required: true },
    { name: "lead", type: "textarea" },
    {
      name: "steps",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "text", type: "textarea", required: true },
      ],
      minRows: 1,
      required: true,
    },
  ],
};

export const proofBlock: Block = {
  slug: "proof-block",
  fields: [
    { name: "title", type: "text", required: true },
    { name: "proof", type: "textarea", required: true },
  ],
};

export const scenarioTableBlock: Block = {
  slug: "scenario-table",
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "rows",
      type: "array",
      fields: [
        { name: "scenario", type: "text", required: true },
        { name: "assumption", type: "textarea", required: true },
        { name: "investorQuestion", type: "textarea", required: true },
      ],
      minRows: 1,
      required: true,
    },
  ],
};

export const cardsGridBlock: Block = {
  slug: "cards-grid",
  fields: [
    { name: "title", type: "text", required: true },
    { name: "lead", type: "textarea" },
    {
      name: "cards",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "text", type: "textarea", required: true },
        { name: "link", type: "group", fields: optionalLinkFields },
      ],
      minRows: 1,
      required: true,
    },
  ],
};

export const objectCardsBlock: Block = {
  slug: "object-cards",
  fields: [
    { name: "title", type: "text", required: true },
    { name: "lead", type: "textarea" },
    {
      name: "items",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "href", type: "text", required: true },
        { name: "location", type: "text", required: true },
        { name: "status", type: "text", required: true },
        { name: "thesis", type: "textarea", required: true },
        { name: "risk", type: "textarea", required: true },
        ...imageFields,
      ],
      minRows: 1,
      required: true,
    },
  ],
};

export const ctaBlock: Block = {
  slug: "cta",
  fields: [
    { name: "title", type: "text", required: true },
    { name: "text", type: "textarea", required: true },
    { name: "primaryCta", type: "group", fields: linkFields },
    { name: "secondaryCta", type: "group", fields: optionalLinkFields },
  ],
};

export const richTextBlock: Block = {
  slug: "rich-text",
  fields: [{ name: "content", type: "richText", required: true }],
};

export const pageBlocks = [
  heroBlock,
  leadBlock,
  thesisBlock,
  riskBlock,
  numberedStepsBlock,
  proofBlock,
  scenarioTableBlock,
  cardsGridBlock,
  objectCardsBlock,
  ctaBlock,
  richTextBlock,
] as const satisfies readonly Block[];

export const pageBlockTypes = pageBlocks.map((block) => block.slug);
