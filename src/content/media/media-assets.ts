import { mediaAssetSchema } from "@more-i-gory/contracts";

export const mediaAssets = mediaAssetSchema.array().parse([
  {
    alt: "Панорамный вид курортного побережья для сайта Море и Горы",
    decorative: false,
    height: 1524,
    id: "media-og-default",
    kind: "og",
    src: "/images/og/default.webp",
    width: 2560,
  },
  {
    alt: "Побережье Сочи как регион для инвестиций в курортную недвижимость",
    decorative: false,
    height: 1877,
    id: "media-region-sochi",
    kind: "region",
    src: "/images/regions/sochi-coast.webp",
    width: 1408,
  },
  {
    alt: "Крымское побережье как регион для инвестиций в недвижимость",
    decorative: false,
    height: 1232,
    id: "media-region-krym",
    kind: "region",
    src: "/images/regions/crimea-coast.webp",
    width: 2189,
  },
  {
    alt: "Черновая обложка инвестиционного паспорта курортного проекта",
    decorative: false,
    height: 1000,
    id: "media-project-sample-cover",
    kind: "project",
    src: "/images/projects/sample-resort/cover.webp",
    width: 1478,
  },
]);

export function getMediaAsset(id: string) {
  return mediaAssets.find((asset) => asset.id === id) ?? null;
}
