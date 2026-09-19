import type { RegionRouteEntry } from "./region-route-plan.ts";

export type RegionSeedContent = Readonly<{
  investmentThesis: string;
  kind: "locality" | "region" | "segment";
  lead: string;
  mediaSourceLabel: string;
  order: number;
  primaryQuery: string;
  riskSummary: string;
  seoPriority: "P1" | "P2" | "P3";
  status: "hidden" | "published" | "stub";
  title: string;
}>;

export const regionSeedContent: Record<RegionRouteEntry["key"], RegionSeedContent> = {
  krym: {
    title: "Крым",
    kind: "region",
    order: 10,
    status: "hidden",
    mediaSourceLabel: "media-region-krym",
    lead: "Черновик региональной страницы Крыма до утверждения контента владельцем.",
    investmentThesis:
      "Инвестиционная тезисная часть будет опубликована после проверки объектов, юридических ограничений и сценариев выхода.",
    riskSummary: "До публикации нельзя обещать доходность, рост стоимости или готовность конкретных предложений.",
    seoPriority: "P1",
    primaryQuery: "купить недвижимость в Крыму",
  },
  yalta: {
    title: "Ялта",
    kind: "locality",
    order: 20,
    status: "hidden",
    mediaSourceLabel: "media-region-krym",
    lead: "Черновик страницы Ялты в крымском инвестиционном разделе.",
    investmentThesis: "Перед публикацией нужны проверенные предложения, правовая модель и понятный сценарий владения.",
    riskSummary: "Главный риск чернового этапа — подменить проверку объекта общим спросом на локацию.",
    seoPriority: "P1",
    primaryQuery: "купить квартиру в Ялте",
  },
  sevastopol: {
    title: "Севастополь",
    kind: "locality",
    order: 30,
    status: "hidden",
    mediaSourceLabel: "media-region-krym",
    lead: "Черновик страницы Севастополя в крымском инвестиционном разделе.",
    investmentThesis: "Публикация требует подтверждённых объектов, юридического режима и спроса по выбранным форматам.",
    riskSummary: "Риск чернового этапа — смешать городской и курортный спрос без проверки конкретной экономики.",
    seoPriority: "P1",
    primaryQuery: "купить квартиру в Севастополе",
  },
  evpatoriya: {
    title: "Евпатория",
    kind: "locality",
    order: 40,
    status: "hidden",
    mediaSourceLabel: "media-region-krym",
    lead: "Черновик страницы Евпатории в крымском инвестиционном разделе.",
    investmentThesis: "Контент будет опубликован после проверки сезонности, инфраструктуры и сценария выхода.",
    riskSummary: "До content gate нельзя превращать туристическую привлекательность в инвестиционное обещание.",
    seoPriority: "P2",
    primaryQuery: "купить квартиру в Евпатории",
  },
  alushta: {
    title: "Алушта",
    kind: "locality",
    order: 50,
    status: "hidden",
    mediaSourceLabel: "media-region-krym",
    lead: "Черновик страницы Алушты в крымском инвестиционном разделе.",
    investmentThesis: "Перед публикацией нужны проверенные объекты, спрос, управление и ликвидность.",
    riskSummary: "Риск чернового этапа — принять курортный интерес за доказанную экономику объекта.",
    seoPriority: "P2",
    primaryQuery: "купить квартиру в Алуште",
  },
  "krym-novostroyki": {
    title: "Новостройки Крыма",
    kind: "segment",
    order: 60,
    status: "hidden",
    mediaSourceLabel: "media-region-krym",
    lead: "Черновик сегмента новостроек Крыма до утверждения объектов и критериев отбора.",
    investmentThesis: "Сегмент будет опубликован только после проверки проектов, сроков, документов и модели владения.",
    riskSummary: "Нельзя обещать рост цены или доходность без подтверждённой экономики и документов.",
    seoPriority: "P1",
    primaryQuery: "новостройки Крыма",
  },
  "krym-apartamenty": {
    title: "Апартаменты Крыма",
    kind: "segment",
    order: 70,
    status: "hidden",
    mediaSourceLabel: "media-region-krym",
    lead: "Черновик сегмента апартаментов Крыма до утверждения форматов и юридической проверки.",
    investmentThesis: "Публикация требует проверки договора, эксплуатации, расходов, управления и выхода.",
    riskSummary: "Риск чернового этапа — принять рекламную доходность за проверяемый финансовый результат.",
    seoPriority: "P2",
    primaryQuery: "апартаменты в Крыму",
  },
  arkhyz: {
    title: "Архыз",
    kind: "region",
    order: 80,
    status: "hidden",
    mediaSourceLabel: "media-og-default",
    lead: "Черновик страницы Архыза до проверки объектов и курортной экономики.",
    investmentThesis: "Регион будет опубликован после подтверждения проектов, оператора, сезонности и сценариев выхода.",
    riskSummary: "До проверки нельзя считать инфраструктурный потенциал доказанной инвестиционной экономикой.",
    seoPriority: "P2",
    primaryQuery: "купить апартаменты в Архызе",
  },
  altay: {
    title: "Алтай",
    kind: "region",
    order: 90,
    status: "hidden",
    mediaSourceLabel: "media-og-default",
    lead: "Черновик страницы Алтая до проверки правового режима, объектов и инфраструктуры.",
    investmentThesis: "Публикация требует подтверждённых предложений, управленческой модели и сценария выхода.",
    riskSummary: "До проверки нельзя подменять инвестиционные выводы общей туристической привлекательностью.",
    seoPriority: "P2",
    primaryQuery: "купить недвижимость на Алтае",
  },
  sochi: {
    title: "Сочи",
    kind: "region",
    order: 100,
    status: "stub",
    mediaSourceLabel: "media-region-sochi",
    lead: "Регион в проработке: публичная страница остаётся заглушкой до нового решения по содержанию.",
    investmentThesis: "Сочи не индексируется в текущем контуре и не получает дочерние страницы до утверждения отдельного шаблона.",
    riskSummary: "Главный риск — вернуть старый SEO-кластер без актуального решения владельца.",
    seoPriority: "P3",
    primaryQuery: "недвижимость Сочи",
  },
};
