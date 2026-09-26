export type HomeArticleDTO = { description: string; href: string; id: string; title: string };

export type HomeRegionCardDTO = {
  href: string;
  id: string;
  image: { alt: string; height: number; src: string; width: number };
  risk: string;
  thesis: string;
  title: string;
};

export type HomePageDTO = { articles: HomeArticleDTO[]; regions: HomeRegionCardDTO[] };
