export type RegionRouteEntry = Readonly<{
  investmentThesis: string;
  key: string;
  kind: "locality" | "region" | "segment";
  lead: string;
  mediaSourceLabel: string;
  order: number;
  pageId: string;
  parentKey: string | null;
  primaryQuery: string;
  riskSummary: string;
  seoPriority: "P1" | "P2" | "P3";
  slug: string;
  status: "hidden" | "published" | "stub";
  title: string;
}>;

export type RegionInternalLink = Readonly<{
  href: string;
  label: string;
  relation: "child" | "methodology" | "objects" | "parent" | "sibling";
}>;

const investmentBase = "/investicionnaya-nedvizhimost";

export const regionRouteEntries = [
  {
    key: "krym",
    pageId: "PAGE-007",
    primaryQuery: "купить недвижимость в Крыму",
    slug: "krym",
    title: "Крым",
    kind: "region",
    parentKey: null,
    order: 10,
    status: "hidden",
    mediaSourceLabel: "media-region-krym",
    lead: "Черновик региональной страницы Крыма до утверждения контента владельцем.",
    investmentThesis: "Инвестиционная тезисная часть будет опубликована после проверки объектов, юридических ограничений и сценариев выхода.",
    riskSummary: "До публикации нельзя обещать доходность, рост стоимости или готовность конкретных предложений.",
    seoPriority: "P1",
  },
  {
    key: "yalta",
    pageId: "PAGE-008",
    primaryQuery: "купить квартиру в Ялте",
    slug: "yalta",
    title: "Ялта",
    kind: "locality",
    parentKey: "krym",
    order: 20,
    status: "hidden",
    mediaSourceLabel: "media-region-krym",
    lead: "Черновик страницы Ялты в крымском инвестиционном разделе.",
    investmentThesis: "Перед публикацией нужны проверенные предложения, правовая модель и понятный сценарий владения.",
    riskSummary: "Главный риск чернового этапа — подменить проверку объекта общим спросом на локацию.",
    seoPriority: "P1",
  },
  {
    key: "sevastopol",
    pageId: "PAGE-009",
    primaryQuery: "купить квартиру в Севастополе",
    slug: "sevastopol",
    title: "Севастополь",
    kind: "locality",
    parentKey: "krym",
    order: 30,
    status: "hidden",
    mediaSourceLabel: "media-region-krym",
    lead: "Черновик страницы Севастополя в крымском инвестиционном разделе.",
    investmentThesis: "Публикация требует подтверждённых объектов, юридического режима и спроса по выбранным форматам.",
    riskSummary: "Риск чернового этапа — смешать городской и курортный спрос без проверки конкретной экономики.",
    seoPriority: "P1",
  },
  {
    key: "evpatoriya",
    pageId: "PAGE-010",
    primaryQuery: "купить квартиру в Евпатории",
    slug: "evpatoriya",
    title: "Евпатория",
    kind: "locality",
    parentKey: "krym",
    order: 40,
    status: "hidden",
    mediaSourceLabel: "media-region-krym",
    lead: "Черновик страницы Евпатории в крымском инвестиционном разделе.",
    investmentThesis: "Контент будет опубликован после проверки сезонности, инфраструктуры и сценария выхода.",
    riskSummary: "До content gate нельзя превращать туристическую привлекательность в инвестиционное обещание.",
    seoPriority: "P2",
  },
  {
    key: "alushta",
    pageId: "PAGE-011",
    primaryQuery: "купить квартиру в Алуште",
    slug: "alushta",
    title: "Алушта",
    kind: "locality",
    parentKey: "krym",
    order: 50,
    status: "hidden",
    mediaSourceLabel: "media-region-krym",
    lead: "Черновик страницы Алушты в крымском инвестиционном разделе.",
    investmentThesis: "Перед публикацией нужны проверенные объекты, спрос, управление и ликвидность.",
    riskSummary: "Риск чернового этапа — принять курортный интерес за доказанную экономику объекта.",
    seoPriority: "P2",
  },
  {
    key: "krym-novostroyki",
    pageId: "PAGE-024",
    primaryQuery: "новостройки Крыма",
    slug: "novostroyki",
    title: "Новостройки Крыма",
    kind: "segment",
    parentKey: "krym",
    order: 60,
    status: "hidden",
    mediaSourceLabel: "media-region-krym",
    lead: "Черновик сегмента новостроек Крыма до утверждения объектов и критериев отбора.",
    investmentThesis: "Сегмент будет опубликован только после проверки проектов, сроков, документов и модели владения.",
    riskSummary: "Нельзя обещать рост цены или доходность без подтверждённой экономики и документов.",
    seoPriority: "P1",
  },
  {
    key: "krym-apartamenty",
    pageId: "PAGE-025",
    primaryQuery: "апартаменты в Крыму",
    slug: "apartamenty",
    title: "Апартаменты Крыма",
    kind: "segment",
    parentKey: "krym",
    order: 70,
    status: "hidden",
    mediaSourceLabel: "media-region-krym",
    lead: "Черновик сегмента апартаментов Крыма до утверждения форматов и юридической проверки.",
    investmentThesis: "Публикация требует проверки договора, эксплуатации, расходов, управления и выхода.",
    riskSummary: "Риск чернового этапа — принять рекламную доходность за проверяемый финансовый результат.",
    seoPriority: "P2",
  },
  {
    key: "arkhyz",
    pageId: "PAGE-012",
    primaryQuery: "купить апартаменты в Архызе",
    slug: "arkhyz",
    title: "Архыз",
    kind: "region",
    parentKey: null,
    order: 80,
    status: "hidden",
    mediaSourceLabel: "media-og-default",
    lead: "Черновик страницы Архыза до проверки объектов и курортной экономики.",
    investmentThesis: "Регион будет опубликован после подтверждения проектов, оператора, сезонности и сценариев выхода.",
    riskSummary: "До проверки нельзя считать инфраструктурный потенциал доказанной инвестиционной экономикой.",
    seoPriority: "P2",
  },
  {
    key: "altay",
    pageId: "PAGE-013",
    primaryQuery: "купить недвижимость на Алтае",
    slug: "altay",
    title: "Алтай",
    kind: "region",
    parentKey: null,
    order: 90,
    status: "hidden",
    mediaSourceLabel: "media-og-default",
    lead: "Черновик страницы Алтая до проверки правового режима, объектов и инфраструктуры.",
    investmentThesis: "Публикация требует подтверждённых предложений, управленческой модели и сценария выхода.",
    riskSummary: "До проверки нельзя подменять инвестиционные выводы общей туристической привлекательностью.",
    seoPriority: "P2",
  },
  {
    key: "sochi",
    pageId: "PAGE-003",
    primaryQuery: "недвижимость Сочи",
    slug: "sochi",
    title: "Сочи",
    kind: "region",
    parentKey: null,
    order: 100,
    status: "stub",
    mediaSourceLabel: "media-region-sochi",
    lead: "Регион в проработке: публичная страница остаётся заглушкой до нового решения по содержанию.",
    investmentThesis: "Сочи не индексируется в текущем контуре и не получает дочерние страницы до утверждения отдельного шаблона.",
    riskSummary: "Главный риск — вернуть старый SEO-кластер без актуального решения владельца.",
    seoPriority: "P3",
  },
] as const satisfies readonly RegionRouteEntry[];

export function getRegionRoutePath(entry: RegionRouteEntry, entries: readonly RegionRouteEntry[] = regionRouteEntries) {
  const byKey = new Map(entries.map((candidate) => [candidate.key, candidate]));
  const slugs = [entry.slug];
  let parentKey = entry.parentKey;

  while (parentKey) {
    const parent = byKey.get(parentKey);
    if (!parent) throw new Error(`Unknown parentKey "${parentKey}" for ${entry.key}.`);
    slugs.unshift(parent.slug);
    parentKey = parent.parentKey;
  }

  return `${investmentBase}/${slugs.join("/")}/`;
}

export function getRegionRoutePlan() {
  return regionRouteEntries.map((entry) => ({ ...entry, path: getRegionRoutePath(entry) }));
}

export function getRegionHubPlan() {
  return getRegionRoutePlan().filter((entry) => entry.status !== "stub");
}

export function getRegionRelatedLinks(entry: RegionRouteEntry): RegionInternalLink[] {
  const routePlan = getRegionRoutePlan();
  const visibleEntries = routePlan.filter((candidate) => candidate.status !== "stub");
  const links: RegionInternalLink[] = [];

  if (entry.parentKey) {
    const parent = visibleEntries.find((candidate) => candidate.key === entry.parentKey);
    if (parent) links.push({ href: parent.path, label: parent.title, relation: "parent" });
  }

  links.push(
    ...visibleEntries
      .filter((candidate) => candidate.parentKey === entry.key)
      .map((candidate) => ({ href: candidate.path, label: candidate.title, relation: "child" as const })),
  );

  if (entry.parentKey) {
    links.push(
      ...visibleEntries
        .filter((candidate) => candidate.parentKey === entry.parentKey && candidate.key !== entry.key)
        .map((candidate) => ({ href: candidate.path, label: candidate.title, relation: "sibling" as const })),
    );
  }

  links.push(
    { href: "/metodika/", label: "Методика отбора", relation: "methodology" },
    { href: "/obekty/", label: "Объекты", relation: "objects" },
  );

  if (entry.key === "krym-novostroyki") {
    links.push({ href: "/novostroyki/", label: "Каталог ЖК", relation: "objects" });
  }

  return links;
}

export function findRegionRouteBySegments(segments: readonly string[]) {
  const canonical = `${investmentBase}/${segments.join("/")}/`;
  return getRegionRoutePlan().find((entry) => entry.path === canonical) ?? null;
}
