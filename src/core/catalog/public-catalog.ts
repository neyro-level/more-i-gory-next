import type { PublicPropertyDTO } from "../dto/property.ts";

export const catalogFilterKeys = ["region", "city", "format", "budget", "strategy"] as const;
export const minimumFilterableCatalogSize = 8;

export type CatalogFilterKey = (typeof catalogFilterKeys)[number];
export type CatalogFilterQuery = Partial<Record<CatalogFilterKey, string>>;
export type CatalogFilterOption = Readonly<{ label: string; value: string }>;
export type CatalogFilterGroup = Readonly<{
  key: CatalogFilterKey;
  label: string;
  options: readonly CatalogFilterOption[];
}>;

const categoryLabels = {
  apartment: "Квартира",
  commercial: "Коммерческая недвижимость",
  house: "Дом",
  land: "Участок",
} as const;

export function getPropertyFormatLabel(property: Pick<PublicPropertyDTO, "category" | "market">): string | undefined {
  if (property.category) return categoryLabels[property.category];
  if (property.market === "newbuild") return "Новостройка";
  if (property.market === "secondary") return "Вторичная недвижимость";
}

function factValue(property: PublicPropertyDTO, labels: readonly string[]): string | undefined {
  const accepted = new Set(labels.map((label) => label.toLocaleLowerCase("ru-RU")));
  return property.facts.find((fact) => accepted.has(fact.label.trim().toLocaleLowerCase("ru-RU")))?.value.trim();
}

function propertyFilterValue(property: PublicPropertyDTO, key: CatalogFilterKey): CatalogFilterOption | null {
  switch (key) {
    case "region":
      return { label: property.geoContext.region.title, value: property.geoContext.region.slug };
    case "city":
      return property.geoContext.cityOrArea
        ? { label: property.geoContext.cityOrArea.title, value: property.geoContext.cityOrArea.slug }
        : null;
    case "format": {
      const label = getPropertyFormatLabel(property);
      const value = property.category ?? (property.market ? `market:${property.market}` : undefined);
      return label && value ? { label, value } : null;
    }
    case "budget": {
      const value = property.budgetNote?.trim() || factValue(property, ["Бюджет", "Бюджет входа"]);
      return value ? { label: value, value } : null;
    }
    case "strategy": {
      const value = factValue(property, ["Стратегия", "Инвестиционная стратегия"]);
      return value ? { label: value, value } : null;
    }
  }
}

function uniqueOptions(properties: readonly PublicPropertyDTO[], key: CatalogFilterKey): CatalogFilterOption[] {
  const options = new Map<string, CatalogFilterOption>();
  for (const property of properties) {
    const option = propertyFilterValue(property, key);
    if (option) options.set(option.value, option);
  }
  return [...options.values()].sort((left, right) => left.label.localeCompare(right.label, "ru-RU"));
}

const filterLabels: Record<CatalogFilterKey, string> = {
  region: "Регион",
  city: "Город или район",
  format: "Формат",
  budget: "Бюджет",
  strategy: "Стратегия",
};

export function buildCatalogFilterGroups(properties: readonly PublicPropertyDTO[]): CatalogFilterGroup[] {
  if (properties.length < minimumFilterableCatalogSize) return [];

  return catalogFilterKeys.flatMap((key) => {
    const options = uniqueOptions(properties, key);
    return options.length > 1 ? [{ key, label: filterLabels[key], options }] : [];
  });
}

export function parseCatalogFilterQuery(
  source: Readonly<Record<string, string | string[] | undefined>>,
): CatalogFilterQuery {
  return Object.fromEntries(catalogFilterKeys.flatMap((key) => {
    const raw = source[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    return typeof value === "string" && value.trim() ? [[key, value.trim()]] : [];
  }));
}

export function hasCatalogQueryState(
  source: Readonly<Record<string, string | string[] | undefined>>,
): boolean {
  return Object.keys(source).length > 0;
}

export function filterCatalogProperties(
  properties: readonly PublicPropertyDTO[],
  query: CatalogFilterQuery,
  groups: readonly CatalogFilterGroup[] = buildCatalogFilterGroups(properties),
): readonly PublicPropertyDTO[] {
  const allowed = new Map(groups.map((group) => [group.key, new Set(group.options.map((option) => option.value))]));
  const active = Object.entries(query).filter(
    (entry): entry is [CatalogFilterKey, string] => allowed.get(entry[0] as CatalogFilterKey)?.has(entry[1]) === true,
  );

  if (active.length === 0) return properties;
  return properties.filter((property) => active.every(([key, value]) => propertyFilterValue(property, key)?.value === value));
}
