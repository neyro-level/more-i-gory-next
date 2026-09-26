import { articleSchema } from "@more-i-gory/contracts";

export const articles = articleSchema.array().parse([
  {
    description:
      "Сравнение Сочи и Крыма для инвестиций в курортную недвижимость: особенности рынков, ограничения и вопросы до выбора объекта.",
    id: "article-sochi-ili-krym",
    path: "/analitika/sochi-ili-krym/",
    primaryQuery: "Сочи или Крым для инвестиций",
    relatedProjectIds: [],
    relatedRegionIds: ["region-sochi", "region-krym"],
    secondaryQueries: ["инвестиции в недвижимость Сочи или Крым", "курортная недвижимость Сочи Крым"],
    slug: "sochi-ili-krym",
    sourceIds: [],
    status: "draft",
    targetPageId: "PAGE-017",
    title: "Сочи или Крым для инвестиций — сравнение рынков",
  },
  {
    description:
      "Как оценивать чистую доходность курортной недвижимости после расходов, сезонности, налогов и управления.",
    id: "article-kak-schitat-chistuyu-dohodnost",
    path: "/analitika/kak-schitat-chistuyu-dohodnost/",
    primaryQuery: "как считать чистую доходность недвижимости",
    relatedProjectIds: [],
    relatedRegionIds: ["region-sochi", "region-krym"],
    secondaryQueries: ["чистая доходность апартаментов", "доходность недвижимости после расходов"],
    slug: "kak-schitat-chistuyu-dohodnost",
    sourceIds: [],
    status: "draft",
    targetPageId: "PAGE-017",
    title: "Как считать чистую доходность недвижимости | Море и Горы",
  },
  {
    description:
      "Ключевые риски курортных апартаментов: статус, оператор, договор управления, расходы и ликвидность.",
    id: "article-riski-kurortnyh-apartamentov",
    path: "/analitika/riski-kurortnyh-apartamentov/",
    primaryQuery: "риски курортных апартаментов",
    relatedProjectIds: [],
    relatedRegionIds: ["region-sochi", "region-krym"],
    secondaryQueries: ["риски апартаментов для инвестора", "апартаменты с управлением риски"],
    slug: "riski-kurortnyh-apartamentov",
    sourceIds: [],
    status: "draft",
    targetPageId: "PAGE-017",
    title: "Риски курортных апартаментов для инвестора | Море и Горы",
  },
  {
    description:
      "Как проверить оператора апартаментов, договор управления, комиссии, отчётность и ответственность сторон.",
    id: "article-kak-proverit-operatora",
    path: "/analitika/kak-proverit-operatora/",
    primaryQuery: "как проверить оператора апартаментов",
    relatedProjectIds: [],
    relatedRegionIds: ["region-sochi"],
    secondaryQueries: ["оператор апартаментов проверка", "договор управления апартаментами"],
    slug: "kak-proverit-operatora",
    sourceIds: [],
    status: "draft",
    targetPageId: "PAGE-017",
    title: "Как проверить оператора апартаментов | Море и Горы",
  },
  {
    description:
      "Ликвидность курортной недвижимости, горизонт владения и возможные сценарии выхода из объекта.",
    id: "article-likvidnost-i-vyhod",
    path: "/analitika/likvidnost-i-vyhod/",
    primaryQuery: "ликвидность инвестиционной недвижимости",
    relatedProjectIds: [],
    relatedRegionIds: ["region-sochi", "region-krym", "region-arkhyz", "region-altay"],
    secondaryQueries: ["как выйти из инвестиционной недвижимости", "ликвидность курортной недвижимости"],
    slug: "likvidnost-i-vyhod",
    sourceIds: [],
    status: "draft",
    targetPageId: "PAGE-017",
    title: "Ликвидность и выход из инвестиционной недвижимости | Море и Горы",
  },
]);

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug) ?? null;
}
